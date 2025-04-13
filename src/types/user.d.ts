import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string; // Firestore 문서 ID (auth.currentUser.uid 와 동일)
  username: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp; // Firestore Timestamp 타입
  // 필요한 다른 필드 추가 (예: bio, location, website 등)
} 