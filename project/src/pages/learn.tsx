import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, X, Send, ArrowLeft } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  content: string;
  description: string;

  image: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ApiResponse {
  réponse?: string;
  error?: string;
}

export function Learn() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm DiaguideBot. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch articles from backend
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const response = await fetch('http://localhost:8000/content/articles/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        
        const data = await response.json();
        console.log('Response status:', response.status); // Log status
        console.log('Response data:', data); // Log response data
        
        // Transformez les données pour correspondre à votre interface Article
        const formattedArticles = data.map((item: any) => ({
          id: item.id,
          title: item.titre,
          content: item.text || '',
          description: item.description || 'No description available',
          image: item.image || 'data:image/png;base64,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',
          author: {
            name: item.auteur?.full_name 
      || (item.auteur_prenom && item.auteur_nom 
          ? `${item.auteur_prenom} ${item.auteur_nom}`
          : 'Unknown Author'),
            role: item.auteur?.role || 'Author',
            avatar: 'data:image/png;base64,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'
          }
        }));

        
        
        setArticles(formattedArticles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
  
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');

    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch('http://localhost:8000/content/question/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          question: newMessage
        })
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from server');
      }

      const botMessage: Message = {
        id: messages.length + 2,
        text: data.réponse || "I couldn't understand that. Could you rephrase?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  if (loading) {
    return <div className="p-6 max-w-7xl mx-auto">Loading articles...</div>;
  }

  if (error) {
    return <div className="p-6 max-w-7xl mx-auto text-red-500">Error: {error}</div>;
  }

  if (selectedArticle) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to articles
        </button>

        <img
          src={selectedArticle.image}
          alt={selectedArticle.title}
          className="w-full h-64 object-cover rounded-xl mb-6"
        />

        <div className="flex items-center gap-4 mb-6">
          <img
            src={selectedArticle.author.avatar}
            alt={selectedArticle.author.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h4 className="font-medium">{selectedArticle.author.name}</h4>
            <p className="text-sm text-gray-500">{selectedArticle.author.role}</p>
          </div>
          
        </div>

        <h1 className="text-4xl font-bold mb-4">{selectedArticle.title}</h1>
        <p className="text-gray-600 mb-8">{selectedArticle.description}</p>

        <div className="prose max-w-none">
          {selectedArticle.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedArticle(article)}
          >
            <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <img src={article.author.avatar} alt={article.author.name} className="w-10 h-10 rounded-full" />
                <div>
                  <h4 className="font-medium text-sm">{article.author.name}</h4>
                  <p className="text-xs text-gray-500">{article.author.role}</p>
                </div>
                
              </div>
              <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{article.description}</p>
              <button className="text-primary-600 font-medium text-sm hover:text-primary-700">
                Read more →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Chatbot */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors ${
          isChatOpen ? 'hidden' : ''
        }`}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-xl">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold">DiaguideBot</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}