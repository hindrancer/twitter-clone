import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import CreatePostModal from "./CreatePostModal";

export default function Layout() {
  // Move modal state management here from Home.tsx
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // Move modal scroll lock effect here from Home.tsx
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
    // Maybe trigger a refetch or update mechanism if needed globally
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar 
        showCreatePostModal={showCreatePostModal} 
        setShowCreatePostModal={setShowCreatePostModal} 
      />
      {/* Main content area - Outlet renders the matched route component */}
      <div className="flex-1 ml-72">
        <Outlet />
      </div>

      {/* Render the modal globally within the layout */}
      {showCreatePostModal && (
        <CreatePostModal
          onClose={() => setShowCreatePostModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
} 