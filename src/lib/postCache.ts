import { BlogPost } from '../types';

export const postCache = new Map<string, BlogPost>();

// Shared by readers and successful admin mutations.
export function invalidatePost(id: string) {
  postCache.delete(id);
}
