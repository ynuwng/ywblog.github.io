import { BlogPost } from './BlogPost';
import { ArrowLeft, Tag } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  readTime: string;
  tags: string[];
}

interface TaggedArticlesProps {
  tag: string;
  posts: Post[];
  onBack: () => void;
  onArticleClick: (articleId: string) => void;
}

export function TaggedArticles({ tag, posts, onBack, onArticleClick }: TaggedArticlesProps) {
  const filteredPosts = posts.filter(post => post.tags.includes(tag));

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      
      {/* Tag Header */}
      <div className="mb-12">
        <h1 className="mb-2 flex items-center gap-2 not-italic font-bold font-normal">
          <Tag className="w-6 h-6" />
          {tag}
        </h1>
        <p className="text-gray-500">{filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}</p>
      </div>

      {/* Articles List */}
      <div className="space-y-16">
        {filteredPosts.map((post) => (
          <BlogPost key={post.id} post={post} onClick={() => onArticleClick(post.id)} />
        ))}
      </div>
    </main>
  );
}