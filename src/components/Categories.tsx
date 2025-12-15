import { Folder, ChevronRight } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  category: string;
}

interface CategoriesProps {
  posts: Post[];
  onCategoryClick: (category: string) => void;
}

export function Categories({ posts, onCategoryClick }: CategoriesProps) {
  // Count posts per category
  const categoryCount = posts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(categoryCount).map(([name, count]) => ({
    name,
    count
  }));

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      
      <div className="space-y-4">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => onCategoryClick(category.name)}
            className="w-full flex items-center gap-3 p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left group text-[15px]"
          >
            <Folder className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span className="text-[#002fa7] flex-1 text-[15px]">
              {category.name}
            </span>
            <span className="text-gray-500 text-sm mr-2">
              {category.count} post{category.count > 1 ? 's' : ''}
            </span>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </button>
        ))}
      </div>
    </main>
  );
}