import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import axios from 'axios';
import { z } from 'zod';
import {
  PenSquare,
  Image as ImageIcon,
  Video,
  Tags,
  Trash2,
  Edit2,
  Search,
  AlertCircle,
  Calendar,
  User,
  FileText,
  Plus,
  X
} from 'lucide-react';

// Définir le schéma de validation
const articleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(1, 'Summary is required'),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().url('Invalid URL').optional().or(z.literal('')),
  videoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  tags: z.union([
    z.array(z.string()),
    z.string().transform((str: string) => str.split(',').map((tag: string) => tag.trim()))
  ])
});

type ArticleFormValues = z.infer<typeof articleSchema>;

type Article = ArticleFormValues & {
  status: 'published';
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

interface BackArticle {
  id: number;
  titre: string;
  description: string;
  text: string | null;
  image: string | null;
  video: string | null;
  keywords: string;
  auteur_id: number;
  date_publication: string;
  auteur: {
    id: number;
    nom: string;
    email: string;
    prenom: string;
    full_name: string;
  };
}

function ArticleForm({
  onSubmit,
  initialData = null,
  onCancel
}: {
  onSubmit: (data: Article) => void;
  initialData?: Article | null;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: initialData || {
      title: '',
      summary: '',
      content: '',
      coverImage: '',
      videoUrl: '',
      tags: []
    }
  });

  const coverImage = watch('coverImage');
  const videoUrl = watch('videoUrl');

  const handleFormSubmit = (data: ArticleFormValues) => {
    const processedData: Article = {
      ...data,
      id: data.id || '',
      coverImage: data.coverImage || '',
      videoUrl: data.videoUrl || '',
      tags: typeof data.tags === 'string' 
        ? data.tags.split(',').map((tag: string) => tag.trim())
        : data.tags,
      status: 'published',
      authorId: initialData?.authorId || '',
      authorName: initialData?.authorName || '',
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSubmit(processedData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <FileText className="h-6 w-6" />
          {initialData ? 'Modifier l\'article' : 'New article'}
        </h2>
        <p className="text-emerald-100 mt-1">
          {initialData ? 'Apportez vos modifications ci-dessous' : 'Create a new blog article'}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-8">
        {/* TITLE */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <PenSquare className="h-4 w-4 text-emerald-600" />
            Title 
          </label>
          <input
            type="text"
            {...register('title')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900 placeholder-gray-500"
            placeholder="Enter a catchy title..."
          />
          {errors.title && (
            <p className="text-red-500 text-sm flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              {errors.title.message}
            </p>
          )}
        </div>

        {/* SUMMARY */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FileText className="h-4 w-4 text-emerald-600" />
            Summary
          </label>
          <textarea
            {...register('summary')}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
            placeholder="A captivating summary of your article..."
          />
          {errors.summary && (
            <p className="text-red-500 text-sm flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              {errors.summary.message}
            </p>
          )}
        </div>

        {/* CONTENT */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Edit2 className="h-4 w-4 text-emerald-600" />
            Content
          </label>
          <textarea
            {...register('content')}
            rows={12}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900 placeholder-gray-500 font-mono text-sm resize-none"
            placeholder="Write your article here..."
          />
          {errors.content && (
            <p className="text-red-500 text-sm flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              {errors.content.message}
            </p>
          )}
        </div>

        {/* MEDIA SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* COVER IMAGE */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <ImageIcon className="h-4 w-4 text-emerald-600" />
              Cover Image URL 
            </label>
            <input
              type="text"
              {...register('coverImage')}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900 placeholder-gray-500"
              placeholder="https://exemple.com/image.jpg"
            />
            {coverImage && (
              <div className="relative group">
                <div className="h-48 w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
                  <img
                    src={coverImage}
                    alt="Aperçu"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) =>
                      (e.currentTarget.src =
                        'https://via.placeholder.com/800x400/f3f4f6/6b7280?text=Image+non+trouvée')
                    }
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                    Image preview
                  </span>
                </div>
              </div>
            )}
            {errors.coverImage && (
              <p className="text-red-500 text-sm flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                {errors.coverImage.message}
              </p>
            )}
          </div>

          {/* VIDEO URL */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Video className="h-4 w-4 text-emerald-600" />
              Video URL
            </label>
            <input
              type="text"
              {...register('videoUrl')}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900 placeholder-gray-500"
              placeholder="https://youtube.com/watch?v=..."
            />
            {videoUrl && (
              <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                <div className="flex items-center gap-3">
                  <Video className="h-6 w-6 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">Video added</p>
                    <p className="text-xs text-emerald-600 truncate max-w-xs">{videoUrl}</p>
                  </div>
                </div>
              </div>
            )}
            {errors.videoUrl && (
              <p className="text-red-500 text-sm flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                {errors.videoUrl.message}
              </p>
            )}
          </div>
        </div>

        {/* TAGS */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Tags className="h-4 w-4 text-emerald-600" />
            Tags 
          </label>
          <input
            type="text"
            {...register('tags')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900 placeholder-gray-500"
            placeholder="santé, médecine, conseils..."
          />
          {errors.tags && (
            <p className="text-red-500 text-sm flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              {errors.tags.message}
            </p>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            type="button" 
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Publishing...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Publish Article
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ArticleCard({
  article,
  onEdit,
  onDelete
}: {
  article: Article;
  onEdit: (a: Article) => void;
  onDelete: (id: string) => void;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200">
      {article.coverImage && (
        <div className="relative h-56 overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}
      
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start gap-3">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-200">
            {article.title}
          </h3>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 whitespace-nowrap">
            Published
          </span>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
          {article.summary}
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-200"
              >
                {tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-lg">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            
            {article.authorName}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(article.createdAt)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEdit(article)}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Modify
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(article.id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ArticlesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      navigate('/dashboard');
      return;
    }

    const fetchArticles = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const res = await axios.get<BackArticle[]>(
          'http://localhost:8000/content/articles/',
          { headers: { Authorization: `Token ${token}` }, withCredentials: true }
        );
        console.log('Fetched articles:', res.data);
        const mapped: Article[] = res.data.filter(b => b.auteur.email === user.id)
        .map(b => ({
          id: b.id.toString(),
          title: b.titre,
          summary: b.description,
          content: b.text || '',
          coverImage: b.image || '',
          videoUrl: b.video || '',
          tags: b.keywords.split(',').map(t => t.trim()),
          status: 'published',
          authorId: b.auteur.id.toString(),
          authorName: `${b.auteur.full_name}` ,
          createdAt: b.date_publication,
          updatedAt: b.date_publication
        }));
        
        setArticles(mapped);
      } catch (err) {
        setError('Impossible de charger les articles');
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [user, navigate]);

  const handleSubmit = async (formData: Article) => {
    const token = localStorage.getItem('token') || '';
    const payload = {
      titre: formData.title,
      description: formData.summary,
      text: formData.content,
      image: formData.coverImage || null,
      video: formData.videoUrl || null,
      keywords: Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags,
    };

    try {
      const baseUrl = 'http://localhost:8000/content/articles/';
      let response;

      if (editing) {
        response = await axios.put(
          `${baseUrl}${editing.id}/`,
          payload,
          { 
            headers: { Authorization: `Token ${token}` }, 
            withCredentials: true 
          }
        );
      } else {
        response = await axios.post(
          baseUrl,
          payload,
          { 
            headers: { Authorization: `Token ${token}` }, 
            withCredentials: true 
          }
        );
      }

      const b = response.data;
      const updatedArticle: Article = {
        id: b.id.toString(),
        title: b.titre,
        summary: b.description,
        content: b.text || '',
        coverImage: b.image || '',
        videoUrl: b.video || '',
        tags: b.keywords.split(',').map(t => t.trim()),
        status: 'published',
        authorId: formData.authorId,
        authorName: formData.authorName,
        createdAt: formData.createdAt,
        updatedAt: new Date().toISOString()
      };

      setArticles(prev =>
        editing
          ? prev.map(a => a.id === updatedArticle.id ? updatedArticle : a)
          : [updatedArticle, ...prev]
      );

      setIsCreating(false);
      setEditing(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.')) return;
    
    const token = localStorage.getItem('token') || '';
    try {
      await axios.delete(
        `http://localhost:8000/content/articles/${id}/`,
        { headers: { Authorization: `Token ${token}` }, withCredentials: true }
      );
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Impossible de supprimer l\'article');
      console.error('Error deleting article:', err);
    }
  };

  const filteredArticles = articles.filter(a => {
    return (
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 font-medium">Chargement de vos articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900">Erreur de chargement</h2>
          <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                My Articles
              </h1>
              <p className="text-gray-600 text-lg">
                Write and manage your articles easily
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {articles.length} article{articles.length !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {user?.name || 'Docteur'}
                </span>
              </div>
            </div>
            <Button
              onClick={() => {
                setIsCreating(!isCreating);
                setEditing(null);
              }}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PenSquare className="h-5 w-5 mr-2" />
              {isCreating ? 'Annuler' : 'New Article'}
            </Button>
          </div>
        </div>

        {isCreating ? (
          <ArticleForm
            initialData={editing || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsCreating(false);
              setEditing(null);
            }}
          />
        ) : (
          <>
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search through your articles..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Articles Grid */}
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onEdit={(art) => {
                      setEditing(art);
                      setIsCreating(true);
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 max-w-md mx-auto">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {search ? 'Aucun résultat' : 'Aucun article'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {search 
                      ? `Aucun article ne correspond à "${search}"`
                      : 'Commencez par créer votre premier article'
                    }
                  </p>
                  {!search && (
                    <Button
                      onClick={() => setIsCreating(true)}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Article
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}