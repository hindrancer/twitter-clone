import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface UsernameModalProps {
  onComplete: () => void;
}

export default function UsernameModal({ onComplete }: UsernameModalProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim() || isLoading) return;

    try {
      setLoading(true);
      setError("");
      
      // 영문, 숫자, 언더스코어만 허용하는 정규식
      const usernameRegex = /^[A-Za-z0-9_]+$/;
      if (!usernameRegex.test(username)) {
        setError("영문, 숫자, 언더스코어만 사용 가능합니다");
        return;
      }

      // 현재 로그인된 사용자가 있는지 확인
      const user = auth.currentUser;
      if (!user) {
        setError("사용자를 찾을 수 없습니다");
        return;
      }

      // Firestore에 사용자 정보 저장
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        username: username,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });

      onComplete();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">사용자 ID 설정</h2>
        <p className="text-gray-600 mb-4">
          사용할 ID를 입력해주세요. (영문, 숫자, 언더스코어만 사용 가능)
        </p>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center w-full px-4 py-2 border rounded-lg bg-white">
            <span className="text-gray-500">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="flex-1 outline-none ml-1"
              required
              pattern="[A-Za-z0-9_]+"
              title="영문, 숫자, 언더스코어만 사용 가능합니다"
            />
          </div>
          
          {error && <p className="text-red-500">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? "저장 중..." : "저장하기"}
          </button>
        </form>
      </div>
    </div>
  );
} 