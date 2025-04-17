import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { Post } from "../types/post";
import { UserProfile } from "../types/user.d"; // .d.ts 확장자 명시
import DefaultAvatar from "../components/DefaultAvatar";
import Timeline from "../components/Timeline";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import { format } from 'date-fns';
import ProfileSetupModal from "../components/ProfileSetupModal"; // 모달 컴포넌트 import

export default function Profile() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postCount, setPostCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 추가

  useEffect(() => {
    const fetchUserDataAndPosts = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (!userSnapshot.exists()) {
          console.log("User document not found for uid:", currentUser.uid);
          setProfileUser(null);
          setUserPosts([]);
          setPostCount(0);
        } else {
          const userData = userSnapshot.data() as Omit<UserProfile, 'uid'>;
          const userId = currentUser.uid;
          console.log("Current user data:", { ...userData, uid: userId });
          setProfileUser({ ...userData, uid: userId });

          const postsRef = collection(db, "posts");
          const postsQuery = query(postsRef, where("authorId", "==", userId), orderBy("createdAt", "desc"));
          const postsSnapshot = await getDocs(postsQuery);
          console.log("Posts snapshot size:", postsSnapshot.size);

          const posts = postsSnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            return {
              id: doc.id,
              ...data,
              createdAt: createdAt,
            } as Post;
          });

          console.log("Fetched posts:", posts);
          setUserPosts(posts);
          setPostCount(postsSnapshot.size);
        }
      } catch (error) {
        console.error("Error fetching user data or posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDataAndPosts();
  }, [currentUser, navigate]); // 의존성 배열에 currentUser와 navigate 추가

  const handleProfileUpdate = (newPhotoURL: string) => {
      if (profileUser) {
          setProfileUser({ ...profileUser, photoURL: newPhotoURL });
      }
      setUserPosts(currentPosts =>
          currentPosts.map(post =>
              post.authorId === currentUser?.uid
                  ? { ...post, authorPhotoURL: newPhotoURL }
                  : post
          )
      );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)] p-4">
        <h1 className="text-2xl font-bold mb-4">사용자 정보를 불러올 수 없습니다.</h1>
        <p className="text-gray-600 mb-4">로그인 상태를 확인하거나 다시 시도해 주세요.</p>
        <button onClick={() => navigate('/login')} className="text-blue-500 hover:underline mr-4">
          로그인 페이지로 이동
        </button>
        <button onClick={() => window.location.reload()} className="text-green-500 hover:underline">
          새로고침
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center px-4 py-2">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-xl font-bold">{profileUser.displayName}</h1>
            <p className="text-sm text-gray-500">{postCount} posts</p>
          </div>
        </div>
      </header>

      {/* 프로필 섹션 */}
      <div>
        {/* 배너 */}
        <div className="h-48 bg-gray-300"></div> 
        
        <div className="p-4 -mt-16">
          <div className="flex justify-between items-end">
            {profileUser.photoURL ? (
              <img 
                src={profileUser.photoURL}
                alt="Profile" 
                className="w-40 h-40 rounded-full border-4 border-white bg-white object-cover"
              />
            ) : (
              <div className="w-40 h-40 rounded-full border-4 border-white bg-white flex items-center justify-center">
                <DefaultAvatar size="lg" />
              </div>
            )}
            <button
              onClick={() => setIsModalOpen(true)} // 모달 열기
              className="px-4 py-2 border border-gray-300 rounded-full font-semibold hover:bg-gray-100"
            >
              Set up profile
            </button>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-bold">{profileUser.displayName}</h2>
            <p className="text-gray-500">@{profileUser.username}</p>
          </div>

          <div className="mt-4 text-gray-500 flex items-center gap-2">
            <FaCalendarAlt />
            <span>Joined {profileUser.createdAt ? format(profileUser.createdAt.toDate(), 'MMMM yyyy') : 'Unknown date'}</span>
          </div>

          <div className="mt-4 flex gap-4">
            <p><span className="font-bold">1</span> Following</p>
            <p><span className="font-bold">0</span> Followers</p>
          </div>
        </div>
      </div>

      {/* 게시물 타임라인 */}
      <div className="border-t border-gray-200">
        <Timeline 
          posts={userPosts} 
          setPosts={setUserPosts} 
          fetchPosts={false}
        />
      </div>

      {/* 프로필 설정 모달 */}
      {isModalOpen && (
        <ProfileSetupModal
          onClose={() => setIsModalOpen(false)} // 모달 닫기
          onProfileUpdate={handleProfileUpdate} // 콜백 함수 전달
        />
      )}
    </div>
  );
} 