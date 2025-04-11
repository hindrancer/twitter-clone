import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import Timeline from "../components/Timeline";
import { Post } from "../types/post";
import PostForm from "../components/PostForm";
import CreatePostModal from "../components/CreatePostModal";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (showCreatePostModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showCreatePostModal]);

  const handlePostCreated = () => {
    setShowCreatePostModal(false);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar 
        showCreatePostModal={showCreatePostModal} 
        setShowCreatePostModal={setShowCreatePostModal} 
      />

      <main className="flex-1 ml-72 min-h-screen border-l border-r border-gray-200 max-w-2xl">
        {!showCreatePostModal && (
          <header className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-blur-md border-b border-gray-200">
            <div className="px-4 py-3">
              <h1 className="text-xl font-bold">홈</h1>
            </div>
          </header>
        )}

        <PostForm onPostCreated={() => {}} />

        <Timeline posts={posts} setPosts={setPosts} />
      </main>

      <div className="w-[350px] hidden lg:block">
        {/* TODO: Implement right sidebar */}
      </div>

      {showCreatePostModal && (
        <CreatePostModal
          onClose={() => setShowCreatePostModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
} 