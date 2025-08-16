import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, Filter, Search, BookOpen, FileText, Target, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const QuestionsManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
    subject: '',
    difficulty: 'medium'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, selectedSubject, selectedDifficulty]);

  const fetchQuestions = async () => {
    try {
      const token = getToken();
      const [questionsRes, subjectsRes] = await Promise.all([
        axios.get('/api/admin/questions', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/subjects', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setQuestions(questionsRes.data.data);
      setSubjects(subjectsRes.data.data);
    } catch (error) {
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = [...questions];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.option_a.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.option_b.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.option_c.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.option_d.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by subject
    if (selectedSubject) {
      filtered = filtered.filter(question => question.subject === selectedSubject);
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter(question => question.difficulty === selectedDifficulty);
    }

    setFilteredQuestions(filtered);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = getToken();
      
      if (editingQuestion) {
        // Update existing question
        await axios.put(`/api/admin/questions/${editingQuestion.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Question updated successfully!');
      } else {
        // Create new question
        await axios.post('/api/admin/questions', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Question created successfully!');
      }

      // Reset form and refresh questions
      setFormData({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: '',
        subject: '',
        difficulty: 'medium'
      });
      setEditingQuestion(null);
      setShowForm(false);
      fetchQuestions();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_answer: question.correct_answer,
      subject: question.subject,
      difficulty: question.difficulty || 'medium'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const token = getToken();
      await axios.delete(`/api/admin/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Question deleted successfully!');
      fetchQuestions();
    } catch (error) {
      setError('Failed to delete question');
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: '',
      subject: '',
      difficulty: 'medium'
    });
    setEditingQuestion(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setSelectedDifficulty('');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalQuestions = questions.length;
  const totalSubjects = subjects.length;
  const easyQuestions = questions.filter(q => q.difficulty === 'easy').length;
  const mediumQuestions = questions.filter(q => q.difficulty === 'medium').length;
  const hardQuestions = questions.filter(q => q.difficulty === 'hard').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-12 w-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm mr-4">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Questions Management</h1>
                <p className="text-blue-100 text-sm">Create and manage your question bank</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-xl flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Add Question</span>
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full translate-x-20 translate-y-20"></div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <div className="flex items-center">
              <span className="text-lg mr-2">❌</span>
              {error}
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl">
            <div className="flex items-center">
              <span className="text-lg mr-2">✅</span>
              {success}
            </div>
          </div>
        )}

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-3xl font-bold text-blue-600">{totalQuestions}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subjects</p>
                <p className="text-3xl font-bold text-green-600">{totalSubjects}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Easy</p>
                <p className="text-3xl font-bold text-green-600">{easyQuestions}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🟢</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Medium</p>
                <p className="text-3xl font-bold text-yellow-600">{mediumQuestions}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🟡</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hard</p>
                <p className="text-3xl font-bold text-red-600">{hardQuestions}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔴</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-blue-600" />
              Filter Questions
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Questions
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by question text, subject, or options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field w-full pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input-field w-full"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.subject} value={subject.subject}>
                    {subject.subject} ({subject.question_count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input-field w-full"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredQuestions.length} of {totalQuestions} questions
            {selectedSubject && ` in ${selectedSubject}`}
            {selectedDifficulty && ` (${selectedDifficulty} difficulty)`}
          </div>
        </div>

        {/* Question Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text *
                  </label>
                  <textarea
                    name="question_text"
                    required
                    value={formData.question_text}
                    onChange={handleChange}
                    className="input-field w-full"
                    rows="3"
                    placeholder="Enter the question..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="e.g., Mathematics, Science"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Option A *
                  </label>
                  <input
                    type="text"
                    name="option_a"
                    required
                    value={formData.option_a}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="First option"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Option B *
                  </label>
                  <input
                    type="text"
                    name="option_b"
                    required
                    value={formData.option_b}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Second option"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Option C *
                  </label>
                  <input
                    type="text"
                    name="option_c"
                    required
                    value={formData.option_c}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Third option"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Option D *
                  </label>
                  <input
                    type="text"
                    name="option_d"
                    required
                    value={formData.option_d}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Fourth option"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct Answer *
                  </label>
                  <select
                    name="correct_answer"
                    required
                    value={formData.correct_answer}
                    onChange={handleChange}
                    className="input-field w-full"
                  >
                    <option value="">Select correct answer</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="input-field w-full"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Questions List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Questions ({filteredQuestions.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredQuestions.map((question) => (
              <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {question.question_text}
                      </h4>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(question.difficulty)}`}>
                        {getDifficultyIcon(question.difficulty)} {question.difficulty}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        {question.subject}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className={`font-medium ${question.correct_answer === 'A' ? 'text-green-600' : 'text-gray-700'}`}>
                            A: {question.option_a}
                          </span>
                          {question.correct_answer === 'A' && <span className="ml-2 text-green-600">✓</span>}
                        </p>
                        <p className="text-sm">
                          <span className={`font-medium ${question.correct_answer === 'B' ? 'text-green-600' : 'text-gray-700'}`}>
                            B: {question.option_b}
                          </span>
                          {question.correct_answer === 'B' && <span className="ml-2 text-green-600">✓</span>}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className={`font-medium ${question.correct_answer === 'C' ? 'text-green-600' : 'text-gray-700'}`}>
                            C: {question.option_c}
                          </span>
                          {question.correct_answer === 'C' && <span className="ml-2 text-green-600">✓</span>}
                        </p>
                        <p className="text-sm">
                          <span className={`font-medium ${question.correct_answer === 'D' ? 'text-green-600' : 'text-gray-700'}`}>
                            D: {question.option_d}
                          </span>
                          {question.correct_answer === 'D' && <span className="ml-2 text-green-600">✓</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(question)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Question"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredQuestions.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {questions.length === 0 ? 'No questions found' : 'No questions match your filters'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {questions.length === 0 
                    ? 'Create your first question to get started!' 
                    : 'Try adjusting your search criteria or filters.'
                  }
                </p>
                {questions.length === 0 && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Question
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsManagement;

