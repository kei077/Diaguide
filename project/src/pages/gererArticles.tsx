"use client"

import { useState } from "react"
import {
  Search,
  CheckCircle,
  ArrowLeft,
  Clock,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Filter,
  BookOpen,
} from "lucide-react"

interface Article {
  id: number
  title: string
  content: string
  description: string
  readTime: string
  image: string
  author: {
    name: string
    role: string
    avatar: string
  }
  status: "pending" | "approved" | "rejected"
  createdAt: string
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
    image: "/placeholder.svg?height=300&width=500",
    author: {
      name: "Dr. Sarah Johnson",
      role: "Endocrinologist",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    status: "pending",
    createdAt: "2024-01-15",
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
    image: "/placeholder.svg?height=300&width=500",
    author: {
      name: "Dr. Michael Chen",
      role: "Nutritionist",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    status: "approved",
    createdAt: "2024-01-12",
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
    image: "/placeholder.svg?height=300&width=500",
    author: {
      name: "Dr. Emily White",
      role: "Sports Medicine",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    status: "rejected",
    createdAt: "2024-01-10",
  },
]

export default function GestionArticle() {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // Filter articles by search term and status
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || article.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Update article status
  const updateArticleStatus = (id: number, newStatus: "approved" | "rejected") => {
    setArticles((prev) => prev.map((article) => (article.id === id ? { ...article, status: newStatus } : article)))

    // Show success message
    setActionSuccess(`Article ${newStatus} successfully!`)
    setTimeout(() => setActionSuccess(null), 3000)
  }

  // Get status counts
  const statusCounts = {
    all: articles.length,
    pending: articles.filter((a) => a.status === "pending").length,
    approved: articles.filter((a) => a.status === "approved").length,
    rejected: articles.filter((a) => a.status === "rejected").length,
  }

  // Detailed article view
  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-8 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Back to Articles</span>
          </button>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative">
              <img
                src={selectedArticle.image || "/placeholder.svg"}
                alt={selectedArticle.title}
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <div className="absolute top-6 right-6">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedArticle.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : selectedArticle.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedArticle.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={selectedArticle.author.avatar || "/placeholder.svg"}
                  alt={selectedArticle.author.name}
                  className="w-14 h-14 rounded-full ring-4 ring-green-100"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedArticle.author.name}</h4>
                  <p className="text-green-600 font-medium">{selectedArticle.author.role}</p>
                </div>
                <div className="ml-auto flex items-center gap-4 text-gray-500 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{selectedArticle.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{selectedArticle.createdAt}</span>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{selectedArticle.title}</h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">{selectedArticle.description}</p>

              <div className="prose prose-lg max-w-none prose-green">
                {selectedArticle.content.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="mb-6 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {selectedArticle.status === "pending" && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Actions</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        updateArticleStatus(selectedArticle.id, "approved")
                        setSelectedArticle(null)
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Approve Article
                    </button>
                    <button
                      onClick={() => {
                        updateArticleStatus(selectedArticle.id, "rejected")
                        setSelectedArticle(null)
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Reject Article
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main article management view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Success Message */}
        {actionSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">{actionSuccess}</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-green-600 rounded-2xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Article Management</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Review, approve, and manage medical articles for the knowledge base
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { key: "all", label: "Total Articles", count: statusCounts.all, color: "blue" },
            { key: "pending", label: "Pending Review", count: statusCounts.pending, color: "yellow" },
            { key: "approved", label: "Approved", count: statusCounts.approved, color: "green" },
            { key: "rejected", label: "Rejected", count: statusCounts.rejected, color: "red" },
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => setStatusFilter(stat.key as any)}
              className={`p-6 rounded-2xl transition-all duration-200 transform hover:scale-105 ${
                statusFilter === stat.key
                  ? "bg-white shadow-xl ring-2 ring-green-500"
                  : "bg-white/70 hover:bg-white shadow-lg hover:shadow-xl"
              }`}
            >
              <div className="text-center">
                <div
                  className={`text-3xl font-bold mb-2 ${
                    stat.color === "blue"
                      ? "text-blue-600"
                      : stat.color === "yellow"
                        ? "text-yellow-600"
                        : stat.color === "green"
                          ? "text-green-600"
                          : "text-red-600"
                  }`}
                >
                  {stat.count}
                </div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search articles by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-0 rounded-2xl bg-white shadow-lg focus:ring-4 focus:ring-green-200 focus:outline-none text-lg transition-all duration-200"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-2xl px-4 py-2 shadow-lg">
            <Filter className="h-4 w-4" />
            <span>Showing {filteredArticles.length} articles</span>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article, index) => (
            <div
              key={article.id}
              className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      article.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : article.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {article.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={article.author.avatar || "/placeholder.svg"}
                    alt={article.author.name}
                    className="w-12 h-12 rounded-full ring-2 ring-gray-100"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{article.author.name}</h4>
                    <p className="text-green-600 text-xs font-medium">{article.author.role}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-green-600 transition-colors duration-200 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{article.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelectedArticle(article)}
                    className="text-green-600 font-semibold hover:text-green-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Review Article
                  </button>
                  <span className="text-sm text-gray-500">{article.createdAt}</span>
                </div>

                {article.status === "pending" && (
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateArticleStatus(article.id, "approved")
                      }}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateArticleStatus(article.id, "rejected")
                      }}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      <ThumbsDown className="h-3 w-3" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-lg p-12 max-w-md mx-auto">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
