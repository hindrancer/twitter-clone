import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, startAfter, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Post } from "../types/post";
import PostItem from "./PostItem";
import { useAuth } from "../contexts/AuthContext";

interface TimelineProps {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  fetchPosts?: boolean; // 게시물을 자동으로 가져올지 여부 (프로필 페이지에서는 false)
}

export default function Timeline({ posts, setPosts, fetchPosts = true }: TimelineProps) {
  const [isLoading, setLoading] = useState(fetchPosts); // fetchPosts가 false면 로딩 상태도 false로 초기화
  const [lastVisible, setLastVisible] = useState<any>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    // fetchPosts가 false면 게시물을 자동으로 가져오지 않음 (프로필 페이지에서 사용)
    if (!fetchPosts) {
      setLoading(false);
      return;
    }

    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      orderBy("createdAt", "desc"),
      limit(10)
    );

    // 실시간 리스너 설정
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => {
        const data = doc.data();
        const post = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate()
        } as Post;

        if (
          currentUser &&
          currentUser.photoURL &&
          post.authorId === currentUser.uid &&
          post.authorPhotoURL !== currentUser.photoURL
        ) {
          post.authorPhotoURL = currentUser.photoURL;
        }
        return post;
      });
      
      setPosts(newPosts);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setLoading(false);
    });

    // 컴포넌트 언마운트 시 리스너 정리
    return () => unsubscribe();
  }, [fetchPosts, setPosts, currentUser]);

  const loadMore = async () => {
    if (!lastVisible || !currentUser) return;

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
      
      const newPosts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const post = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate()
        } as Post;

        if (
          currentUser &&
          currentUser.photoURL &&
          post.authorId === currentUser.uid &&
          post.authorPhotoURL !== currentUser.photoURL
        ) {
          post.authorPhotoURL = currentUser.photoURL;
        }
        return post;
      });

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

  // 게시물이 없을 때 메시지 표시
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <h3 className="text-xl font-bold mb-2">게시물이 없습니다</h3>
        <p>아직 게시물이 없습니다. 첫 번째 게시물을 작성해보세요!</p>
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
      {lastVisible && fetchPosts && ( // 자동 로드된 게시물이 있을 때만 더 보기 버튼 표시
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