import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, LogOut, Mail, X, Save } from 'lucide-react';
import { getAllBlogPostsAdmin, deleteBlogPost, createBlogPost, updateBlogPost, generateSlug } from '@/lib/blogService.js';
import { adminAuth } from '@/lib/utils.js';
import { useToast } from '@/components/ui/use-toast.js';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: '',
  author: 'CarrVin Team',
  published: false,
  featured_image: '',
};

const AdminBlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const records = await getAllBlogPostsAdmin();
      setPosts(records);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load posts." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    adminAuth.logout();
    navigate('/admin/login');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    const result = await deleteBlogPost(id);
    if (result && result.success) {
      toast({ title: "Success", description: "Post deleted locally." });
      if (result.syncResult?.success) {
        toast({ title: "Sync Success", description: "Post deleted from Live environment." });
      } else {
        toast({ variant: "destructive", title: "Sync Failed", description: `Failed to delete from Live: ${result.syncResult?.message || 'Unknown error'}` });
      }
      fetchPosts();
    } else {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete post locally." });
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || '',
      author: post.author || 'CarrVin Team',
      published: post.published || false,
      featured_image: post.featured_image || '',
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'title' && !editingPost ? { slug: generateSlug(value) } : {}),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast({ variant: "destructive", title: "Error", description: "Title and content are required." });
      return;
    }
    setIsSaving(true);
    try {
      if (editingPost) {
        const result = await updateBlogPost(editingPost.id, form);
        if (result?.record) {
          toast({ title: "Success", description: "Post updated locally." });
          if (result.syncResult?.success) {
            toast({ title: "Sync Success", description: "Post synced to Live environment." });
          } else {
            toast({ variant: "destructive", title: "Sync Failed", description: `Saved locally, but failed to sync: ${result.syncResult?.message || 'Unknown error'}` });
          }
        } else {
          throw new Error("Failed to update post locally");
        }
      } else {
        const result = await createBlogPost(form);
        if (result?.record) {
          toast({ title: "Success", description: "Post created locally." });
          if (result.syncResult?.success) {
            toast({ title: "Sync Success", description: "Post synced to Live environment." });
          } else {
            toast({ variant: "destructive", title: "Sync Failed", description: `Saved locally, but failed to sync: ${result.syncResult?.message || 'Unknown error'}` });
          }
        } else {
          throw new Error("Failed to create post locally");
        }
      }
      setShowForm(false);
      fetchPosts();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save post." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Administration</h1>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Support: hello@carrvin.com
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleNew}
              className="flex items-center gap-2 bg-amber-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Post
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{editingPost ? 'Edit Post' : 'New Post'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Title *</label>
                  <input name="title" value={form.title} onChange={handleFormChange} required
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-amber-700 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Slug</label>
                  <input name="slug" value={form.slug} onChange={handleFormChange}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-amber-700 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Excerpt</label>
                  <textarea name="excerpt" value={form.excerpt} onChange={handleFormChange} rows={2}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-amber-700 outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Content *</label>
                  <textarea name="content" value={form.content} onChange={handleFormChange} rows={10} required
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-amber-700 outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Category</label>
                    <input name="category" value={form.category} onChange={handleFormChange}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-amber-700 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Author</label>
                    <input name="author" value={form.author} onChange={handleFormChange}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-amber-700 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Featured Image URL</label>
                  <input name="featured_image" value={form.featured_image} onChange={handleFormChange}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-amber-700 outline-none" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="published" id="published" checked={form.published} onChange={handleFormChange}
                    className="w-4 h-4 accent-amber-700" />
                  <label htmlFor="published" className="text-sm text-gray-700">Published</label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-amber-700 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50">
                    <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No posts yet. Click "New Post" to create one.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-medium text-gray-600">Title</th>
                  <th className="p-4 font-medium text-gray-600">Slug</th>
                  <th className="p-4 font-medium text-gray-600">Status</th>
                  <th className="p-4 font-medium text-gray-600">Date</th>
                  <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{post.title}</td>
                    <td className="p-4 text-gray-500 text-sm">{post.slug}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${post.published ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(post.created).toLocaleDateString()}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => handleEdit(post)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(post.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBlogPage;