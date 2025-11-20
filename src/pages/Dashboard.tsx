
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/mockDb';
import type { Post } from '../types';
import { Edit2, Trash2, Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '../components/Toast';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyPosts = async () => {
      // Get all posts including pending to filter by user
      const allPosts = await db.getPosts(true);
      const userPosts = allPosts.filter(p => p.user_id === user.id);
      setMyPosts(userPosts);
      setIsLoading(false);
    };

    fetchMyPosts();
  }, [user, navigate]);

  const handleDelete = async (postId: string) => {
    toast.confirm('Delete this post? This action cannot be undone.', {
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        await db.deletePost(postId);
        setMyPosts(myPosts.filter(p => p.id !== postId));
        toast.success('Post deleted');
      }
    });
  };

  if (isLoading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50/90 dark:bg-transparent py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Dashboard</h1>
            <p className="text-slate-500">Manage your articles and content.</p>
          </div>
          <Link to="/create" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center shadow-lg shadow-brand-500/20 transition-all">
            <Plus size={18} className="mr-2" />
            Create New
          </Link>
        </div>

        <div className="bg-white/95 dark:bg-slate-800/85 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-600/70 overflow-hidden backdrop-blur">
          {myPosts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Article Title</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {myPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-slate-200 rounded-lg overflow-hidden mr-4">
                             {post.image ? <img src={post.image} className="w-full h-full object-cover" /> : <FileText className="m-2 text-slate-500"/>}
                          </div>
                          <div className="font-medium text-slate-900 dark:text-white">{post.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(post.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                          {post.status === 'published' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle size={12} className="mr-1" /> Published
                              </span>
                          )}
                          {post.status === 'pending' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Clock size={12} className="mr-1" /> Pending
                              </span>
                          )}
                          {post.status === 'rejected' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <XCircle size={12} className="mr-1" /> Rejected
                              </span>
                          )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <Link to={`/edit/${post.id}`} className="text-slate-400 hover:text-brand-600 transition-colors">
                            <Edit2 size={18} />
                          </Link>
                          <button onClick={() => handleDelete(post.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No posts yet</h3>
              <p className="text-slate-500 mb-6">Start sharing your ideas with the world!</p>
              <Link to="/create" className="text-brand-600 font-medium hover:underline">Write your first post &rarr;</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
