import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  Download,
  Upload,
  X,
  Save,
  FileText,
  BookOpen,
  CheckCircle,
  XCircle,
  HelpCircle,
  Target
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import UKFHeader from './UKFHeader';
import UKFFooter from './UKFFooter';

const QuestionsManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showQuestionDetails, setShowQuestionDetails] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: '',
    subject_id: '',
    difficulty: '',
    marks: 1
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { t } = useLocalization();

  useEffect(() => {
    fetchQuestions();
    fetchSubjects();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [searchTerm, questions]);

  const fetchSubjects = async () => {
    try {
      const token = getToken();
      const response = await axios.get('/api/admin/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const subjectsData = response.data.data || response.data || [];
      setSubjects(subjectsData);
      
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await axios.get('/api/admin/questions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const questionsData = response.data.data || response.data || [];
      setQuestions(questionsData);
      setFilteredQuestions(questionsData);
      
    } catch (error) {
      setError(error.response?.data?.message || error.message || t('questions.failedToLoad'));
      setQuestions([]);
      setFilteredQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.question_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.difficulty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.correct_answer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setFormData({ 
      question_text: '', 
      option_a: '', 
      option_b: '', 
      option_c: '', 
      option_d: '', 
      correct_answer: '', 
      subject_id: '',
      difficulty: '',
      marks: 1
    });
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
    setShowQuestionDetails(true);
  };

  const closeQuestionDetails = () => {
    setShowQuestionDetails(false);
    setSelectedQuestion(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = getToken();
      
      // Ensure marks is a valid number
      let marksValue = parseInt(formData.marks);
      if (isNaN(marksValue) || marksValue < 1 || marksValue > 10) {
        marksValue = 1; // Default to 1 if invalid
      }
      
      const submissionData = {
        ...formData,
        marks: marksValue
      };
      
      if (editingQuestion) {
        const response = await axios.put(`/api/admin/questions/${editingQuestion.id}`, submissionData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess(t('questions.updateSuccess'));
      } else {
        const response = await axios.post('/api/admin/questions', submissionData, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setSuccess(t('questions.createSuccess'));
      }
      
      // Reset form and refresh questions
      resetForm();
      await fetchQuestions(); // Wait for the fetch to complete
      
    } catch (error) {
      setError(error.response?.data?.message || error.message || t('questions.operationFailed'));
    }
  };

  const handleEdit = (question) => {
    
    setEditingQuestion(question);
    setFormData({ 
      question_text: question.question_text || '', 
      option_a: question.option_a || '', 
      option_b: question.option_b || '', 
      option_c: question.option_c || '', 
      option_d: question.option_d || '', 
      correct_answer: question.correct_answer || '', 
      subject_id: question.subject_id || '',
      difficulty: question.difficulty || '',
      marks: parseInt(question.marks) || 1
    });
    
    setShowForm(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm(t('questions.confirmDelete'))) {
      try {
        const token = getToken();
        await axios.delete(`/api/admin/questions/${questionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess(t('questions.deleteSuccess'));
        fetchQuestions();
      } catch (error) {
        console.error('Delete error:', error);
        setError(t('questions.deleteFailed'));
      }
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = getToken();
      const response = await axios.get('/api/admin/questions/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'questions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess(t('questions.exportSuccess'));
    } catch (error) {
      console.error('Export error:', error);
      setError(t('questions.exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError(t('questions.invalidFileType'));
      event.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('questions.fileTooLarge'));
      event.target.value = '';
      return;
    }

    setImporting(true);
    setError('');
    setSuccess('');
    
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/admin/questions/import', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(t('questions.importSuccess'));
      fetchQuestions();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          t('questions.importFailed');
      setError(errorMessage);
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ukf-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ukf-700 mx-auto mb-4"></div>
          <p className="text-ukf-700 font-medium">{t('questions.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ukf-50">
      {/* UKF Header */}
      <UKFHeader
        title={t('questions.managementTitle')}
        subtitle={t('questions.managementSubtitle')}
        showUserMenu={true}
        showLanguageSwitcher={true}
      />

      {/* Main Content */}
      <div className="container-ukf py-8">
        {/* Navigation Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-ukf-600">
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="text-ukf-400 hover:text-ukf-600 transition-colors"
            >
              Admin Panel
            </button>
            <span>/</span>
            <span className="text-ukf-700 font-medium">Questions Management</span>
          </nav>
        </div>

        {/* Page Title Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-ukf-900 mb-2">{t('questions.pageTitle')}</h2>
          <p className="text-ukf-600 text-lg">{t('questions.pageDescription')}</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-lg mr-2">❌</span>
                {error}
              </div>
              <button 
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-lg mr-2">✅</span>
                {success}
              </div>
              <button 
                onClick={() => setSuccess('')}
                className="text-green-500 hover:text-green-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{questions.length}</div>
            <div className="ukf-stat-label">{t('questions.totalQuestions')}</div>
            <FileText className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
          
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{questions.filter(q => q.marks > 1).length}</div>
            <div className="ukf-stat-label">{t('questions.multipleMarks')}</div>
            <CheckCircle className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
          
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{questions.filter(q => q.marks === 1).length}</div>
            <div className="ukf-stat-label">{t('questions.singleMark')}</div>
            <HelpCircle className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
        </div>

        {/* Question Form */}
        {showForm && (
          <div className="ukf-card p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-ukf-900">
                {editingQuestion ? t('questions.editQuestion') : t('questions.addNewQuestion')}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-ukf-600 hover:text-ukf-700 hover:bg-ukf-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-ukf-700 mb-2">{t('questions.questionText')} *</label>
                <textarea
                  name="question_text"
                  required
                  value={formData.question_text}
                  onChange={handleChange}
                  rows={4}
                  className="ukf-input resize-none"
                  placeholder={t('questions.questionTextPlaceholder')}
                />
              </div>

              {/* Subject and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">{t('questions.subject')} *</label>
                  <select
                    name="subject_id"
                    required
                    value={formData.subject_id}
                    onChange={handleChange}
                    className="ukf-input"
                  >
                    <option value="">{t('questions.selectSubject')}</option>
                    {/* Assuming subjects are fetched from an API or context */}
                    {/* For now, a placeholder for demonstration */}
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">{t('questions.difficulty')} *</label>
                  <select
                    name="difficulty"
                    required
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="ukf-input"
                  >
                    <option value="">{t('questions.selectDifficulty')}</option>
                    <option value="easy">{t('questions.easy')}</option>
                    <option value="medium">{t('questions.medium')}</option>
                    <option value="hard">{t('questions.hard')}</option>
                  </select>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">Option A *</label>
                  <input
                    name="option_a"
                    required
                    value={formData.option_a}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder="Enter option A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">Option B *</label>
                  <input
                    name="option_b"
                    required
                    value={formData.option_b}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder="Enter option B"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">Option C *</label>
                  <input
                    name="option_c"
                    required
                    value={formData.option_c}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder="Enter option C"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">Option D *</label>
                  <input
                    name="option_d"
                    required
                    value={formData.option_d}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder="Enter option D"
                  />
                </div>
              </div>

              {/* Correct Answer and Marks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">{t('questions.correctAnswer')} *</label>
                  <select
                    name="correct_answer"
                    required
                    value={formData.correct_answer}
                    onChange={handleChange}
                    className="ukf-input"
                  >
                    <option value="">{t('questions.selectCorrectAnswer')}</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">{t('questions.marks')} *</label>
                  <input
                    type="number"
                    name="marks"
                    required
                    min="1"
                    max="10"
                    value={formData.marks}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder="1"
                  />
                  <p className="text-xs text-ukf-500 mt-1">Enter a value between 1 and 10</p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="ukf-button-secondary"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="ukf-button-primary flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingQuestion ? t('questions.updateQuestion') : t('questions.createQuestion')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Question Details Modal */}
        {showQuestionDetails && selectedQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="ukf-card max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-0">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-ukf-700 to-ukf-600 text-white p-6 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{t('questions.questionDetails')}</h3>
                      <p className="text-ukf-100 text-sm">{t('questions.comprehensiveInfo')}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeQuestionDetails}
                    className="p-2 text-white hover:text-ukf-200 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-8">
                {/* Question Content */}
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <h5 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      {t('questions.questionText')}
                    </h5>
                    <div className="bg-white p-6 rounded-lg border border-blue-200">
                      <p className="text-blue-900 text-lg leading-relaxed whitespace-pre-wrap">
                        {selectedQuestion.question_text || 'No question text available'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Left Column - Options A & B */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200">
                        <span className="text-emerald-700 font-bold text-lg">A</span>
                        <span className="text-emerald-900">{selectedQuestion.option_a}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200">
                        <span className="text-emerald-700 font-bold text-lg">B</span>
                        <span className="text-emerald-900">{selectedQuestion.option_b}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Options C & D */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200">
                        <span className="text-emerald-700 font-bold text-lg">C</span>
                        <span className="text-emerald-900">{selectedQuestion.option_c}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-100">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200">
                        <span className="text-emerald-700 font-bold text-lg">D</span>
                        <span className="text-emerald-900">{selectedQuestion.option_d}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answer and Marks */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100">
                    <h5 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
                      {t('questions.correctAnswer')}
                    </h5>
                    <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
                      <span className="text-4xl font-bold text-purple-600">{selectedQuestion.correct_answer}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
                    <h5 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-amber-600" />
                      {t('questions.marks')}
                    </h5>
                    <div className="bg-white p-4 rounded-lg border border-amber-200 text-center">
                      <span className="text-4xl font-bold text-amber-600">{selectedQuestion.marks}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                    <h5 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                      {t('questions.subject')}
                    </h5>
                    <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                      <span className="text-2xl font-bold text-blue-600">{selectedQuestion.subject_name || t('questions.general')}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-100">
                    <h5 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-emerald-600" />
                      {t('questions.difficulty')}
                    </h5>
                    <div className="bg-white p-4 rounded-lg border border-emerald-200 text-center">
                      <span className="text-2xl font-bold text-emerald-600 capitalize">{selectedQuestion.difficulty || t('questions.general')}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-ukf-200">
                  <button
                    onClick={() => {
                      closeQuestionDetails();
                      handleEdit(selectedQuestion);
                    }}
                    className="ukf-button-secondary flex items-center justify-center space-x-2 px-6 py-3 text-lg"
                  >
                    <Edit className="h-5 w-5" />
                    <span>{t('questions.editQuestion')}</span>
                  </button>
                  <button
                    onClick={() => {
                      closeQuestionDetails();
                      handleDeleteQuestion(selectedQuestion.id);
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>{t('questions.deleteQuestion')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div className="ukf-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-ukf-400" />
                <input
                  type="text"
                  placeholder={t('questions.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ukf-input pl-10 pr-4 w-64"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowForm(true)}
                className="ukf-button-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{t('questions.addQuestion')}</span>
              </button>
              
              <button 
                onClick={fetchQuestions}
                disabled={loading}
                className="ukf-button-secondary flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ukf-600"></div>
                ) : (
                  <div className="h-4 w-4">🔄</div>
                )}
                <span>{loading ? t('questions.loading') : t('questions.refresh')}</span>
              </button>
              
              <button 
                onClick={handleExport}
                disabled={exporting}
                className="ukf-button-secondary flex items-center space-x-2"
              >
                {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ukf-600"></div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{exporting ? t('questions.exporting') : t('questions.export')}</span>
              </button>
              
              <label className="ukf-button-secondary flex items-center space-x-2 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>{importing ? t('questions.importing') : t('questions.import')}</span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                  disabled={importing}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Questions Table */}
        <div className="ukf-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="ukf-table">
              <thead>
                <tr>
                  <th>{t('questions.questionText')}</th>
                  <th>{t('questions.subject')}</th>
                  <th>{t('questions.difficulty')}</th>
                  <th>{t('questions.correctAnswer')}</th>
                  <th>{t('questions.marks')}</th>
                  <th>{t('questions.created')}</th>
                  <th>{t('questions.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question, index) => {
                  return (
                    <tr key={question.id} className="hover:bg-ukf-50">
                      <td>
                        <div className="max-w-md">
                          <p 
                            className="text-ukf-900 font-medium leading-relaxed cursor-help"
                            title={question.question_text && question.question_text.length > 100 ? question.question_text : ''}
                          >
                            {question.question_text ? 
                              (question.question_text.length > 100 ? 
                                <span>
                                  {question.question_text.substring(0, 100)}
                                  <span className="text-ukf-500 font-normal">...</span>
                                </span> : 
                                question.question_text
                              ) : 
                              'No question text'
                            }
                          </p>
                          {question.question_text && question.question_text.length > 100 && (
                            <p className="text-xs text-ukf-500 mt-1">
                              Click view button to see full question
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-ukf-100 text-ukf-800 border border-ukf-200">
                          {question.subject_name || 'No subject'}
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-ukf-100 text-ukf-800 border border-ukf-200">
                          {question.difficulty || t('questions.general')}
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {question.correct_answer || 'No answer'}
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-ukf-100 text-ukf-800 border border-ukf-200">
                          {(() => {
                            const marksValue = parseInt(question.marks) || 0;
                            return `${marksValue} ${marksValue === 1 ? t('questions.mark') : t('questions.marksPlural')}`;
                          })()}
                        </span>
                      </td>
                      <td className="text-ukf-600 text-sm">
                        {question.created_at ? new Date(question.created_at).toLocaleDateString() : 'No date'}
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewQuestion(question)}
                            className="p-2 text-ukf-600 hover:text-ukf-700 hover:bg-ukf-100 rounded-lg transition-colors"
                            title={t('questions.viewQuestion')}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(question)}
                            className="p-2 text-ukf-600 hover:text-ukf-700 hover:bg-ukf-100 rounded-lg transition-colors"
                            title={t('questions.editQuestion')}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                            title={t('questions.deleteQuestion')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-ukf-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-ukf-600 mb-2">{t('questions.noQuestionsFound')}</h3>
              <p className="text-ukf-500">{t('questions.noQuestionsDescription')}</p>
            </div>
          )}
        </div>
      </div>

      {/* UKF Footer */}
      <UKFFooter />
    </div>
  );
};

export default QuestionsManagement;

