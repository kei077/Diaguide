import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  User as UserIcon, 
  ThumbsUp, 
  MessageSquare, 
  Search as SearchIcon,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { cn } from '@/lib/utils';

interface QuestionData {
  id: string;
  title: string;
  body: string;
  author: UserData;
  created_at: string;
  answers: AnswerData[];
}

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

interface UserData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
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
      setError('Title and content are required.');
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
    <form onSubmit={handleSubmit} className={cn(
      "space-y-4 p-6 rounded-xl shadow-lg",
      "bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-800 dark:to-slate-700/90",
      "border border-slate-200/70 dark:border-slate-600/50",
      "animate-[fadeIn_0.3s_ease-in-out]"
    )}>
      {error && (
        <div className="text-red-600">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Question Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className={cn(
            "mt-1 block w-full rounded-md border px-3 py-2",
            "border-slate-300 dark:border-slate-600",
            "bg-white/80 dark:bg-slate-700/90",
            "focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          )}
          placeholder="What’s your topic?"
          required
          disabled={submitting}
        />
      </div>
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Details
        </label>
        <textarea
          id="body"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          className={cn(
            "mt-1 block w-full rounded-md border px-3 py-2",
            "border-slate-300 dark:border-slate-600",
            "bg-white/80 dark:bg-slate-700/90",
            "focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          )}
          placeholder="Explain your question in detail…"
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
          className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={submitting}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30"
        >
          {submitting ? 'Posting…' : 'Ask a question'}
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
      setError('Answer content cannot be empty.');
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
        'Une erreur est survenue lors de  l envoi de la réponse.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn(
      "space-y-4 p-4 rounded-xl",
      "bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-800/90 dark:to-slate-700/80",
      "border border-slate-200/70 dark:border-slate-600/50",
      "animate-[fadeIn_0.3s_ease-in-out]"
    )}>
      {error && <div className="text-red-600">{error}</div>}

      <div>
        <label
          htmlFor="answer"
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Your Answer
        </label>
        <textarea
          id="answer"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          className={cn(
            "mt-1 block w-full rounded-md border px-3 py-2",
            "border-slate-300 dark:border-slate-600",
            "bg-white/80 dark:bg-slate-700/90",
            "focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          )}
          placeholder="Share your knowledge..."
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
          className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={submitting}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30"
        >
          {submitting ? 'Sending…' : 'Post Answer'}
        </Button>
      </div>
    </form>
  );
}

export function QuestionCard({ question }: QuestionCardProps) {
  const [isAnswering, setIsAnswering] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [answers, setAnswers] = useState<AnswerData[]>(question.answers);

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
      <div 
        key={answer.id} 
        className={cn(
          "pl-4 border-l-2 space-y-2",
          "border-gradient-to-b from-emerald-400 to-teal-400",
          "animate-[fadeIn_0.3s_ease-in-out]"
        )}
      >
        <p className="text-slate-700 dark:text-slate-200">{answer.body}</p>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <UserIcon className="h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium" data-testid={`answer-author-${answer.id}`}>
            {answer.author.prenom} {answer.author.nom}
          </span>
          <span>• {new Date(answer.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "rounded-xl p-6 space-y-4 mb-4 shadow-lg",
      "bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-800 dark:to-slate-700/90",
      "border border-slate-200/70 dark:border-slate-600/50",
      "hover:shadow-xl hover:shadow-emerald-100/30 dark:hover:shadow-emerald-900/20",
      "transition-all duration-300 animate-[fadeIn_0.5s_ease-in-out]"
    )}>
      {/* En-tête */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
          {question.title}
        </h3>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <UserIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>• {new Date(question.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Contenu */}
      <p className="text-slate-700 dark:text-slate-200">{question.body}</p>

      {/* Réponses */}
      <div className="space-y-4">
        {displayedAnswers.length > 0 ? (
          displayedAnswers.map(renderAnswer)
        ) : (
          <p className="text-sm text-slate-400 italic">No answers yet.</p>
        )}

        {answers.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllAnswers(!showAllAnswers)}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
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
            className="mt-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700"
          >
            <MessageSquare className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
            {answers.length > 0 ? 'Add an Answer' : 'Reply'}
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
    setQuestions(prev => [createdQuestion, ...prev]);
    setIsAskingQuestion(false);
  };

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
      <div className="text-center py-6 text-slate-600 dark:text-slate-400">
         Loading questions…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 px-4">
      {error && (
        <div className="text-red-600">
          {error}
        </div>
      )}

      {/* En-tête avec nouveau style */}
      <div className={cn(
        "flex items-center justify-between p-4 rounded-xl",
        "bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-slate-800/80 dark:to-slate-700/80",
        "border border-emerald-100/50 dark:border-slate-600/50",
        "shadow-lg shadow-emerald-100/20 dark:shadow-emerald-900/10"
      )}>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Q&A Forum
        </h1>
        <Button 
          onClick={() => setIsAskingQuestion(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30"
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          Ask a Question
        </Button>
      </div>

      {/* Barre de recherche avec nouveau style */}
      <div className={cn(
        "flex items-center gap-4 p-4 rounded-xl",
        "bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-800 dark:to-slate-700/90",
        "border border-slate-200/70 dark:border-slate-600/50",
        "shadow-lg shadow-slate-100/20 dark:shadow-slate-900/10"
      )}>
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-md",
              "border border-slate-300 dark:border-slate-600",
              "focus:border-emerald-500 focus:ring-emerald-500",
              "bg-white/80 dark:bg-slate-700/90 dark:text-slate-100"
            )}
          />
        </div>
        <select
          value={selectedFilter}
          onChange={e => setSelectedFilter(e.target.value as any)}
          className={cn(
            "rounded-md px-3 py-2",
            "border border-slate-300 dark:border-slate-600",
            "focus:border-emerald-500 focus:ring-emerald-500",
            "bg-white/80 dark:bg-slate-700/90 dark:text-slate-100"
          )}
        >
          <option value="all">All</option>
          <option value="unanswered">Unanswered</option>
          <option value="answered">answered</option>
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
            <p className="text-center text-slate-500">
              No questions found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}