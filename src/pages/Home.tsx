
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/mockDb';
import type { Post, Category } from '../types';
import { Clock, MessageCircle, ArrowRight, Search, Filter, Calendar, Tag, X } from 'lucide-react';

export const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [postsData, catsData] = await Promise.all([
        db.getPosts(),
        db.getCategories()
      ]);
      setPosts(postsData);
      setCategories(catsData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Extract unique dates (Month Year)
  const availableDates = [...new Set(posts.map(post => {
    const date = new Date(post.created_at);
    return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
  }))];

  // Filter Logic
  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? post.category_id === selectedCategory : true;
    
    const postDateStr = `${new Date(post.created_at).toLocaleString('default', { month: 'long' })} ${new Date(post.created_at).getFullYear()}`;
    const matchesDate = selectedDate ? postDateStr === selectedDate : true;

    return matchesSearch && matchesCategory && matchesDate;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedDate(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <header className="relative bg-slate-900 text-white py-20 overflow-hidden mb-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Share Your <span className="text-brand-400">Code</span> & Ideas
          </h1>
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-slate-900/80 transition-all shadow-xl"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters (Desktop: Left, Mobile: Top) */}
          <aside className="lg:w-1/4 space-y-8">
            {/* Active Filters Badge */}
            {(selectedCategory || selectedDate) && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-brand-200 dark:border-brand-900/50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-brand-600 dark:text-brand-400">Active Filters</h3>
                  <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-red-500 flex items-center">
                    <X size={14} className="mr-1"/> Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory && (
                    <span className="bg-brand-100 text-brand-800 text-xs px-2 py-1 rounded-md flex items-center">
                      {categories.find(c => c.id === selectedCategory)?.name}
                      <button onClick={() => setSelectedCategory(null)} className="ml-1 hover:text-red-600"><X size={12}/></button>
                    </span>
                  )}
                  {selectedDate && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md flex items-center">
                      {selectedDate}
                      <button onClick={() => setSelectedDate(null)} className="ml-1 hover:text-red-600"><X size={12}/></button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Categories Widget */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="flex items-center font-bold text-lg mb-4 text-slate-900 dark:text-white">
                <Tag size={20} className="mr-2 text-brand-500" /> Categories
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${!selectedCategory ? 'bg-slate-100 dark:bg-slate-700 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${selectedCategory === cat.id ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'}`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.id && <span className="w-2 h-2 rounded-full bg-brand-500"></span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Archives Widget */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="flex items-center font-bold text-lg mb-4 text-slate-900 dark:text-white">
                <Calendar size={20} className="mr-2 text-brand-500" /> Archives
              </h3>
              <div className="space-y-2">
                 <button 
                  onClick={() => setSelectedDate(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${!selectedDate ? 'bg-slate-100 dark:bg-slate-700 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'}`}
                >
                  All Dates
                </button>
                {availableDates.map(dateStr => (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedDate === dateStr ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'}`}
                  >
                    {dateStr}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Posts Grid (Main Content) */}
          <main className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                 {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Latest Posts'}
                 <span className="text-sm font-normal text-slate-500 ml-3">({filteredPosts.length} results)</span>
               </h2>
            </div>

            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPosts.map((post) => (
                  <Link to={`/post/${post.id}`} key={post.id} className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 overflow-hidden transform hover:-translate-y-2 flex flex-col h-full border border-slate-100 dark:border-slate-700">
                    {post.image && (
                      <div className="h-48 overflow-hidden relative">
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors z-10"></div>
                        {/* Category Badge */}
                        {post.category && (
                          <div className="absolute top-4 left-4 z-20">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm ${post.category.color}`}>
                              {post.category.name}
                            </span>
                          </div>
                        )}
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                        />
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-3 space-x-4">
                        <span className="flex items-center"><Clock size={14} className="mr-1" /> {new Date(post.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center"><MessageCircle size={14} className="mr-1" /> {post.comments_count || 0}</span>
                      </div>
                      
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {post.title}
                      </h2>
                      
                      <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-6 flex-grow">
                        {post.content}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center space-x-2">
                          {post.author?.avatar ? (
                            <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold">
                              {post.author?.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{post.author?.name}</span>
                        </div>
                        <span className="text-brand-600 dark:text-brand-400 flex items-center text-sm font-semibold group-hover:translate-x-1 transition-transform">
                          Read <ArrowRight size={16} className="ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="bg-slate-100 dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="text-slate-400 h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No matching posts</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                  We couldn't find any articles matching your filters.
                </p>
                <button onClick={clearFilters} className="text-brand-600 font-medium hover:underline">
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
