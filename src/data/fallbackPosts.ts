import { BlogPost } from '../types';

export const fallbackPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Building Scalable Systems',
    date: '2025-12-10',
    author: 'Yuan Wang',
    excerpt: 'Thoughts on designing distributed systems that can handle millions of requests per second.',
    readTime: '5 min read',
    tags: ['systems', 'architecture'],
    category: 'Engineering',
    content: `Designing systems that can scale to handle millions of requests per second is one of the most challenging and rewarding aspects of modern software engineering. In this post, I'll share some key principles and patterns that have helped me build resilient, high-performance distributed systems.

## The Foundation: Horizontal Scaling

The most important principle in building scalable systems is designing for horizontal scaling from day one. Instead of relying on vertical scaling (adding more resources to a single machine), you should architect your system to distribute load across multiple machines.

This approach offers several advantages:

- **Cost efficiency**: Commodity hardware is cheaper than high-end servers
- **Fault tolerance**: No single point of failure
- **Elasticity**: Easy to add or remove capacity based on demand

## Load Balancing Strategies

A well-designed load balancer is crucial for distributing traffic effectively. Here's a simple example of a round-robin load balancer in pseudocode:

\`\`\`python
class LoadBalancer:
    def __init__(self, servers):
        self.servers = servers
        self.current_index = 0
    
    def get_next_server(self):
        server = self.servers[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.servers)
        return server
\`\`\`

However, in production systems, you'll want more sophisticated algorithms that take into account server health, current load, and geographic proximity.

## Caching: The Performance Multiplier

Implementing effective caching strategies can dramatically reduce load on your backend services. The key is understanding what to cache and for how long. Use \`Redis\` or \`Memcached\` for distributed caching, and always set appropriate TTL (Time To Live) values.

## Database Scaling Patterns

When it comes to databases, consider these approaches:

1. **Read replicas** for read-heavy workloads
2. **Sharding** for horizontal partitioning of data
3. **CQRS** (Command Query Responsibility Segregation) for separating reads and writes

For more information on database optimization, check out my post on [Optimizing Database Queries](#).

## Monitoring and Observability

You can't scale what you can't measure. Implement comprehensive monitoring from the start, tracking key metrics like request latency, error rates, and resource utilization. Tools like Prometheus and Grafana are essential for maintaining visibility into your system's health.

Remember: building scalable systems is an iterative process. Start simple, measure everything, and optimize based on real data rather than assumptions.`
  },
  {
    id: '2',
    title: 'The Art of Code Review',
    date: '2025-12-05',
    author: 'Yuan Wang',
    excerpt: 'Best practices for conducting effective code reviews that improve both code quality and team collaboration.',
    readTime: '4 min read',
    tags: ['development', 'team'],
    category: 'Best Practices',
    content: `Code reviews are one of the most valuable practices in software development, yet they're often misunderstood or poorly executed. A good code review process can catch bugs, share knowledge, and improve code quality. A bad one can slow down development and frustrate team members.

## The Purpose of Code Reviews

Before diving into the how, let's clarify the why. Code reviews serve multiple purposes:

- **Quality assurance**: Catching bugs and design issues before they reach production
- **Knowledge sharing**: Spreading understanding of the codebase across the team
- **Consistency**: Ensuring code follows team standards and best practices
- **Mentorship**: Helping junior developers learn from more experienced team members

## Review with Empathy

The most important principle is to review code, not people. Always assume the author had good intentions and focus on the code itself. Use phrases like "What do you think about..." instead of "You should..."

Here's an example of constructive feedback:

> "I noticed this function is quite long. What do you think about extracting some of the logic into smaller helper functions? It might make it easier to test and understand."

Compare that to:

> "This function is way too long. You need to refactor it."

The first approach invites discussion, while the second feels like a command.

## What to Look For

During a code review, focus on:

1. **Correctness**: Does the code do what it's supposed to do?
2. **Design**: Is the solution well-architected?
3. **Readability**: Can other developers understand this code?
4. **Testing**: Are there adequate tests?
5. **Performance**: Are there obvious performance issues?

## The Two-Pass Approach

I like to review code in two passes:

\`\`\`typescript
// First pass: High-level architecture and design
function firstPass(pr: PullRequest) {
  reviewArchitecture(pr);
  checkDesignPatterns(pr);
  verifyTestCoverage(pr);
}

// Second pass: Implementation details
function secondPass(pr: PullRequest) {
  reviewLineByLine(pr);
  checkEdgeCases(pr);
  verifyErrorHandling(pr);
}
\`\`\`

## Automate What You Can

Don't waste time on style issues that can be caught by automated tools. Use linters like \`ESLint\`, formatters like \`Prettier\`, and static analysis tools to catch common issues automatically.

For more on setting up effective development workflows, see my article on [Modern Development Practices](#).

## When to Approve

A pull request doesn't need to be perfect to be approved. If the changes are correct, improve the codebase, and any issues are minor, approve it. You can always create follow-up issues for non-critical improvements.

Remember: the goal is to ship good code, not perfect code. Perfect is the enemy of done.`
  },
  {
    id: '3',
    title: 'Why TypeScript Matters',
    date: '2025-11-28',
    author: 'Yuan Wang',
    excerpt: 'Exploring how static typing transforms the development experience and catches bugs before they reach production.',
    readTime: '6 min read',
    tags: ['typescript', 'javascript'],
    category: 'Programming Languages',
    content: `After years of writing JavaScript, switching to TypeScript was a game-changer for me. The benefits of static typing extend far beyond just catching type errors—they fundamentally improve the development experience and code maintainability.

## The Type Safety Advantage

The most obvious benefit of TypeScript is catching type-related bugs at compile time rather than runtime. Consider this common JavaScript mistake:

\`\`\`javascript
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Oops! Typo in property name
const total = calculateTotal([{ prise: 10 }, { prise: 20 }]);
console.log(total); // NaN
\`\`\`

In TypeScript, this error would be caught immediately:

\`\`\`typescript
interface Item {
  price: number;
  name: string;
}

function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Type error: Property 'price' does not exist on type '{ prise: number; }'
const total = calculateTotal([{ prise: 10 }, { prise: 20 }]);
\`\`\`

## IntelliSense and Developer Experience

Beyond error catching, TypeScript provides incredible developer tooling. Your IDE can offer accurate autocomplete, inline documentation, and refactoring tools that understand your code's structure.

This means:

- Faster development with better autocomplete
- Safer refactoring with confidence
- Self-documenting code through type annotations

## Gradual Adoption

One of TypeScript's strengths is that you can adopt it gradually. Start by renaming \`.js\` files to \`.ts\` and adding types incrementally. You don't need to convert your entire codebase at once.

\`\`\`typescript
// Start permissive
function process(data: any) {
  // Your existing JavaScript code
}

// Gradually add more specific types
interface UserData {
  id: string;
  name: string;
  email: string;
}

function processUser(data: UserData) {
  // Now with type safety
}
\`\`\`

## Advanced Type Features

TypeScript's type system is incredibly powerful. Features like union types, intersection types, and conditional types enable you to express complex constraints:

\`\`\`typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

function fetchUser(id: string): Result<User> {
  // Type-safe error handling
}
\`\`\`

## The Cost-Benefit Analysis

Yes, TypeScript adds some overhead:

- Learning curve for the type system
- Additional build step
- More code to write and maintain

But the benefits far outweigh these costs, especially for:

- Large codebases
- Long-term projects
- Teams with multiple developers

For more on modern JavaScript development, check out [Building with Modern JavaScript](#).

## Conclusion

TypeScript isn't just about catching bugs—it's about improving the entire development workflow. The investment in learning TypeScript pays dividends in code quality, developer productivity, and long-term maintainability.`
  },
  {
    id: '4',
    title: 'Optimizing Database Queries',
    date: '2025-11-20',
    author: 'Yuan Wang',
    excerpt: 'Deep dive into query optimization techniques that reduced our API response time by 80%.',
    readTime: '7 min read',
    tags: ['database', 'performance'],
    category: 'Performance',
    content: `Database performance issues are among the most common bottlenecks in web applications. In this post, I'll walk through the optimization techniques we used to reduce our API response time from 2 seconds to under 400ms—an 80% improvement.

## Identifying the Problem

The first step in optimization is measurement. We used database query logging to identify slow queries:

\`\`\`sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
\`\`\`

This revealed that our user dashboard query was taking over 1.5 seconds:

\`\`\`sql
SELECT u.*, p.*, COUNT(o.id) as order_count
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id;
\`\`\`

## Adding Strategic Indexes

The biggest performance gain came from adding appropriate indexes. We analyzed the query execution plan using \`EXPLAIN\`:

\`\`\`sql
EXPLAIN SELECT u.*, p.*, COUNT(o.id) as order_count
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id;
\`\`\`

The plan showed full table scans on \`users\` and \`orders\`. Adding indexes dramatically improved performance:

\`\`\`sql
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
\`\`\`

**Result**: Query time dropped from 1.5s to 600ms.

## Reducing Data Transfer

We were selecting all columns with \`SELECT *\` but only needed a subset. Explicitly selecting required columns reduced data transfer:

\`\`\`sql
SELECT 
  u.id, u.name, u.email,
  p.avatar_url,
  COUNT(o.id) as order_count
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name, u.email, p.avatar_url;
\`\`\`

**Result**: Query time dropped from 600ms to 450ms.

## Implementing Query Caching

For data that doesn't change frequently, caching can provide massive performance improvements:

\`\`\`python
def get_user_dashboard(user_id):
    cache_key = f"dashboard:{user_id}"
    cached_data = redis.get(cache_key)
    
    if cached_data:
        return json.loads(cached_data)
    
    data = execute_dashboard_query(user_id)
    redis.setex(cache_key, 300, json.dumps(data))  # Cache for 5 minutes
    return data
\`\`\`

**Result**: Cached requests now return in under 10ms.

## Connection Pooling

We also implemented connection pooling to reduce the overhead of creating new database connections:

\`\`\`python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)
\`\`\`

## Key Takeaways

The optimization journey taught us several important lessons:

1. **Measure first**: Use profiling tools to identify actual bottlenecks
2. **Index strategically**: Indexes speed up reads but slow down writes
3. **Cache aggressively**: Cache everything that makes sense
4. **Select only what you need**: Avoid \`SELECT *\` in production queries
5. **Monitor continuously**: Performance can degrade over time as data grows

For more on performance optimization, see my article on [Building Scalable Systems](#).

## Tools We Used

- **Query analysis**: \`EXPLAIN\` and \`EXPLAIN ANALYZE\`
- **Monitoring**: Prometheus + Grafana
- **Caching**: Redis
- **Profiling**: New Relic APM

The combination of proper indexing, selective queries, caching, and connection pooling reduced our API response time by 80%, dramatically improving user experience.`
  }
];

