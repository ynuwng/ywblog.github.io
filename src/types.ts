export interface BlogPost {
  id: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  readTime: string;
  tags: string[];
  category: string;
  content?: string;
}
