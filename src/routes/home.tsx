import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Timeline from "../components/Timeline";
import { Post } from "../types/post";
import PostForm from "../components/PostForm";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen border-l border-r border-gray-200 max-w-2xl">
      <header className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold">홈</h1>
        </div>
      </header>

      <PostForm onPostCreated={() => {}} />

      <Timeline posts={posts} setPosts={setPosts} fetchPosts={true} />
    </div>
  );
} 