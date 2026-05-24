import { BlogPost } from '../types';
import { getAdminKey } from './adminSession';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-860c354e`;

type ApiResponse<T> =
  | ({ success: true } & T)
  | { success: false; error?: string };

function authHeaders(admin = false): HeadersInit {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${publicAnonKey}`,
  };

  if (admin) {
    const adminKey = getAdminKey();
    if (adminKey) headers['x-admin-key'] = adminKey;
  }

  return headers;
}

async function readJson<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      success: false,
      error: data?.error || `Request failed with ${response.status}`,
    };
  }
  return data;
}

export async function listPosts(): Promise<ApiResponse<{ posts: BlogPost[] }>> {
  const response = await fetch(`${API_BASE}/posts`, {
    headers: authHeaders(),
  });
  return readJson(response);
}

export async function getPost(id: string): Promise<ApiResponse<{ post: BlogPost }>> {
  const response = await fetch(`${API_BASE}/posts/${encodeURIComponent(id)}`, {
    headers: authHeaders(),
  });
  return readJson(response);
}

export async function createPost(post: Omit<BlogPost, 'id'>): Promise<ApiResponse<{ post: BlogPost }>> {
  const response = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: {
      ...authHeaders(true),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(post),
  });
  return readJson(response);
}

export async function updatePost(id: string, post: Omit<BlogPost, 'id'>): Promise<ApiResponse<{ post: BlogPost }>> {
  const response = await fetch(`${API_BASE}/posts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      ...authHeaders(true),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(post),
  });
  return readJson(response);
}

export async function deletePost(id: string): Promise<ApiResponse<{ message: string }>> {
  const response = await fetch(`${API_BASE}/posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(true),
  });
  return readJson(response);
}
