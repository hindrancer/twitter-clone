import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { 
  FaHome, 
  FaHashtag, 
  FaBell, 
  FaBookmark, 
  FaUser, 
  FaTwitter,
  FaEllipsisH
} from "react-icons/fa";
import DefaultAvatar from "./DefaultAvatar";

// Sidebar Props 인터페이스 정의
interface SidebarProps {
  showCreatePostModal: boolean;
  setShowCreatePostModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ showCreatePostModal, setShowCreatePostModal }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [username, setUsername] = useState<string>("");

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

  const menuItems = [
    { icon: FaHome, label: "홈", path: "/" },
    { icon: FaHashtag, label: "탐색하기", path: "/explore" },
    { icon: FaBell, label: "알림", path: "/notifications" },
    { icon: FaBookmark, label: "북마크", path: "/bookmarks" },
    { icon: FaUser, label: "프로필", path: `/profile/${username}` },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutMenu(false);
    } catch (error) {
      console.error("로그아웃 중 오류가 발생했습니다:", error);
    }
  };

  return (
    <div className="fixed h-screen w-72 border-r border-gray-200 p-4">
      <div className="flex flex-col h-full">
        {/* 로고 */}
        <div className="p-3">
          <img src="/m.svg" alt="Logo" className="h-8 w-auto" />
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-3 text-xl hover:bg-gray-100 rounded-full transition-colors ${
                location.pathname === item.path ? "font-bold" : ""
              }`}
            >
              <item.icon className="text-2xl" />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* 게시하기 버튼 */}
          <button 
            className="w-full bg-[#1d9bf0] text-white rounded-full py-3 mt-4 hover:bg-[#1a8cd8] transition-colors"
            onClick={() => setShowCreatePostModal(true)}
          >
            게시하기
          </button>
        </nav>

        {/* 사용자 프로필 */}
        <div className="relative">
          <button 
            className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-full"
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <DefaultAvatar size="sm" />
            )}
            <div className="flex-1 text-left">
              <p className="font-bold">{user?.displayName}</p>
              <p className="text-gray-500">@{username}</p>
            </div>
            <FaEllipsisH />
          </button>

          {/* 로그아웃 드롭다운 */}
          {showLogoutMenu && (
            <>
              <div 
                className="fixed inset-0" 
                onClick={() => setShowLogoutMenu(false)}
              />
              <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-red-500"
                >
                  로그아웃
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 