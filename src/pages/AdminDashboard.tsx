
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/mockDb';
import type { User, Post, Category, PostStatus } from '../types';
import { Shield, Users, FileText, Tag, Trash2, Plus, ChevronDown } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'categories'>('posts');
  
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('bg-gray-100 text-gray-800');

  // High contrast input style
  const inputStyle = "w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all";

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    const [u, p, c] = await Promise.all([
        db.getAllUsers(),
        db.getPosts(true), // Include pending
        db.getCategories()
    ]);
    setUsers(u);
    setPosts(p);
    setCategories(c);
    setIsLoading(false);
  };

  const handleStatusChange = async (postId: string, newStatus: PostStatus) => {
      await db.updatePost(postId, { status: newStatus });
      loadData();
  };

  const handleDeleteUser = async (userId: string) => {
      if(window.confirm("Delete this user? This cannot be undone.")) {
          await db.deleteUser(userId);
          loadData();
      }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
      e.preventDefault();
      if(newCatName) {
          await db.createCategory(newCatName, newCatColor);
          setNewCatName('');
          loadData();
      }
  };

  const handleDeleteCategory = async (id: string) => {
      if(window.confirm("Delete category?")) {
          await db.deleteCategory(id);
          loadData();
      }
  };

  if (isLoading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center mb-8">
            <div className="bg-brand-600 p-3 rounded-xl mr-4 text-white">
                <Shield size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Portal</h1>
                <p className="text-slate-500">Manage content, users, and system settings.</p>
            </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
            <button 
                onClick={() => setActiveTab('posts')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'posts' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
                <FileText size={18} className="mr-2" /> Posts Moderation
                {posts.filter(p => p.status === 'pending').length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {posts.filter(p => p.status === 'pending').length}
                    </span>
                )}
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'users' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
                <Users size={18} className="mr-2" /> Users
            </button>
            <button 
                onClick={() => setActiveTab('categories')}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'categories' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
                <Tag size={18} className="mr-2" /> Categories
            </button>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            
            {/* Posts Tab */}
            {activeTab === 'posts' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-500">Title</th>
                                <th className="px-6 py-4 font-semibold text-slate-500">Author</th>
                                <th className="px-6 py-4 font-semibold text-slate-500">Current Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 w-48">Change Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {posts.map(post => (
                                <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 dark:text-white line-clamp-1" title={post.title}>{post.title}</div>
                                        <div className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{post.author?.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center ${
                                            post.status === 'published' ? 'bg-green-100 text-green-700' :
                                            post.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <select 
                                                value={post.status} 
                                                onChange={(e) => handleStatusChange(post.id, e.target.value as PostStatus)}
                                                className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none cursor-pointer font-medium"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="published">Published</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500">
                                                <ChevronDown size={14} />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-500">User</th>
                                <th className="px-6 py-4 font-semibold text-slate-500">Role</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <img src={u.avatar} alt="" className="w-8 h-8 rounded-full mr-3"/>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white">{u.name}</div>
                                                <div className="text-xs text-slate-400">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {u.role !== 'admin' && (
                                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 flex items-center justify-end ml-auto">
                                                <Trash2 size={16} className="mr-1" /> Ban
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
                <div className="p-6">
                    <div className="mb-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-lg mb-4 dark:text-white">Add New Category</h3>
                        <form onSubmit={handleAddCategory} className="flex flex-wrap gap-4 items-end">
                            <div className="flex-grow">
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Name</label>
                                <input 
                                    type="text" 
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    className={inputStyle}
                                    placeholder="e.g. Cloud Computing"
                                />
                            </div>
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Color Theme</label>
                                <div className="relative">
                                    <select 
                                        value={newCatColor}
                                        onChange={(e) => setNewCatColor(e.target.value)}
                                        className={`${inputStyle} appearance-none`}
                                    >
                                        <option value="bg-blue-100 text-blue-700" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Blue</option>
                                        <option value="bg-green-100 text-green-700" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Green</option>
                                        <option value="bg-red-100 text-red-700" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Red</option>
                                        <option value="bg-purple-100 text-purple-700" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Purple</option>
                                        <option value="bg-yellow-100 text-yellow-700" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Yellow</option>
                                        <option value="bg-pink-100 text-pink-700" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Pink</option>
                                    </select>
                                     <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronDown size={14} />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-700 flex items-center shadow-lg shadow-brand-500/30">
                                <Plus size={18} className="mr-2" /> Add
                            </button>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${cat.color}`}>
                                    {cat.name}
                                </span>
                                <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-400 hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
