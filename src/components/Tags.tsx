interface Post {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  readTime: string;
  tags: string[];
}

interface TagsProps {
  posts: Post[];
  onTagClick: (tag: string) => void;
}

// Morandi color palette - same as BlogPost
const morandiColors = [
  { bg: '#E8D5C4', text: '#6B5D54' }, // Muted terracotta
  { bg: '#C9D5C0', text: '#5A6152' }, // Sage green
  { bg: '#D4C5D0', text: '#635A60' }, // Dusty rose
  { bg: '#C8D5D5', text: '#546366' }, // Powder blue
  { bg: '#E0D5C8', text: '#6B6158' }, // Warm beige
  { bg: '#D5CFD0', text: '#625E5F' }, // Cool gray
  { bg: '#D9D0C7', text: '#66605A' }, // Mushroom
  { bg: '#C5D0D8', text: '#535F66' }, // Soft blue-gray
];

function getTagColor(tag: string): { bg: string; text: string } {
  // Generate a consistent index based on tag name
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return morandiColors[hash % morandiColors.length];
}

export function Tags({ posts, onTagClick }: TagsProps) {
  // Count tags
  const tagCounts = posts.reduce((acc, post) => {
    post.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Sort tags alphabetically
  const sortedTags = Object.entries(tagCounts).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex flex-wrap gap-3">
        {sortedTags.map(([tag, count]) => {
          const colors = getTagColor(tag);
          return (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="px-3 py-1 text-sm rounded-full transition-opacity hover:opacity-80"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
              }}
            >
              <span>{tag}</span>
              <span className="ml-1.5 text-gray-400">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}