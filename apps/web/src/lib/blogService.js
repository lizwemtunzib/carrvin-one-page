import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';

// Admin writes go through the API, which holds the PocketBase superuser
// session. Writing straight from the browser cannot work: blog_posts requires
// `@request.auth.id != ""` for create/update/delete and the browser has no
// PocketBase session, so every write here was being rejected.
//
// Public reads below still talk to PocketBase directly — listRule/viewRule are
// open, and that path already works.
const adminFetch = async (path, options = {}) => {
  const token = localStorage.getItem('admin_token');
  return apiServerClient.fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

// The API writes to the PocketBase instance the site actually serves, so a
// separate dev -> live sync step is no longer part of the save path.
const SAVED_DIRECTLY = { success: true, message: 'Saved to the live database.' };

export const generateSlug = (title) => {
  if (!title) return '';
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export const checkSlugExists = async (slug, excludeId = null) => {
  try {
    const filter = excludeId ? `slug="${slug}" && id!="${excludeId}"` : `slug="${slug}"`;
    const record = await pb.collection('blog_posts').getFirstListItem(filter, { $autoCancel: false });
    return !!record;
  } catch {
    return false;
  }
};

export const getAllBlogPosts = async () => {
  try {
    const records = await pb.collection('blog_posts').getFullList({
      filter: 'published = true',
      sort: '-created',
      $autoCancel: false
    });
    return records || [];
  } catch (error) {
    console.error('blogService: Error fetching published posts:', error);
    return [];
  }
};

export const getAllBlogPostsAdmin = async () => {
  try {
    const res = await adminFetch('/admin/blog');
    if (!res.ok) {
      console.error('blogService: Error fetching all posts:', res.status);
      return [];
    }
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('blogService: Error fetching all posts:', error);
    return [];
  }
};

export const getBlogPostBySlug = async (slug) => {
  try {
    const record = await pb.collection('blog_posts').getFirstListItem(`slug="${slug}"`, { 
      $autoCancel: false 
    });
    return record || null;
  } catch (error) {
    console.error('blogService: Error fetching post by slug:', error);
    return null;
  }
};

export const createBlogPost = async (postData) => {
  try {
    let baseSlug = postData.slug || generateSlug(postData.title);
    let slug = baseSlug;
    let counter = 2;
    while (await checkSlugExists(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    const res = await adminFetch('/admin/blog', {
      method: 'POST',
      body: JSON.stringify({ ...postData, slug }),
    });
    if (!res.ok) {
      console.error('blogService: Error creating post:', res.status);
      return null;
    }

    const { record } = await res.json();
    return { record, syncResult: SAVED_DIRECTLY };
  } catch (error) {
    console.error('blogService: Error creating post:', error);
    return null;
  }
};

export const updateBlogPost = async (id, postData) => {
  try {
    let slug = postData.slug;
    if (!slug && postData.title) {
      let baseSlug = generateSlug(postData.title);
      slug = baseSlug;
      let counter = 2;
      while (await checkSlugExists(slug, id)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }
    
    const res = await adminFetch(`/admin/blog/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...postData, slug }),
    });
    if (!res.ok) {
      console.error('blogService: Error updating post:', res.status);
      return null;
    }

    const { record } = await res.json();
    return { record, syncResult: SAVED_DIRECTLY };
  } catch (error) {
    console.error('blogService: Error updating post:', error);
    return null;
  }
};

export const deleteBlogPost = async (id) => {
  try {
    const res = await adminFetch(`/admin/blog/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      console.error('blogService: Error deleting post:', res.status);
      return { success: false };
    }

    return { success: true, syncResult: SAVED_DIRECTLY };
  } catch (error) {
    console.error('blogService: Error deleting post:', error);
    return { success: false };
  }
};

export const incrementViewCount = async (id) => {
  try {
    const post = await pb.collection('blog_posts').getOne(id, { $autoCancel: false });
    await pb.collection('blog_posts').update(id, { 
      view_count: (post.view_count || 0) + 1 
    }, { $autoCancel: false });
  } catch (error) {
    console.error('blogService: Error incrementing view count:', error);
  }
};

export const getRelatedPosts = async (slug, limit = 3) => {
  try {
    const result = await pb.collection('blog_posts').getList(1, limit, {
      filter: `slug != "${slug}" && published = true`,
      sort: '-created',
      $autoCancel: false
    });
    return result.items || [];
  } catch (error) {
    console.error('blogService: Error fetching related posts:', error);
    return [];
  }
};

export const getImageUrl = (record, filename) => {
  if (!record || !filename) return '';
  // If the filename is already a full URL (since featured_image is a text field in schema)
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  return pb.files.getUrl(record, filename);
};
