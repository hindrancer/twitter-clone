import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup,
  updateProfile 
} from "firebase/auth";
import { auth } from "../firebase";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import UsernameModal from "../components/UsernameModal";

export default function Signup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: inputName, value } = e.target;
    if (inputName === "email") setEmail(value);
    else if (inputName === "password") setPassword(value);
    else if (inputName === "name") setName(value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (isLoading || email === "" || password === "" || name === "") return;
    try {
      setLoading(true);
      // 1. 이메일/비밀번호로 계정 생성
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      // 2. 사용자 프로필 업데이트 (이름 추가)
      await updateProfile(credentials.user, {
        displayName: name
      });
      // 3. 사용자 ID 입력 모달 표시
      setShowUsernameModal(true);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const socialSignup = async (provider: GoogleAuthProvider | GithubAuthProvider) => {
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      setShowUsernameModal(true);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 이미 로그인한 사용자이고 사용자 ID 설정이 완료된 경우에만 홈으로 리다이렉트
  if (user?.displayName?.startsWith("@") && !showUsernameModal) {
    navigate("/");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {(showUsernameModal || (user && !user.displayName?.startsWith("@"))) ? (
        <UsernameModal onComplete={() => {
          setShowUsernameModal(false);
          navigate("/");
        }} />
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-8">회원가입</h1>
          <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
            <input
              name="name"
              type="text"
              placeholder="이름"
              value={name}
              onChange={onChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
              minLength={2}
              maxLength={20}
            />
            <input
              name="email"
              type="email"
              placeholder="이메일"
              value={email}
              onChange={onChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={onChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
              minLength={6}
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isLoading}
            >
              {isLoading ? "가입 중..." : "가입하기"}
            </button>
          </form>

          <div className="mt-4 space-y-2 w-full max-w-md">
            <button
              onClick={() => socialSignup(new GoogleAuthProvider())}
              className="w-full flex items-center justify-center gap-2 bg-white border py-2 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              <FaGoogle /> Google로 회원가입
            </button>
            <button
              onClick={() => socialSignup(new GithubAuthProvider())}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900"
              disabled={isLoading}
            >
              <FaGithub /> Github로 회원가입
            </button>
          </div>

          {error !== "" && (
            <p className="text-red-500 mt-4">{error}</p>
          )}

          <p className="mt-4">
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              로그인
            </Link>
          </p>
        </>
      )}
    </div>
  );
} 