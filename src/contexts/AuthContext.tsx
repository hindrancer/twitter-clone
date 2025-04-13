import { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "../firebase";
import LoadingScreen from "../components/LoadingScreen";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase 인증 상태 변경 감지
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      // 여기서 firebaseUser 객체는 최신 상태를 반영할 수 있지만,
      // photoURL 등의 세부 정보 변경은 즉시 반영되지 않을 수 있음
      setUser(firebaseUser);
      setIsLoading(false);
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, []);

  // 로딩 중일 때 로딩 화면 표시
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// 커스텀 훅
export function useAuth() {
  return useContext(AuthContext);
} 