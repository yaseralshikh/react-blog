
import type { User, Post, Comment, Category, PostStatus } from '../types';

// Initial Seed Data
const SEED_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Alex Tech (Admin)',
    email: 'admin@devpulse.com',
    password: 'admin',
    role: 'admin',
    created_at: new Date().toISOString(),
    avatar: 'https://picsum.photos/seed/alex/200/200'
  },
  {
    id: 'user_2',
    name: 'Sarah Code',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'user',
    created_at: new Date().toISOString(),
    avatar: 'https://picsum.photos/seed/sarah/200/200'
  }
];

const SEED_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Development', slug: 'development', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'cat_2', name: 'Design', slug: 'design', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  { id: 'cat_3', name: 'Career', slug: 'career', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { id: 'cat_4', name: 'Tech News', slug: 'tech-news', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' }
];

const SEED_POSTS: Post[] = [
  {
    id: 'post_1',
    title: 'The Future of React 19',
    content: 'React 19 is bringing some incredible changes to the ecosystem. From the new compiler to server actions, everything is changing for the better. The compiled approach means less manual memoization and faster apps by default.',
    image: 'https://picsum.photos/seed/react/800/400',
    user_id: 'user_1',
    category_id: 'cat_1',
    status: 'published',
    created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: 'post_2',
    title: 'Mastering Tailwind CSS',
    content: 'Utility-first CSS is not just a trend, it is a workflow shift. Once you memorize the classes, you can build UIs faster than ever before. Combined with component libraries, it is unstoppable.',
    image: 'https://picsum.photos/seed/tailwind/800/400',
    user_id: 'user_2',
    category_id: 'cat_2',
    status: 'published',
    created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  },
  {
    id: 'post_3',
    title: 'Draft: Understanding Closures',
    content: 'Closures are a fundamental concept in JavaScript...',
    image: '',
    user_id: 'user_2',
    category_id: 'cat_1',
    status: 'pending',
    created_at: new Date().toISOString()
  }
];

const SEED_COMMENTS: Comment[] = [
  {
    id: 'comment_1',
    content: 'Great article! Can wait to try the new compiler.',
    post_id: 'post_1',
    user_id: 'user_2',
    created_at: new Date().toISOString()
  }
];

// Helper to simulate DB latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class DatabaseService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify(SEED_USERS));
      localStorage.setItem('categories', JSON.stringify(SEED_CATEGORIES));
      localStorage.setItem('posts', JSON.stringify(SEED_POSTS));
      localStorage.setItem('comments', JSON.stringify(SEED_COMMENTS));
    }
    // Migration check for new fields
    const posts = this.get<Post>('posts');
    if (posts.length > 0 && !posts[0].status) {
        const migratedPosts = posts.map(p => ({ ...p, status: 'published' as PostStatus }));
        this.set('posts', migratedPosts);
    }
    const users = this.get<User>('users');
    if (users.length > 0 && !users[0].role) {
        const migratedUsers = users.map((u, i) => ({ ...u, role: i === 0 ? 'admin' : 'user' }));
        this.set('users', migratedUsers);
    }
  }

  private get<T>(table: string): T[] {
    const data = localStorage.getItem(table);
    return data ? JSON.parse(data) : [];
  }

  private set<T>(table: string, data: T[]) {
    localStorage.setItem(table, JSON.stringify(data));
  }

  // --- User Operations ---
  async login(email: string, password: string): Promise<User | null> {
    await delay(500);
    const users = this.get<User>('users');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password, ...safeUser } = user;
      return safeUser as User;
    }
    return null;
  }

  async register(name: string, email: string, password: string): Promise<User> {
    await delay(500);
    const users = this.get<User>('users');
    if (users.find(u => u.email === email)) throw new Error('Email already exists');
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      role: 'user', // Default role
      created_at: new Date().toISOString(),
      avatar: `https://picsum.photos/seed/${Date.now()}/200/200`
    };
    
    users.push(newUser);
    this.set('users', users);
    
    const { password: _, ...safeUser } = newUser;
    return safeUser as User;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const users = this.get<User>('users');
    return users.find(u => u.id === id);
  }

  async getAllUsers(): Promise<User[]> {
    await delay(200);
    return this.get<User>('users');
  }

  async deleteUser(id: string): Promise<void> {
      await delay(300);
      let users = this.get<User>('users');
      users = users.filter(u => u.id !== id);
      this.set('users', users);
      // Note: In a real app, we'd cascade delete posts/comments or reassign them
  }

  // --- Category Operations ---
  async getCategories(): Promise<Category[]> {
    await delay(100);
    return this.get<Category>('categories');
  }

  async createCategory(name: string, color: string): Promise<Category> {
    await delay(300);
    const categories = this.get<Category>('categories');
    const newCat: Category = {
        id: `cat_${Date.now()}`,
        name,
        slug: name.toLowerCase().replace(/ /g, '-'),
        color
    };
    categories.push(newCat);
    this.set('categories', categories);
    return newCat;
  }

  async deleteCategory(id: string): Promise<void> {
      await delay(200);
      const categories = this.get<Category>('categories').filter(c => c.id !== id);
      this.set('categories', categories);
  }

  // --- Post Operations ---
  async getPosts(includePending = false): Promise<Post[]> {
    await delay(300);
    let posts = this.get<Post>('posts');
    const users = this.get<User>('users');
    const comments = this.get<Comment>('comments');
    const categories = this.get<Category>('categories');

    // Filter if not admin/owner view (simplified for mock)
    if (!includePending) {
        posts = posts.filter(p => p.status === 'published');
    }

    // SQL JOIN Simulation
    return posts.map(post => ({
      ...post,
      author: users.find(u => u.id === post.user_id),
      category: categories.find(c => c.id === post.category_id),
      comments_count: comments.filter(c => c.post_id === post.id).length
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getPostById(id: string): Promise<Post | null> {
    await delay(300);
    const posts = this.get<Post>('posts');
    const post = posts.find(p => p.id === id);
    if (!post) return null;

    const users = this.get<User>('users');
    const categories = this.get<Category>('categories');
    
    return {
      ...post,
      author: users.find(u => u.id === post.user_id),
      category: categories.find(c => c.id === post.category_id)
    };
  }

  async createPost(post: Omit<Post, 'id' | 'created_at' | 'status'> & { status?: PostStatus }): Promise<Post> {
    await delay(500);
    const posts = this.get<Post>('posts');
    const users = this.get<User>('users');
    const author = users.find(u => u.id === post.user_id);

    // If admin, publish immediately, else pending
    const initialStatus: PostStatus = post.status || (author?.role === 'admin' ? 'published' : 'pending');

    const newPost: Post = {
      ...post,
      status: initialStatus,
      id: `post_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    posts.push(newPost);
    this.set('posts', posts);
    return newPost;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    await delay(400);
    const posts = this.get<Post>('posts');
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Post not found');
    
    posts[index] = { ...posts[index], ...updates };
    this.set('posts', posts);
    return posts[index];
  }

  async deletePost(id: string): Promise<void> {
    await delay(300);
    let posts = this.get<Post>('posts');
    posts = posts.filter(p => p.id !== id);
    this.set('posts', posts);
    
    let comments = this.get<Comment>('comments');
    comments = comments.filter(c => c.post_id !== id);
    this.set('comments', comments);
  }

  // --- Comment Operations ---
  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    await delay(200);
    const comments = this.get<Comment>('comments');
    const users = this.get<User>('users');
    
    return comments
      .filter(c => c.post_id === postId)
      .map(c => ({
        ...c,
        author: users.find(u => u.id === c.user_id)
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  async createComment(content: string, postId: string, userId: string): Promise<Comment> {
    await delay(300);
    const comments = this.get<Comment>('comments');
    const users = this.get<User>('users');
    
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      content,
      post_id: postId,
      user_id: userId,
      created_at: new Date().toISOString()
    };
    
    comments.push(newComment);
    this.set('comments', comments);
    
    return {
      ...newComment,
      author: users.find(u => u.id === userId)
    };
  }
}

export const db = new DatabaseService();
