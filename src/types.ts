
// Matching PRD Section 9: Database Schema

export type UserRole = 'admin' | 'user';
export type PostStatus = 'published' | 'pending' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional because we don't always return it to UI
  role: UserRole;
  created_at: string;
  avatar?: string; // Extra for UI
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string; // For UI styling (e.g., 'bg-blue-100 text-blue-600')
}

export interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  user_id: string;
  category_id?: string; // Foreign Key
  status: PostStatus;
  created_at: string;
  // Joined data for UI
  author?: User;
  category?: Category;
  comments_count?: number;
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  user_id: string;
  created_at: string;
  // Joined data for UI
  author?: User;
}

export interface AuthResponse {
  user: User;
  token: string;
}
