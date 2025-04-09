export interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaUrls: string[];
  createdAt: Date;
  likes: number;
  authorDisplayName: string;
  authorUsername: string;
  authorPhotoURL: string;
} 