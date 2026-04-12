import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { User, ChevronRight, Mail, Link as LinkIcon } from 'lucide-react';
import { getBlogPostBySlug, incrementViewCount, getRelatedPosts, getImageUrl } from '@/lib/blogService.js';
import BlogSignupSection from '@/components/BlogSignupSection.jsx';
import Footer from '@/components/Footer.jsx';
import { useToast } from '@/components/ui/use-toast.js';

const blogContentStyles = `
  .blog-content p {
    color: #374151;
    font-size: 1.0625rem;
    line-height: 1.85;
    margin-bottom: 1.4rem;
  }
  .blog-content h2 {
    color: #b45309;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.3;
    margin-top: 2.8rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(180, 83, 9, 0.25);
    cursor: pointer;
    scroll-margin-top: 100px;
    transition: color 0.2s;
  }
  .blog-content h2:hover {
    color: #92400e;
  }
  .blog-content h2:hover::after {
    content: ' #';
    color: rgba(180, 83, 9, 0.5);
    font-size: 1.1rem;
    font-weight: 400;
  }
  .blog-content h3 {
    color: #b45309;
    font-size: 1.2rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    cursor: pointer;
    scroll-margin-top: 100px;
    transition: color 0.2s;
  }
  .blog-content h3:hover {
    color: #92400e;
  }
  .blog-content h3:hover::after {
    content: ' #';
    color: rgba(180, 83, 9, 0.4);
    font-size: 0.9rem;
    font-weight: 400;
  }
  .blog-content strong {
    color: #111827;
    font-weight: 600;
  }
  .blog-content ul {
    color: #374151;
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1.4rem;
  }
  .blog-content ol {
    color: #374151;
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-bottom: 1.4rem;
  }
  .blog-content li {
    margin-bottom: 0.4rem;
    line-height: 1.75;
  }
  .blog-content a {
    color: #b45309;
    text-decoration: underline;
  }
  .blog-content blockquote {
    border-left: 3px solid #b45309;
    padding-left: 1.25rem;
    margin: 1.5rem 0;
    color: #6b7280;
    font-style: italic;
  }
  .blog-content table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
    font-size: 0.92rem;
    overflow-x: auto;
    display: block;
  }
  .blog-content thead tr {
    background: rgba(180, 83, 9, 0.08);
    border-bottom: 2px solid rgba(180, 83, 9, 0.25);
  }
  .blog-content th {
    color: #b45309;
    font-weight: 700;
    padding: 12px 16px;
    text-align: left;
    white-space: nowrap;
  }
  .blog-content td {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    color: #374151;
    white-space: nowrap;
  }
  .blog-content tbody tr:nth-child(even) {
    background: rgba(0,0,0,0.02);
  }
  .blog-content tbody tr:last-child td {
    background: rgba(180, 83, 9, 0.05);
    color: #b45309;
    font-weight: 700;
    border-top: 2px solid rgba(180, 83, 9, 0.2);
  }
  .blog-content .table-note {
    font-size: 0.82rem;
    color: #6b7280;
    font-style: italic;
    margin-top: -1rem;
    margin-bottom: 2rem;
  }
`;

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      const record = await getBlogPostBySlug(slug);
      if (record) {
        setPost(record);
        await incrementViewCount(record.id);
        const related = await getRelatedPosts(slug);
        setRelatedPosts(related || []);
      } else {
        setError('Post not found');
      }
      setIsLoading(false);
    };
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const container = document.querySelector('.blog-content');
    if (!container) return;
    const headings = container.querySelectorAll('h2, h3');
    headings.forEach((heading) => {
      const id = heading.textContent
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50);
      heading.id = id;
      heading.style.cursor = 'pointer';
      heading.addEventListener('click', () => {
        const url = `${window.location.pathname}#${id}`;
        window.history.pushState(null, '', url);
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navigator.clipboard.writeText(window.location.origin + url).catch(() => {});
        toast({ title: 'Section link copied!', description: 'Link to this section copied to clipboard.' });
      });
    });
  }, [post]);

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post?.title || 'CarrVin Insights';
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast({ title: 'Link copied!', description: 'URL copied to clipboard.' });
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] text-gray-900 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
        <Link to="/insights" className="text-amber-600 hover:text-amber-700 transition-colors">Return to Insights</Link>
      </div>
    );
  }

  const imageUrl = post.featured_image ? getImageUrl(post, post.featured_image) : '';
  const socialImageUrl = post.social_image ? getImageUrl(post, post.social_image) : imageUrl;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-gray-900 pt-24">
      <style>{blogContentStyles}</style>

      <Helmet>
        <title>{`${post.meta_title || post.title} | CarrVin Insights`}</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt} />
        <meta property="og:image" content={socialImageUrl} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            image: socialImageUrl,
            author: { '@type': 'Person', name: post.author || 'CarrVin Team' },
            datePublished: post.created,
            description: post.excerpt,
          })}
        </script>
      </Helmet>

      <article className="container mx-auto px-6 max-w-4xl mb-24">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/insights" className="hover:text-gray-900 transition-colors">Insights</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-amber-700 truncate">{post.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          {post.category && (
            <span className="inline-block px-3 py-1 bg-amber-700/10 text-amber-700 text-xs rounded-full border border-amber-700/20 mb-4">
              {post.category}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
          {post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-6 border-l-2 border-amber-700/40 pl-4">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>{post.author || 'CarrVin Security Team'}</span>
          </div>
        </header>

        {/* Featured Image */}
        {imageUrl && (
          <div className="w-full h-[400px] rounded-2xl overflow-hidden mb-12 border border-gray-200">
            <img src={imageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div
          className="blog-content max-w-none mb-16"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-8 border-t border-b border-gray-200 mb-16 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm font-medium mr-2">Share this article:</span>
            <button onClick={() => handleShare('email')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors" title="Share via Email">
              <Mail className="w-4 h-4" />
            </button>
            <button onClick={() => handleShare('whatsapp')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors" title="Share on WhatsApp">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            </button>
            <button onClick={() => handleShare('telegram')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors" title="Share on Telegram">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.895-1.056-.68-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </button>
            <button onClick={() => handleShare('copy')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors" title="Copy Link">
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {post.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-amber-700/10 text-amber-700 text-xs rounded-full border border-amber-700/20">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-600">Related Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(related => (
                <Link
                  key={related.id}
                  to={`/insights/${related.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:border-amber-700/30 transition-all group"
                >
                  <h3 className="font-semibold mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">{related.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{related.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <BlogSignupSection />
      </article>
      <Footer />
    </div>
  );
};

export default BlogPostPage;
