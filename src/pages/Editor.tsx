
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import type { Category } from '../types';
import { Save, ArrowLeft, Image as ImageIcon, Upload, X, AlertCircle } from 'lucide-react';
import { toast } from '../components/Toast';

export const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // If ID exists, it's edit mode
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common style for inputs to ensure visibility
  const inputStyle = "w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all";

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const init = async () => {
      try {
        // Load Categories
        const cats = await db.getCategories();
        setCategories(cats);
        
        // Default to first category if new post
        if (!id && cats.length > 0) {
            setSelectedCategoryId(cats[0].id);
        }

        if (id) {
          // Edit Mode: Load existing data
          const post = await db.getPostById(id);
          if (post && post.user_id === user.id) {
            setTitle(post.title);
            setContent(post.content);
            setImageUrl(post.image || '');
            if (post.category_id) setSelectedCategoryId(post.category_id);
            else if (cats.length > 0) setSelectedCategoryId(cats[0].id);
          } else {
            // Not found or unauthorized
            navigate('/');
          }
        }
      } catch (e) {
        console.error("Failed to initialize editor", e);
        setError("Failed to load editor data. Please try refreshing.");
      }
    };
    init();
  }, [id, user, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simple validation for file size (e.g., < 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Please select an image under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!selectedCategoryId) {
        toast.warn("Please select a category.");
        return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (id) {
        await db.updatePost(id, { 
          title, 
          content, 
          image: imageUrl,
          category_id: selectedCategoryId 
        });
        toast.success('Post updated');
        navigate(`/post/${id}`);
      } else {
        const newPost = await db.createPost({
          title,
          content,
          image: imageUrl, 
          user_id: user.id,
          category_id: selectedCategoryId
        });
        toast.success('Post published');
        navigate(`/post/${newPost.id}`);
      }
    } catch (error) {
      console.error("Failed to save post", error);
      setError("An error occurred while saving. Please try again.");
      toast.error("Could not save the post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/90 dark:bg-transparent py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-brand-600 mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 p-4 rounded-xl flex items-center">
                <AlertCircle size={20} className="mr-3" />
                {error}
            </div>
        )}

        <div className="bg-white/95 dark:bg-slate-800/85 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-600/70 backdrop-blur">
          <div className="flex justify-between items-center mb-8">
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
               {id ? 'Edit Post' : 'Create New Post'}
             </h1>
             <span className="text-sm text-slate-400">
                {id ? 'Updating existing content' : 'Share your knowledge'}
             </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Article Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., The Complete Guide to React Hooks"
                className={`${inputStyle} text-lg font-medium`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Select */}
              <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                 <div className="relative">
                    <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className={`${inputStyle} appearance-none`}
                    >
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="dark:bg-slate-900">{cat.name}</option>
                    ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                 </div>
              </div>
              
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Cover Image</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                {!imageUrl ? (
                  <button 
                    type="button"
                    onClick={triggerFileInput}
                    className="w-full h-[52px] px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-brand-400 hover:text-brand-500 transition-all flex items-center justify-center space-x-2 group"
                  >
                    <Upload size={18} className="group-hover:scale-110 transition-transform" />
                    <span>Upload Image</span>
                  </button>
                ) : (
                  <div className="w-full h-[52px] flex items-center space-x-3">
                     <div className="flex-grow px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm truncate flex items-center">
                        <ImageIcon size={16} className="mr-2 flex-shrink-0" />
                        <span className="truncate">Image Selected</span>
                     </div>
                     <button 
                       type="button"
                       onClick={removeImage}
                       className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-800/50 transition-colors"
                       title="Remove image"
                     >
                       <X size={18} />
                     </button>
                  </div>
                )}
              </div>
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div className="mt-2 rounded-xl overflow-hidden h-64 w-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-black/20 relative group">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <button type="button" onClick={triggerFileInput} className="text-white font-medium bg-white/20 backdrop-blur-sm border border-white/40 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">Change Cover Image</button>
                </div>
              </div>
            )}

            {/* Content Editor */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Content</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                placeholder="Write your story here... (Markdown supported)"
                className={`${inputStyle} font-mono text-sm leading-relaxed`}
              />
              <p className="text-xs text-slate-400 text-right">Supports basic text formatting</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end pt-6 border-t border-slate-100 dark:border-slate-700 space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center bg-brand-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 hover:shadow-brand-500/50 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:transform-none disabled:shadow-none"
              >
                <Save size={18} className="mr-2" />
                {isSubmitting ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
