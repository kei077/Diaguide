import React, { useState } from 'react';
import { Search, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface Article {
  id: number;
  title: string;
  content: string;
  description: string;
  readTime: string;
  image: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  status: 'pending' | 'approved' | 'rejected';
}

const initialArticles: Article[] = [
  {
    id: 1,
    title: "Understanding Type 1 Diabetes",
    content: `Type 1 diabetes is an autoimmune condition where your immune system attacks and destroys the insulin-producing beta cells in your pancreas. This means you can't produce the insulin you need to move glucose from your bloodstream into your cells for energy.

Key points about Type 1 Diabetes:
- Usually diagnosed in children and young adults
- Requires daily insulin therapy
- Cannot be prevented
- Requires careful monitoring of blood sugar levels

Management strategies include:
1. Regular blood sugar monitoring
2. Insulin therapy through injections or pump
3. Carbohydrate counting
4. Regular exercise
5. Healthy diet planning`,
    description: "A comprehensive guide to Type 1 Diabetes, its causes, symptoms, and management strategies.",
    readTime: "10 min",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=500",
    author: {
      name: "Dr. Sarah Johnson",
      role: "Endocrinologist",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100"
    },
    status: "pending"
  },
  {
    id: 2,
    title: "Managing Type 2 Diabetes Through Diet",
    content: `Diet plays a crucial role in managing Type 2 diabetes. A well-planned diet can help control blood sugar levels and maintain a healthy weight.

Recommended foods:
- Whole grains
- Lean proteins
- Healthy fats
- Non-starchy vegetables
- Low-glycemic fruits

Tips for meal planning:
1. Control portion sizes
2. Eat at regular intervals
3. Count carbohydrates
4. Choose foods high in fiber
5. Limit processed foods`,
    description: "Learn about dietary recommendations and meal planning for Type 2 Diabetes patients.",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=500",
    author: {
      name: "Dr. Michael Chen",
      role: "Nutritionist",
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100"
    },
    status: "pending"
  },
  {
    id: 3,
    title: "Exercise Guidelines for Diabetic Patients",
    content: `Regular exercise is essential for managing diabetes. It helps control blood sugar levels, improves insulin sensitivity, and promotes overall health.

Benefits of exercise:
- Better blood sugar control
- Weight management
- Improved cardiovascular health
- Reduced stress
- Better sleep quality

Recommended activities:
1. Walking
2. Swimming
3. Cycling
4. Strength training
5. Yoga

Safety tips:
- Check blood sugar before and after exercise
- Stay hydrated
- Carry fast-acting carbohydrates
- Wear proper footwear
- Start slowly and gradually increase intensity`,
    description: "Safe and effective exercise routines specially designed for people with diabetes.",
    readTime: "12 min",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=500",
    author: {
      name: "Dr. Emily White",
      role: "Sports Medicine",
      avatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=100"
    },
    status: "pending"
  }
];

export function GestionArticle() {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Filtrer les articles par titre ou par nom de l'auteur
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Met à jour le statut d'un article
  const updateArticleStatus = (id: number, newStatus: 'approved' | 'rejected') => {
    setArticles(prev =>
      prev.map(article =>
        article.id === id ? { ...article, status: newStatus } : article
      )
    );
  };

  // Vue détaillée d'un article avec boutons pour approuver ou refuser
  if (selectedArticle) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Articles
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
          <span className="ml-auto text-sm text-gray-500">{selectedArticle.readTime} read</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">{selectedArticle.title}</h1>
        <p className="text-gray-600 mb-8">{selectedArticle.description}</p>
        <div className="prose max-w-none">
          {selectedArticle.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => {
              updateArticleStatus(selectedArticle.id, 'approved');
              setSelectedArticle(null);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => {
              updateArticleStatus(selectedArticle.id, 'rejected');
              setSelectedArticle(null);
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    );
  }

  // Vue principale de gestion des articles
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Article Management</h1>
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
        {filteredArticles.map(article => (
          <div
            key={article.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer p-4 border"
            onClick={() => setSelectedArticle(article)}
          >
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <div className="flex items-center gap-2 mb-2">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <h4 className="text-sm font-medium">{article.author.name}</h4>
                <p className="text-xs text-gray-500">{article.author.role}</p>
              </div>
              <span className="ml-auto text-xs text-gray-500">{article.readTime} read</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{article.description}</p>
            <div className="flex justify-between items-center">
              {article.status === 'pending' ? (
                <span className="text-xs text-yellow-500 font-medium">PENDING</span>
              ) : (
                <span className={`text-xs font-medium ${article.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                  {article.status.toUpperCase()}
                </span>
              )}
            </div>
            {article.status === 'pending' && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateArticleStatus(article.id, 'approved');
                  }}
                  className="bg-green-500 text-white px-3 py-1 rounded-md text-xs hover:bg-green-600 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateArticleStatus(article.id, 'rejected');
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
