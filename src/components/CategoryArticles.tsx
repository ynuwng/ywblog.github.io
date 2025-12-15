import { BlogPost } from './BlogPost';
import { ChevronLeft } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  readTime: string;
  tags: string[];
  category: string;
}

interface CategoryArticlesProps {
  category: string;
  posts: Post[];
  onBack: () => void;
  onArticleClick: (id: string) => void;
}

export function CategoryArticles({ category, posts, onBack, onArticleClick }: CategoryArticlesProps) {
  const filteredPosts = posts.filter(post => post.category === category);

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      
      <h1 className="mb-2 text-[20px] text-[rgb(35,83,71)] font-bold font-normal">{category}</h1>

      <div className="space-y-16">
        {filteredPosts.map((post) => (
          <BlogPost key={post.id} post={post} onClick={() => onArticleClick(post.id)} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <p className="text-gray-500 text-center py-8">No articles found in this category.</p>
      )}
    </main>
  );
}