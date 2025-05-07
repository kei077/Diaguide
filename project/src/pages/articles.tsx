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
  AlertCircle
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
    id: number;  // Notez que c'est un number
    nom: string;
    email: string;
    prenom: string;
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* TITLE */}
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          {...register('title')}
          className="mt-1 block w-full rounded-md border px-3 py-2"
          placeholder="Enter article title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.title.message}
          </p>
        )}
      </div>

      {/* SUMMARY */}
      <div>
        <label className="block text-sm font-medium">Summary</label>
        <textarea
          {...register('summary')}
          rows={3}
          className="mt-1 block w-full rounded-md border px-3 py-2"
          placeholder="Brief summary"
        />
        {errors.summary && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.summary.message}
          </p>
        )}
      </div>

      {/* CONTENT */}
      <div>
        <label className="block text-sm font-medium">Content</label>
        <textarea
          {...register('content')}
          rows={10}
          className="mt-1 block w-full rounded-md border px-3 py-2 font-mono"
          placeholder="Write here…"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.content.message}
          </p>
        )}
      </div>

      {/* COVER IMAGE & VIDEO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium">Cover Image URL</label>
          <div className="mt-1 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              {...register('coverImage')}
              className="w-full rounded-md border px-3 py-2"
              placeholder="https://..."
            />
          </div>
          {coverImage && (
            <div className="mt-2 h-40 w-full overflow-hidden rounded-lg bg-gray-100">
              <img
                src={coverImage}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) =>
                  (e.currentTarget.src =
                    'https://via.placeholder.com/800x400?text=Invalid+URL')
                }
              />
            </div>
          )}
          {errors.coverImage && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.coverImage.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Video URL</label>
          <div className="mt-1 flex items-center gap-2">
            <Video className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              {...register('videoUrl')}
              className="w-full rounded-md border px-3 py-2"
              placeholder="https://..."
            />
          </div>
          {errors.videoUrl && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.videoUrl.message}
            </p>
          )}
        </div>
      </div>

      {/* TAGS */}
      <div>
        <label className="block text-sm font-medium">Tags (comma separated)</label>
        <div className="mt-1 flex items-center gap-2">
          <Tags className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            {...register('tags')}
            className="w-full rounded-md border px-3 py-2"
            placeholder="tag1, tag2, ..."
          />
        </div>
        {errors.tags && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.tags.message}
          </p>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Publish Article
        </Button>
      </div>
    </form>
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
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition">
      {article.coverImage && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">{article.title}</h3>
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Published
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">{article.summary}</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(article)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(article.id)}>
            <Trash2 className="h-4 w-4" />
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
        console.log('[DEBUG] Token:', token);
        const res = await axios.get<BackArticle[]>(
          'http://localhost:8000/content/articles/',
          { headers: { Authorization: `Token ${token}` }, withCredentials: true }
        );
        console.log('[DEBUG] id user', user.id);
        console.log('[DEBUG] Réponse API brute:', res.data);
        // Log des données brutes
        
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
          authorId: b.auteur.id.toString(), // Conversion en string pour le state
          authorName: `${b.auteur.prenom} ${b.auteur.nom}`,
          createdAt: b.date_publication,
          updatedAt: b.date_publication
        })
      );
        
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

    console.log('Soumission article - Données envoyées:', {
      payload: payload,
      authorInfo: {
        authorId: formData.authorId,
        authorName: formData.authorName
      },
      isEdit: !!editing,
      editingId: editing?.id
    });

    try {
      const baseUrl = 'http://localhost:8000/content/articles/';
      let response;

      if (editing) {
        console.log(`Mise à jour article existant ID: ${editing.id}`);
        response = await axios.put(
          `${baseUrl}${editing.id}/`,
          payload,
          { 
            headers: { Authorization: `Token ${token}` }, 
            withCredentials: true 
          }
        );
      } else {
        console.log('Création nouvel article');
        response = await axios.post(
          baseUrl,
          payload,
          { 
            headers: { Authorization: `Token ${token}` }, 
            withCredentials: true 
          }
        );
      }

      console.log('Réponse API après soumission:', response.data);

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

      console.log('Article mis à jour/local:', updatedArticle);

      setArticles(prev =>
        editing
          ? prev.map(a => {
              if (a.id === updatedArticle.id) {
                console.log('Remplacement article existant:', a, 'par:', updatedArticle);
                return updatedArticle;
              }
              return a;
            })
          : [updatedArticle, ...prev]
      );

      setIsCreating(false);
      setEditing(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', {
        error: err,
        payload: payload,
        context: {
          isEditing: !!editing,
          articleId: editing?.id,
          authorInfo: {
            id: formData.authorId,
            name: formData.authorName
          }
        }
      });
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    
    const token = localStorage.getItem('token') || '';
    try {
      await axios.delete(
        `http://localhost:8000/content/articles/${id}/`,
        { headers: { Authorization: `Token ${token}` }, withCredentials: true }
      );
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Impossible de supprimer');
      console.error('Error deleting article:', err);
    }
  };

  const filteredArticles = articles.filter(a => {
    return (
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Articles</h1>
          <p className="text-gray-500">Écrivez et gérez vos articles</p>
        </div>
        <Button
          onClick={() => {
            setIsCreating(!isCreating);
            setEditing(null);
          }}
        >
          <PenSquare className="h-5 w-5 mr-2" />
          {isCreating ? 'Annuler' : 'Nouveau'}
        </Button>
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
          <div className="flex gap-4 bg-white p-4 rounded shadow">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full pl-10 pr-4 py-2 border rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((a) => (
              <ArticleCard
                key={a.id}
                article={a}
                onEdit={(art) => {
                  setEditing(art);
                  setIsCreating(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <p className="text-center text-gray-500 py-12">Aucun article</p>
          )}
        </>
      )}
    </div>
  );
}