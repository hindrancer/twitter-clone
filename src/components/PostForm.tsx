import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FaImage } from "react-icons/fa";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import DefaultAvatar from "./DefaultAvatar";
import { Post } from "../types/post";

function GifIcon() {
  return (
    <div className="w-6 h-6 flex items-center justify-center font-bold text-[#1d9bf0] border-2 border-current rounded text-xs">
      GIF
    </div>
  );
}

interface PostFormProps {
  onPostCreated: (newPost: Post) => void;
}

export default function PostForm({ onPostCreated }: PostFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [username, setUsername] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gifInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    };
    fetchUsername();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading || !user) return;

    try {
      setLoading(true);
      
      // 이미지 업로드
      const mediaUrls = await Promise.all(
        mediaFiles.map(async (file) => {
          const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}-${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          return getDownloadURL(snapshot.ref);
        })
      );

      // 게시물 작성
      const postData = {
        authorId: user.uid,
        content,
        mediaUrls,
        createdAt: new Date(),
        likes: 0,
        authorDisplayName: user.displayName || "Unknown",
        authorUsername: username || "unknown",
        authorPhotoURL: user.photoURL,
      };

      const docRef = await addDoc(collection(db, "posts"), postData);
      
      // 새 게시물을 상위 컴포넌트에 전달
      onPostCreated({
        id: docRef.id,
        authorId: user.uid,
        content,
        mediaUrls,
        createdAt: new Date(),
        likes: 0,
        authorDisplayName: user.displayName || "Unknown",
        authorUsername: username || "unknown",
        authorPhotoURL: user.photoURL || "",
      });

      // 폼 초기화
      setContent("");
      setMediaFiles([]);
    } catch (error) {
      console.error("게시물 작성 중 오류가 발생했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isGif = false) => {
    const files = Array.from(e.target.files || []);
    
    // 파일 형식 검사
    const invalidFiles = files.filter(file => {
      if (isGif) {
        return file.type !== 'image/gif';
      }
      return !['image/jpeg', 'image/png'].includes(file.type);
    });

    if (invalidFiles.length > 0) {
      alert(isGif ? 'GIF 파일만 첨부할 수 있습니다.' : 'PNG, JPEG 파일만 첨부할 수 있습니다.');
      return;
    }

    if (files.length + mediaFiles.length > 4) {
      alert("이미지는 최대 4개까지 첨부할 수 있습니다.");
      return;
    }
    setMediaFiles([...mediaFiles, ...files]);
  };

  return (
    <div className="border-b border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <DefaultAvatar />
          )}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="무슨 일이 일어나고 있나요?"
              className="w-full min-h-[100px] resize-none border-none focus:ring-0 text-xl"
              maxLength={140}
            />
            
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="rounded-lg w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaFiles(mediaFiles.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#1d9bf0] hover:bg-blue-50 p-2 rounded-full transition-colors"
                >
                  <FaImage className="text-xl" />
                </button>
                <button
                  type="button"
                  onClick={() => gifInputRef.current?.click()}
                  className="hover:bg-blue-50 p-2 rounded-full transition-colors"
                >
                  <GifIcon />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileSelect(e, false)}
                  accept="image/png,image/jpeg"
                  multiple
                  className="hidden"
                />
                <input
                  type="file"
                  ref={gifInputRef}
                  onChange={(e) => handleFileSelect(e, true)}
                  accept="image/gif"
                  multiple
                  className="hidden"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-gray-500">
                  {content.length}/140
                </span>
                <button
                  type="submit"
                  disabled={!content.trim() || isLoading}
                  className="bg-[#1d9bf0] text-white px-4 py-2 rounded-full hover:bg-[#1a8cd8] transition-colors disabled:opacity-50"
                >
                  {isLoading ? "게시 중..." : "게시하기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 