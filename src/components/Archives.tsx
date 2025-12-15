interface Post {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  readTime: string;
  tags: string[];
}

interface ArchivesProps {
  posts: Post[];
  onNavigateHome: () => void;
  onArticleClick: (articleId: string) => void;
}

export function Archives({ posts, onNavigateHome, onArticleClick }: ArchivesProps) {
  // Group posts by year
  const postsByYear = posts.reduce((acc, post) => {
    const year = new Date(post.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {} as Record<number, Post[]>);

  // Sort years descending
  const sortedYears = Object.keys(postsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return { day, month };
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Timeline */}
      <div className="relative">
        {sortedYears.map((year, yearIndex) => (
          <div key={year} className="relative">
            {/* Year Header */}
            <div className="flex items-start mb-8">
              <div className="w-20 flex-shrink-0">
                <span className="text-gray-900">{year}</span>
              </div>
              <div className="relative flex items-center">
                <div className="w-3 h-3 rounded-full border-2 border-gray-300 bg-white"></div>
              </div>
            </div>

            {/* Posts for this year */}
            <div className="relative">
              {postsByYear[year].map((post, postIndex) => {
                const { day, month } = formatDate(post.date);
                const isLastPost = yearIndex === sortedYears.length - 1 && 
                                   postIndex === postsByYear[year].length - 1;

                return (
                  <div key={post.id} className="relative flex mb-8">
                    {/* Date */}
                    <div className="w-20 flex-shrink-0 text-right pr-4">
                      <div className="text-gray-900">{day}</div>
                      <div className="text-gray-500 text-sm">{month}</div>
                    </div>

                    {/* Timeline dot and line */}
                    <div className="relative flex flex-col items-center mr-6">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
                      {!isLastPost && (
                        <div className="w-px bg-gray-300 flex-grow absolute top-2.5" style={{ height: '60px' }}></div>
                      )}
                    </div>

                    {/* Article title */}
                    <div className="flex-1 pt-0">
                      <a
                        href="#"
                        className="hover:underline"
                        style={{ color: '#002fa7' }}
                        onClick={(e) => {
                          e.preventDefault();
                          onArticleClick(post.id);
                        }}
                      >
                        {post.title}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}