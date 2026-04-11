import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { getAllBlogPosts } from '@/lib/blogService.js';
import Footer from '@/components/Footer.jsx';

const BlogListPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const records = await getAllBlogPosts();
      setPosts(records);
    } catch (err) {
      console.error('BlogListPage: Error fetching posts:', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-gray-900 pt-24">
      <div className="container mx-auto px-6 max-w-7xl mb-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-yellow-600">
            Vehicle Theft Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real stories, education, and research on vehicle theft trends worldwide.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl h-64 animate-pulse p-6 flex flex-col">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
                <div className="mt-auto h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white border border-red-500/20 rounded-xl max-w-2xl mx-auto">
            <p className="text-red-500 mb-6">{error}</p>
            <button
              onClick={fetchPosts}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-amber-700/20"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white border border-gray-200 rounded-xl">
            No insights published yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-amber-700/10 transition-all duration-300 group flex flex-col"
              >
                <div className="p-6 flex flex-col flex-grow">
                  {post.category && (
                    <span className="inline-block px-2 py-1 bg-amber-700/10 text-amber-700 text-xs rounded-full border border-amber-700/20 mb-3 w-fit">
                      {post.category}
                    </span>
                  )}
                  <Link to={`/insights/${post.slug}`} className="block">
                    <h2 className="text-xl font-bold mb-3 group-hover:text-amber-700 transition-colors line-clamp-2 cursor-pointer">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-gray-400">By {post.author || 'CarrVin Team'}</span>
                    <Link
                      to={`/insights/${post.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-amber-700 transition-colors"
                    >
                      Read More <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BlogListPage;