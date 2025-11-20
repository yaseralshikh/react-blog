
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/mockDb';
import type { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { Clock, User, MessageSquare, Send, ArrowLeft } from 'lucide-react';

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const postData = await db.getPostById(id);
      if (!postData) {
        navigate('/');
        return;
      }
      setPost(postData);
      const commentsData = await db.getCommentsByPostId(id);
      setComments(commentsData);
      setIsLoading(false);
    };
    fetchData();
  }, [id, navigate]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !post) return;

    const comment = await db.createComment(newComment, post.id, user.id);
    setComments([...comments, comment]);
    setNewComment('');
  };

  if (isLoading || !post) return <div className="min-h-screen flex justify-center items-center bg-slate-50 dark:bg-slate-900"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div></div>;

  return (
    <div className="min-h-screen py-12 bg-slate-50 dark:bg-slate-900">
      <article className="container mx-auto px-4 max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-brand-600 mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Back to posts
        </button>

        {/* Post Header */}
        <div className="mb-10 text-center">
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-6 shadow-sm ${post.category?.color || 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'}`}>
            {post.category?.name || 'General'}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center space-x-6 text-slate-500 dark:text-slate-400 text-sm">
             <div className="flex items-center space-x-2">
                {post.author?.avatar ? (
                   <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-slate-800" />
                ) : (
                   <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                     <User size={16} />
                   </div>
                )}
                <span className="font-medium text-slate-900 dark:text-slate-200">{post.author?.name}</span>
             </div>
             <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
             <span className="flex items-center"><Clock size={16} className="mr-1.5" /> {new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Featured Image */}
        {post.image && (
          <div className="rounded-3xl overflow-hidden shadow-2xl mb-12 aspect-video relative group">
            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors"></div>
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg prose-slate dark:prose-invert mx-auto mb-16 first-letter:text-5xl first-letter:font-bold first-letter:text-brand-600 first-letter:mr-1 first-letter:float-left">
          <p className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300 text-lg">
            {post.content}
          </p>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 my-12"></div>

        {/* Comments Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center">
            <MessageSquare className="mr-3 text-brand-600" />
            Comments ({comments.length})
          </h3>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-12 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-4">
                   {user.avatar ? (
                     <img src={user.avatar} className="w-8 h-8 rounded-full" alt={user.name} />
                   ) : (
                     <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600"><User size={14}/></div>
                   )}
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Posting as {user.name}</span>
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all resize-none placeholder-slate-400 dark:placeholder-slate-500"
                  rows={3}
                  placeholder="Share your thoughts on this topic..."
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center shadow-lg shadow-brand-500/20">
                  <Send size={16} className="mr-2" />
                  Post Comment
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-2xl mb-10 text-center border border-slate-200 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-300 mb-4">Join the conversation by signing in to your account.</p>
              <a href="/#/login" className="inline-block bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity">
                Sign In to Comment
              </a>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4 animate-fade-in">
                <div className="flex-shrink-0">
                  {comment.author?.avatar ? (
                     <img src={comment.author.avatar} alt="User" className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-800" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <User size={20} className="text-slate-500" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{comment.author?.name || 'Unknown User'}</h4>
                      <span className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-12 opacity-50">
                <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 italic">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};
