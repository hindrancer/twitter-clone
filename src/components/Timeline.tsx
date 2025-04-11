import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, startAfter, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Post } from "../types/post";
import PostItem from "./PostItem";
import DefaultAvatar from "./DefaultAvatar";

interface TimelineProps {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
}

export default function Timeline({ posts, setPosts }: TimelineProps) {
  const [isLoading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);

  useEffect(() => {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      orderBy("createdAt", "desc"),
      limit(10)
    );

    // 실시간 리스너 설정
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Post[];
      
      setPosts(newPosts);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setLoading(false);
    });

    // 컴포넌트 언마운트 시 리스너 정리
    return () => unsubscribe();
  }, []);

  const loadMore = async () => {
    if (!lastVisible) return;

    try {
      const postsRef = collection(db, "posts");
      const q = query(
        postsRef,
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      const newPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Post[];

      setPosts([...posts, ...newPosts]);
      setLastVisible(lastDoc);
    } catch (error) {
      console.error("추가 게시물을 불러오는 중 오류가 발생했습니다:", error);
    }
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handlePostDelete = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          onPostUpdate={handlePostUpdate}
          onPostDelete={handlePostDelete}
        />
      ))}
      {lastVisible && (
        <div className="p-4 text-center">
          <button
            onClick={loadMore}
            className="text-[#1d9bf0] hover:text-[#1a8cd8]"
          >
            더 보기
          </button>
        </div>
      )}
    </div>
  );
} 