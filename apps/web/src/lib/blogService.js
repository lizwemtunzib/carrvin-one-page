import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';

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
    const records = await pb.collection('blog_posts').getFullList({
      sort: '-created',
      $autoCancel: false
    });
    return records || [];
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
    
    const record = await pb.collection('blog_posts').create({ ...postData, slug }, { 
      $autoCancel: false 
    });

    // Attempt to sync to Live
    let syncResult = { success: false, message: 'Sync not attempted' };
    try {
      const res = await apiServerClient.fetch('/sync/blog-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', postData: record })
      });
      syncResult = await res.json();
    } catch (syncErr) {
      console.error('blogService: Error syncing create:', syncErr);
      syncResult = { success: false, message: syncErr.message || 'Network error during sync' };
    }

    return { record, syncResult };
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
    
    const record = await pb.collection('blog_posts').update(id, { ...postData, slug }, { 
      $autoCancel: false 
    });

    // Attempt to sync to Live
    let syncResult = { success: false, message: 'Sync not attempted' };
    try {
      const res = await apiServerClient.fetch('/sync/blog-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', postId: id, postData: record })
      });
      syncResult = await res.json();
    } catch (syncErr) {
      console.error('blogService: Error syncing update:', syncErr);
      syncResult = { success: false, message: syncErr.message || 'Network error during sync' };
    }

    return { record, syncResult };
  } catch (error) {
    console.error('blogService: Error updating post:', error);
    return null;
  }
};

export const deleteBlogPost = async (id) => {
  try {
    await pb.collection('blog_posts').delete(id, { $autoCancel: false });

    // Attempt to sync to Live
    let syncResult = { success: false, message: 'Sync not attempted' };
    try {
      const res = await apiServerClient.fetch('/sync/blog-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', postId: id })
      });
      syncResult = await res.json();
    } catch (syncErr) {
      console.error('blogService: Error syncing delete:', syncErr);
      syncResult = { success: false, message: syncErr.message || 'Network error during sync' };
    }

    return { success: true, syncResult };
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
