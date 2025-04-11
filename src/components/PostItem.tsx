import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaRegComment, FaRetweet, FaRegHeart, FaHeart, FaShareAlt, FaEllipsisH } from "react-icons/fa";
import { Post } from "../types/post";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import DefaultAvatar from "./DefaultAvatar";
import { useAuth } from "../contexts/AuthContext";
import { deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";
import EditPostModal from "./EditPostModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface PostItemProps {
  post: Post;
  onPostUpdate: (updatedPost: Post) => void;
  onPostDelete: (postId: string) => void;
}

export default function PostItem({ post, onPostUpdate, onPostDelete }: PostItemProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 모달이 열렸을 때 스크롤 방지
  useEffect(() => {
    if (showEditModal || showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showEditModal, showDeleteModal]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: Implement like functionality
  };

  const handleDelete = async () => {
    try {
      // 미디어 파일 삭제
      await Promise.all(
        post.mediaUrls.map(async (url) => {
          const storageRef = ref(storage, url);
          await deleteObject(storageRef);
        })
      );

      // 게시물 삭제
      await deleteDoc(doc(db, "posts", post.id));
      onPostDelete(post.id);
    } catch (error) {
      console.error("게시물 삭제 중 오류가 발생했습니다:", error);
    }
  };

  const isAuthor = user?.uid === post.authorId;

  return (
    <>
      <article className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <div className="flex gap-4">
          <Link to={`/profile/${post.authorUsername}`}>
            {post.authorPhotoURL ? (
              <img
                src={post.authorPhotoURL}
                alt={post.authorDisplayName}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <DefaultAvatar />
            )}
          </Link>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${post.authorUsername}`} className="font-bold hover:underline">
                  {post.authorDisplayName}
                </Link>
                <span className="text-gray-500">@{post.authorUsername}</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">
                  {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ko })}
                </span>
              </div>
              
              {isAuthor && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <FaEllipsisH className="text-gray-500" />
                  </button>
                  
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowEditModal(true);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors"
                        >
                          수정하기
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setShowDeleteModal(true);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-red-500"
                        >
                          삭제하기
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <p className="mt-2 text-gray-900">{post.content}</p>
            
            {post.mediaUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {post.mediaUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="rounded-lg w-full h-full object-cover"
                  />
                ))}
              </div>
            )}

            <div className="flex justify-between mt-4 text-gray-500 max-w-md">
              <button className="flex items-center gap-2 hover:text-blue-500">
                <FaRegComment />
                <span>0</span>
              </button>
              <button className="flex items-center gap-2 hover:text-green-500">
                <FaRetweet />
                <span>0</span>
              </button>
              <button 
                className="flex items-center gap-2 hover:text-red-500"
                onClick={handleLike}
              >
                {isLiked ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart />
                )}
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-blue-500">
                <FaShareAlt />
              </button>
            </div>
          </div>
        </div>
      </article>

      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onUpdate={onPostUpdate}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          onConfirm={() => {
            handleDelete();
            setShowDeleteModal(false);
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}