import React, { useState , useEffect} from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  User as UserIcon, 
  ThumbsUp, 
  MessageSquare, 
  Search as SearchIcon,
  Clock  // Ajoutez ceci si vous utilisez Clock quelque part
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import axios from 'axios'; 
interface QuestionData {
  id: string;
  title: string;
  body: string;
  author: UserData;
  created_at: string;
  answers: AnswerData[];
}

// Interface pour les données de réponse
interface AnswerData {
  id: number;
  body: string;
  author: UserData;
  created_at: string;
}

interface AnswerFormProps {
  questionId: number;
  onSubmit: (createdAnswer: any) => void;
  onCancel: () => void;
}

interface QuestionFormProps {
  onSubmit: (createdQuestion: any) => void;
  onCancel: () => void;
}
// Interface pour l'utilisateur
interface UserData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

interface AnswerData {
  id: number;
  body: string;
  author: UserData;
  created_at: string;
}

export function QuestionForm({ onSubmit, onCancel }: QuestionFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !body.trim()) {
      setError('Le titre et le contenu sont obligatoires.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const response = await axios.post(
        'http://localhost:8000/forum/questions/',
        { title, body },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      // On appelle bien onSubmit et non onSucces
      onSubmit(response.data);
      setTitle('');
      setBody('');
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        'Une erreur est survenue lors de la création de la question.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      {error && (
        <div className="text-red-600">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Titre de la question
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border px-3 py-2"
          placeholder="Quel est votre sujet ?"
          required
          disabled={submitting}
        />
      </div>
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Détails
        </label>
        <textarea
          id="body"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border px-3 py-2"
          placeholder="Expliquez votre question en détail..."
          required
          disabled={submitting}
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Publication…' : 'Poser la question'}
        </Button>
      </div>
    </form>
  );
}
export function AnswerForm({
  questionId,
  onSubmit,
  onCancel,
}: AnswerFormProps) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!body.trim()) {
      setError('Le contenu de la réponse ne peut pas être vide.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const response = await axios.post(
        `http://localhost:8000/forum/questions/${questionId}/answers/`,
        { body },
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      // Ne garder que les champs attendus par QuestionCard
      const {
        id,
        body: newBody,
        author,
        created_at,
      } = response.data;

      onSubmit({
        id,
        body: newBody,
        author,
        created_at,
      });
      setBody('');
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        'Une erreur est survenue lors de l’envoi de la réponse.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600">{error}</div>}

      <div>
        <label
          htmlFor="answer"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Votre réponse
        </label>
        <textarea
          id="answer"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border px-3 py-2"
          placeholder="Partagez vos connaissances..."
          required
          disabled={submitting}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Envoi…' : 'Poster la réponse'}
        </Button>
      </div>
    </form>
  );
}
interface QuestionCardProps {
  question: {
    id: number;
    title: string;
    body: string;
    created_at: string;
    answers: AnswerData[];
  };
}
export function QuestionCard({ question }: QuestionCardProps) {
  const [isAnswering, setIsAnswering] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [answers, setAnswers] = useState<AnswerData[]>(question.answers);

  // Debug des données reçues
  useEffect(() => {
    console.log('Données de la question:', {
      id: question.id,
      title: question.title,
      body: question.body,
      created_at: question.created_at,
      answers: question.answers.map(a => ({
        id: a.id,
       
        preview: a.body.substring(0, 20) + (a.body.length > 20 ? '...' : '')
      }))
    });
  }, [question]);

  const handleAnswerSubmit = (newAnswer: AnswerData) => {
    console.log('Ajout réponse:', {
      id: newAnswer.id,
      
      length: newAnswer.body.length
    });

    // Validation de la réponse
    if (!newAnswer.author) {
      console.error('Réponse sans auteur valide', newAnswer);
      return;
    }

    setAnswers(prev => {
      const updatedAnswers = [newAnswer, ...prev];
      console.log('Total réponses:', updatedAnswers.length);
      return updatedAnswers;
    });
    
    setIsAnswering(false);
  };

  const displayedAnswers = showAllAnswers ? answers : answers.slice(0, 1);

  const renderAnswer = (answer: AnswerData) => {
    if (!answer.author) {
      console.warn('Réponse sans auteur détectée, ID:', answer.id);
      return null;
    }

    return (
      <div key={answer.id} className="pl-4 border-l-2 border-primary-200 dark:border-gray-600 space-y-2">
        <p className="text-gray-700 dark:text-gray-300">{answer.body}</p>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <UserIcon className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium" data-testid={`answer-author-${answer.id}`}>
          {answer.author.prenom} {answer.author.nom}
          </span>
          <span>• {new Date(answer.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4 mb-4">
      {/* En-tête */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {question.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <UserIcon className="h-4 w-4" />
        
          <span>• {new Date(question.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Contenu */}
      <p className="text-gray-700 dark:text-gray-300">{question.body}</p>

      {/* Réponses */}
      <div className="space-y-4">
        {displayedAnswers.length > 0 ? (
          displayedAnswers.map(renderAnswer)
        ) : (
          <p className="text-sm text-gray-400 italic">Aucune réponse pour le moment</p>
        )}

        {answers.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllAnswers(!showAllAnswers)}
            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {showAllAnswers
              ? 'Réduire les réponses'
              : `Voir les ${answers.length - 1} autres réponses`}
          </Button>
        )}
      </div>

      {/* Formulaire de réponse */}
      <div className="pt-2">
        {isAnswering ? (
          <AnswerForm
            questionId={question.id}
            onSubmit={handleAnswerSubmit}
            onCancel={() => setIsAnswering(false)}
          />
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAnswering(true)}
            className="mt-2"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {answers.length > 0 ? 'Ajouter une réponse' : 'Répondre'}
          </Button>
        )}
      </div>
    </div>
  );
}
export function QAForum() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all'|'unanswered'|'answered'>('all');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await axios.get(
        'http://localhost:8000/forum/questions/',
        { headers: { 'Authorization': `Token ${token}` }, withCredentials: true }
      );
  
      // On retire les doublons sur titre + body
      const unique = res.data.filter(
        (q: any, idx: number, arr: any[]) => 
          idx === arr.findIndex(el => el.title === q.title && el.body === q.body)
      );
  
      setQuestions(unique);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les questions.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleNewQuestion = (createdQuestion: QuestionData) => {
    // on a déjà créé la question côté QuestionForm
    setQuestions(prev => [createdQuestion, ...prev]);
    setIsAskingQuestion(false);
  };

  // Filtrage et recherche
  const filteredQuestions = questions.filter(q => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.body.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'unanswered') {
      return matchesSearch && q.answers.length === 0;
    }
    if (selectedFilter === 'answered') {
      return matchesSearch && q.answers.length > 0;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="text-center py-6">
        Chargement des questions…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {error && (
        <div className="text-red-600">
          {error}
        </div>
      )}

      {/* En-tête + bouton poser une question */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Forum de Questions/Réponses
        </h1>
        <Button onClick={() => setIsAskingQuestion(true)}>
          <MessageSquare className="h-5 w-5 mr-2" />
          Poser une question
        </Button>
      </div>

      {/* Recherche et filtres */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600
              focus:border-primary-500 focus:ring-primary-500
              dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        <select
          value={selectedFilter}
          onChange={e => setSelectedFilter(e.target.value as any)}
          className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2
            focus:border-primary-500 focus:ring-primary-500
            dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="all">Toutes</option>
          <option value="unanswered">Sans réponse</option>
          <option value="answered">Avec réponse</option>
        </select>
      </div>

      {/* Formulaire ou liste */}
      {isAskingQuestion ? (
        <QuestionForm
          onSubmit={handleNewQuestion}
          onCancel={() => setIsAskingQuestion(false)}
        />
      ) : (
        <div className="space-y-6">
          {filteredQuestions.map(question => (
            <QuestionCard key={question.id} question={question} />
          ))}
          {filteredQuestions.length === 0 && (
            <p className="text-center text-gray-500">
              Aucune question trouvée.
            </p>
          )}
        </div>
      )}
    </div>
  );
}