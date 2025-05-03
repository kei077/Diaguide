import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, Clock, User, Search } from 'lucide-react';

// Mock data - would be replaced with actual API calls
const mockQuestions = [
  {
    id: '1',
    title: 'How does exercise affect blood sugar levels?',
    content: 'I\'ve noticed my blood sugar levels change after working out. Can someone explain the relationship between exercise and diabetes?',
    author: 'Wisal EL ALOUAN',
    role: 'patient',
    createdAt: '2024-03-15T10:30:00Z',
    answers: [
      {
        id: '1',
        content: 'Exercise generally lowers blood sugar levels as your muscles use glucose for energy. It\'s important to monitor your levels before, during, and after exercise.',
        author: 'Dr. Kawtar TAIK',
        role: 'doctor',
        createdAt: '2024-03-15T11:00:00Z',
        isValidated: true,
      }
    ],
    status: 'answered',
    tags: ['exercise', 'blood sugar']
  },
  {
    id: '2',
    title: 'Best practices for managing diabetes during Ramadan?',
    content: 'I would like to know how to safely manage my diabetes while fasting during Ramadan.',
    author: 'Ahmed Hassan',
    role: 'patient',
    createdAt: '2024-03-14T09:15:00Z',
    answers: [],
    status: 'open',
    tags: ['ramadan', 'fasting']
  }
];

function QuestionForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, tags: tags.split(',').map(tag => tag.trim()) });
    setTitle('');
    setContent('');
    setTags('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Question Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
            px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 
            focus:border-primary-500 focus:ring-primary-500 sm:text-sm
            dark:bg-gray-700"
          placeholder="What would you like to know?"
          required
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Question Details
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
            px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400
            focus:border-primary-500 focus:ring-primary-500 sm:text-sm
            dark:bg-gray-700"
          placeholder="Provide more details about your question..."
          required
        />
      </div>
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
            px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400
            focus:border-primary-500 focus:ring-primary-500 sm:text-sm
            dark:bg-gray-700"
          placeholder="e.g., diet, exercise, medication"
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          Post Question
        </Button>
      </div>
    </form>
  );
}

function AnswerForm({ onSubmit, onCancel }: { onSubmit: (content: string) => void; onCancel: () => void }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Your Answer
        </label>
        <textarea
          id="answer"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600
            px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400
            focus:border-primary-500 focus:ring-primary-500 sm:text-sm
            dark:bg-gray-700"
          placeholder="Share your knowledge or experience..."
          required
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          Post Answer
        </Button>
      </div>
    </form>
  );
}

function QuestionCard({ question }: { question: any }) {
  const { user } = useAuth();
  const [isAnswering, setIsAnswering] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  const handleAnswer = (content: string) => {
    // Here you would typically make an API call to save the answer
    console.log('New answer:', content);
    setIsAnswering(false);
  };

  const displayedAnswers = showAllAnswers ? question.answers : question.answers.slice(0, 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {question.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Asked by {question.author} • {new Date(question.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {question.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-primary-50 dark:bg-gray-700 
                text-primary-700 dark:text-primary-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300">{question.content}</p>

      <div className="space-y-4">
        {displayedAnswers.map((answer: any) => (
          <div
            key={answer.id}
            className="pl-4 border-l-2 border-primary-200 dark:border-gray-600 space-y-2"
          >
            <p className="text-gray-700 dark:text-gray-300">{answer.content}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <User className="h-4 w-4" />
                <span>{answer.author}</span>
                {answer.isValidated && (
                  <span className="text-green-600 dark:text-green-400">✓ Validated</span>
                )}
              </div>
              <Button variant="ghost" size="sm">
                <ThumbsUp className="h-4 w-4 mr-1" />
                Helpful
              </Button>
            </div>
          </div>
        ))}

        {question.answers.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllAnswers(!showAllAnswers)}
          >
            {showAllAnswers ? 'Show less' : `Show ${question.answers.length - 1} more answers`}
          </Button>
        )}
      </div>

      {!isAnswering && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAnswering(true)}
          className="mt-4"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Add Answer
        </Button>
      )}

      {isAnswering && (
        <div className="mt-4">
          <AnswerForm
            onSubmit={handleAnswer}
            onCancel={() => setIsAnswering(false)}
          />
        </div>
      )}
    </div>
  );
}

export function QAForum() {
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleNewQuestion = (data: any) => {
    // Here you would typically make an API call to save the question
    console.log('New question:', data);
    setIsAskingQuestion(false);
  };

  const filteredQuestions = mockQuestions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'unanswered') return matchesSearch && question.answers.length === 0;
    if (selectedFilter === 'answered') return matchesSearch && question.answers.length > 0;
    return matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Q&A Forum</h1>
        <Button onClick={() => setIsAskingQuestion(true)}>
          <MessageSquare className="h-5 w-5 mr-2" />
          Ask a Question
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600
              focus:border-primary-500 focus:ring-primary-500
              dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2
            focus:border-primary-500 focus:ring-primary-500
            dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="all">All Questions</option>
          <option value="unanswered">Unanswered</option>
          <option value="answered">Answered</option>
        </select>
      </div>

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
        </div>
      )}
    </div>
  );
}