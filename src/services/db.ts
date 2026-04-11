import { Article, Category } from '../types';

const API_BASE = '/api';

export const getCategories = async (): Promise<Category[]> => {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) return [];
  return res.json();
};

export const getArticles = async (): Promise<Article[]> => {
  const res = await fetch(`${API_BASE}/articles`);
  if (!res.ok) return [];
  return res.json();
};

export const getArticle = async (id: string): Promise<Article | null> => {
  const res = await fetch(`${API_BASE}/articles/${id}`);
  if (!res.ok) return null;
  return res.json();
};

export const saveCategory = async (category: Omit<Category, 'id' | 'createdAt'> & { id?: string }) => {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category)
  });
  if (!res.ok) throw new Error('Failed to save category');
};

export const deleteCategory = async (id: string) => {
  const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete category');
};

export const saveArticle = async (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
  const res = await fetch(`${API_BASE}/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article)
  });
  if (!res.ok) throw new Error('Failed to save article');
  const data = await res.json();
  return data.id;
};

export const deleteArticle = async (id: string) => {
  const res = await fetch(`${API_BASE}/articles/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete article');
};

export const uploadImage = async (base64Data: string): Promise<string> => {
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: base64Data })
  });
  if (!res.ok) throw new Error('Failed to upload image');
  const data = await res.json();
  return data.url;
};
