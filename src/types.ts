export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  coverImage?: string;
  bgMusicUrl?: string;
  createdAt: number;
  updatedAt: number;
  authorId: string;
}
