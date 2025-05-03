import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Article, articleSchema } from '@/types';
import {
  PenSquare,
  Image as ImageIcon,
  Video,
  Tags,
  Plus,
  Eye,
  Trash2,
  Edit2,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';

// Mock data - replace with actual API calls
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Understanding Type 2 Diabetes',
    summary: 'A comprehensive guide to managing type 2 diabetes effectively.',
    content: '# Understanding Type 2 Diabetes\n\nType 2 diabetes is a chronic condition...',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800',
    tags: ['diabetes', 'health', 'management'],
    status: 'published',
    authorId: 'doctor-1',
    authorName: 'Dr. Kawtar TAIK',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z'
  }
];

function ArticleForm({ onSubmit, initialData = null, onCancel }: { 
  onSubmit: (data: any) => void; 
  initialData?: Article | null;
  onCancel: () => void;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(articleSchema),
    defaultValues: initialData || {
      title: '',
      summary: '',
      content: '',
      coverImage: '',
      videoUrl: '',
      tags: [],
      status: 'draft'
    }
  });

  const coverImage = watch('coverImage');
  const videoUrl = watch('videoUrl');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Title
        </label>
        <input
          type="text"
          {...register('title')}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
            px-3 py-2 text-gray-900 dark:text-gray-100 
            focus:border-primary-500 focus:ring-primary-500
            dark:bg-gray-700 transition-colors duration-200"
          placeholder="Enter article title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Summary
        </label>
        <textarea
          {...register('summary')}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
            px-3 py-2 text-gray-900 dark:text-gray-100 
            focus:border-primary-500 focus:ring-primary-500
            dark:bg-gray-700 transition-colors duration-200"
          placeholder="Brief summary of the article"
        />
        {errors.summary && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.summary.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Content
        </label>
        <textarea
          {...register('content')}
          rows={10}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
            px-3 py-2 text-gray-900 dark:text-gray-100 
            focus:border-primary-500 focus:ring-primary-500
            dark:bg-gray-700 font-mono transition-colors duration-200"
          placeholder="Write your article content here (Markdown supported)"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.content.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Cover Image URL
          </label>
          <div className="mt-1">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                {...register('coverImage')}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  px-3 py-2 text-gray-900 dark:text-gray-100 
                  focus:border-primary-500 focus:ring-primary-500
                  dark:bg-gray-700 transition-colors duration-200"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {coverImage && (
              <div className="mt-2 relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Video URL (Optional)
          </label>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              {...register('videoUrl')}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-gray-900 dark:text-gray-100 
                focus:border-primary-500 focus:ring-primary-500
                dark:bg-gray-700 transition-colors duration-200"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Tags (comma-separated)
        </label>
        <div className="flex items-center gap-2">
          <Tags className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            {...register('tags')}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-gray-900 dark:text-gray-100 
              focus:border-primary-500 focus:ring-primary-500
              dark:bg-gray-700 transition-colors duration-200"
            placeholder="diabetes, health, management"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-gray-300 dark:border-gray-600"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          name="status"
          value="draft"
          variant="outline"
          disabled={isSubmitting}
        >
          Save as Draft
        </Button>
        <Button
          type="submit"
          name="status"
          value="published"
          disabled={isSubmitting}
        >
          Publish
        </Button>
      </div>
    </form>
  );
}

function ArticleCard({ article, onEdit, onDelete }: { 
  article: Article; 
  onEdit: (article: Article) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group">
      {article.coverImage && (
        <div className="relative h-48 rounded-t-lg overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {article.title}
          </h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            article.status === 'published' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
          }`}>
            {article.status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          {article.summary}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-primary-50 dark:bg-primary-900/20 
                text-primary-700 dark:text-primary-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {new Date(article.updatedAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(article)}
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(article.id)}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArticlesPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState(mockArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== 'doctor') {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = (data: any) => {
    // Here you would typically make an API call to save the article
    console.log('Saving article:', data);
    
    const newArticle: Article = {
      id: editingArticle?.id || crypto.randomUUID(),
      ...data,
      authorId: user.id,
      authorName: user.name,
      createdAt: editingArticle?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()) : data.tags
    };

    if (editingArticle) {
      setArticles(articles.map(a => a.id === editingArticle.id ? newArticle : a));
    } else {
      setArticles([newArticle, ...articles]);
    }

    setIsCreating(false);
    setEditingArticle(null);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || article.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Articles</h1>
          <p className="text-gray-500 dark:text-gray-400">Write and manage your medical articles</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? (
            'Cancel'
          ) : (
            <>
              <PenSquare className="h-5 w-5 mr-2" />
              Write Article
            </>
          )}
        </Button>
      </div>

      {isCreating ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            {editingArticle ? 'Edit Article' : 'Create New Article'}
          </h2>
          <ArticleForm 
            onSubmit={handleSubmit}
            initialData={editingArticle}
            onCancel={() => {
              setIsCreating(false);
              setEditingArticle(null);
            }}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600
                  focus:border-primary-500 focus:ring-primary-500
                  dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2
                focus:border-primary-500 focus:ring-primary-500
                dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
            >
              <option value="all">All Articles</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No articles found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}