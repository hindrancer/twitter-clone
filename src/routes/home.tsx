import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import PostForm from "../components/PostForm";
import Timeline from "../components/Timeline";
import { Post } from "../types/post";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // 새 게시물이 생성되면 Timeline 컴포넌트의 실시간 리스너가 자동으로 처리하므로
  // handleNewPost는 더 이상 필요하지 않습니다.
  const handleNewPost = () => {
    // 실시간 리스너가 처리하므로 여기서는 아무것도 하지 않습니다.
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* 왼쪽 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 ml-72 min-h-screen border-l border-r border-gray-200 max-w-2xl">
        {/* 헤더 */}
        <header className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-blur-md border-b border-gray-200">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold">홈</h1>
          </div>
        </header>

        {/* 게시물 작성 폼 */}
        <PostForm onPostCreated={handleNewPost} />
        <Timeline posts={posts} setPosts={setPosts} />
      </main>

      {/* 오른쪽 사이드바 (추후 구현) */}
      <div className="w-[350px] hidden lg:block">
        {/* TODO: Implement right sidebar */}
      </div>
    </div>
  );
} 