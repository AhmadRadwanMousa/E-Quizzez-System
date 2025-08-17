import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  Eye,
  Play,
  Pause,
  Stop,
  X,
  Save,
  Activity,
  Target
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import UKFHeader from './UKFHeader';
import UKFFooter from './UKFFooter';

const ExamsManagement = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [viewingExam, setViewingExam] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject_id: '',
    duration_minutes: 60,
    questions_per_exam: 10,
    total_marks: 0,
    start_time: '',
    end_time: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { t } = useLocalization();

  useEffect(() => {
    fetchData();
    fetchSubjects();
  }, []);

  useEffect(() => {
    filterExams();
  }, [searchTerm, selectedStatus, exams]);

  const fetchSubjects = async () => {
    try {
      const token = getToken();
      const response = await axios.get('/api/admin/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]);
    }
  };

  const fetchData = async () => {
    try {
      const token = getToken();
      const response = await axios.get('/api/admin/exams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExams(response.data.data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    let filtered = exams;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        filtered = filtered.filter(exam => exam.is_active === 1);
      } else if (selectedStatus === 'inactive') {
        filtered = filtered.filter(exam => exam.is_active === 0);
      }
    }

    setFilteredExams(filtered);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setEditingExam(null);
    setFormData({
      title: '',
      subject_id: '',
      duration_minutes: 60,
      questions_per_exam: 10,
      total_marks: 0,
      start_time: '',
      end_time: ''
    });
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = getToken();
      if (editingExam) {
        await axios.put(`/api/admin/exams/${editingExam.id}`, {
          ...formData,
          total_marks: Number(formData.total_marks || 0),
          is_active: editingExam.is_active
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess(t('exams.updateSuccess'));
      } else {
        await axios.post('/api/admin/exams', {
          ...formData,
          total_marks: Number(formData.total_marks || 0)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess(t('exams.createSuccess'));
      }
      resetForm();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || t('exams.operationFailed'));
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      subject_id: exam.subject_id,
      duration_minutes: exam.duration_minutes,
      total_marks: exam.total_marks || 0,
      questions_per_exam: exam.questions_per_exam || 10,
      start_time: exam.start_time || '',
      end_time: exam.end_time || ''
    });
    setShowForm(true);
  };

  const handleViewExam = (exam) => {
    setViewingExam(exam);
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm(t('exams.confirmDelete'))) {
      try {
        const token = getToken();
        await axios.delete(`/api/admin/exams/${examId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess(t('exams.deleteSuccess'));
        fetchData();
      } catch (error) {
        setError(t('exams.deleteFailed'));
      }
    }
  };

  const toggleExamStatus = async (exam) => {
    try {
      const token = getToken();
      await axios.put(`/api/admin/exams/${exam.id}`, {
        title: exam.title,
        subject_id: exam.subject_id,
        duration_minutes: exam.duration_minutes,
        questions_per_exam: exam.questions_per_exam || exam.total_questions,
        total_marks: exam.total_marks || 0,
        start_time: exam.start_time || null,
        end_time: exam.end_time || null,
        is_active: !exam.is_active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Exam ${exam.is_active ? t('exams.inactive') : t('exams.active')} successfully`);
      fetchData();
    } catch (error) {
      setError('Failed to toggle exam status');
    }
  };

  const exportExams = () => {
    const csvContent = [
      ['Title', 'Subject', 'Duration (min)', 'Questions per Exam', 'Total Marks', 'Status', 'Created'],
      ...filteredExams.map(exam => [
        exam.title,
        exam.subject_name || 'General',
        exam.duration_minutes,
        exam.questions_per_exam || exam.total_questions,
        exam.total_marks || 0,
        exam.is_active ? 'Active' : 'Inactive',
        new Date(exam.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exams.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importExams = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        // Basic validation
        if (headers.length < 3) {
          setError('Invalid CSV format. Please check the file structure.');
          return;
        }

        setSuccess(`CSV file loaded successfully. ${lines.length - 1} exams found.`);
        // TODO: Implement actual import logic
      } catch (error) {
        setError('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'ukf-badge-success';
      case 'inactive': return 'ukf-badge-warning';
      case 'draft': return 'ukf-badge-primary';
      case 'completed': return 'ukf-badge-info';
      default: return 'ukf-badge-primary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'inactive': return <Pause className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Not set';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ukf-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ukf-700 mx-auto mb-4"></div>
          <p className="text-ukf-700 font-medium">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ukf-50">
      {/* UKF Header */}
      <UKFHeader
        title={t('exams.managementTitle')}
        subtitle={t('exams.managementSubtitle')}
        showUserMenu={true}
        showLanguageSwitcher={true}
      />

      {/* Main Content */}
      <div className="container-ukf py-8">
        {/* Page Title Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-ukf-900 mb-2">{t('exams.pageTitle')}</h2>
          <p className="text-ukf-600 text-lg">{t('exams.pageDescription')}</p>
        </div>

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{exams.length}</div>
            <div className="ukf-stat-label">{t('exams.totalExams')}</div>
            <BookOpen className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
          
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{exams.filter(e => e.is_active === 1).length}</div>
            <div className="ukf-stat-label">{t('exams.activeExams')}</div>
            <Activity className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
          
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{exams.reduce((sum, e) => sum + (e.total_questions || 0), 0)}</div>
            <div className="ukf-stat-label">{t('exams.totalQuestions')}</div>
            <FileText className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
          
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{new Set(exams.map(e => e.subject_name)).size}</div>
            <div className="ukf-stat-label">{t('exams.subjects')}</div>
            <FileText className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
        </div>

        {/* Exam Form */}
        {showForm && (
          <div className="ukf-card p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-ukf-900">
                {editingExam ? t('exams.editExam') : t('exams.addNewExam')}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-ukf-600 hover:text-ukf-700 hover:bg-ukf-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">{t('exams.examTitle')} *</label>
                  <input
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder={t('exams.examTitlePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">{t('exams.subject')} *</label>
                  <select
                    name="subject_id"
                    required
                    value={formData.subject_id}
                    onChange={handleChange}
                    className="ukf-input"
                  >
                    <option value="">{t('exams.selectSubject')}</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">{t('exams.duration')} *</label>
                  <input
                    type="number"
                    name="duration_minutes"
                    required
                    min="1"
                    value={formData.duration_minutes}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder={t('exams.durationPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">{t('exams.questionsPerExam')} *</label>
                  <input
                    type="number"
                    name="questions_per_exam"
                    required
                    min="1"
                    value={formData.questions_per_exam}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder={t('exams.questionsPerExamPlaceholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">{t('exams.totalMarks')}</label>
                  <input
                    type="number"
                    name="total_marks"
                    min="0"
                    value={formData.total_marks}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder={t('exams.totalMarksPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">{t('exams.startTime')}</label>
                  <input
                    type="datetime-local"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="ukf-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ukf-700 mb-2">{t('exams.endTime')}</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="ukf-input"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="ukf-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ukf-button-primary flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingExam ? t('exams.updateExam') : t('exams.createExam')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View Exam Modal */}
        {viewingExam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-ukf-900">{t('exams.examTitle')}: {viewingExam.title}</h3>
                  <button
                    onClick={() => setViewingExam(null)}
                    className="p-2 text-ukf-600 hover:text-ukf-700 hover:bg-ukf-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                      <h5 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                        {t('exams.examTitle')}
                      </h5>
                      <div className="bg-white p-3 rounded-lg border border-blue-200">
                        <span className="text-xl font-bold text-blue-600">{viewingExam.title}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                      <h5 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-green-600" />
                        {t('exams.subject')}
                      </h5>
                      <div className="bg-white p-3 rounded-lg border border-green-200 text-center">
                        <span className="text-xl font-bold text-green-600">{viewingExam.subject_name || t('exams.general')}</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100">
                      <h5 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-purple-600" />
                        {t('exams.duration')}
                      </h5>
                      <div className="bg-white p-3 rounded-lg border border-purple-200 text-center">
                        <span className="text-2xl font-bold text-purple-600">{formatDuration(viewingExam.duration_minutes)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100">
                      <h5 className="text-lg font-semibold text-orange-900 mb-3 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-orange-600" />
                        {t('exams.questions')}
                      </h5>
                      <div className="bg-white p-3 rounded-lg border border-orange-200 text-center">
                        <span className="text-2xl font-bold text-orange-600">{viewingExam.questions_per_exam || viewingExam.total_questions}</span>
                        <p className="text-sm text-orange-600 mt-1">{t('exams.questionsPerExam')}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-100">
                      <h5 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-red-600" />
                        {t('exams.status')}
                      </h5>
                      <div className="bg-white p-3 rounded-lg border border-red-200 text-center">
                        <span className={`text-xl font-bold ${viewingExam.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {viewingExam.is_active ? t('exams.active') : t('exams.inactive')}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-100">
                      <h5 className="text-lg font-semibold text-teal-900 mb-3 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                        {t('exams.created')}
                      </h5>
                      <div className="bg-white p-3 rounded-lg border border-teal-200 text-center">
                        <span className="text-lg font-bold text-teal-600">
                          {new Date(viewingExam.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Settings */}
                {(viewingExam.start_time || viewingExam.end_time) && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 mb-6">
                    <h5 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                      {t('exams.timeSettings')}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewingExam.start_time && (
                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-2">{t('exams.startTime')}</label>
                          <div className="bg-white p-3 rounded-lg border border-indigo-200">
                            <span className="text-indigo-600 font-medium">
                              {new Date(viewingExam.start_time).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                      {viewingExam.end_time && (
                        <div>
                          <label className="block text-sm font-medium text-indigo-700 mb-2">{t('exams.endTime')}</label>
                          <div className="bg-white p-3 rounded-lg border border-indigo-200">
                            <span className="text-indigo-600 font-medium">
                              {new Date(viewingExam.end_time).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setViewingExam(null)}
                    className="ukf-button-secondary"
                  >
                    {t('exams.close')}
                  </button>
                  <button
                    onClick={() => {
                      setViewingExam(null);
                      handleEdit(viewingExam);
                    }}
                    className="ukf-button-primary flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>{t('exams.editExam')}</span>
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
                  placeholder={t('exams.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ukf-input pl-10 pr-4 w-64"
                />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="ukf-input w-40"
              >
                <option value="all">{t('exams.allStatus')}</option>
                <option value="active">{t('exams.active')}</option>
                <option value="inactive">{t('exams.inactive')}</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowForm(true)}
                className="ukf-button-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{t('exams.addExam')}</span>
              </button>
              <button 
                onClick={exportExams}
                className="ukf-button-secondary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>{t('exams.export')}</span>
              </button>
              <label className="ukf-button-secondary flex items-center space-x-2 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>{t('exams.import')}</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={importExams}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Exams Table */}
        <div className="ukf-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="ukf-table">
              <thead>
                <tr>
                  <th>{t('exams.examTitle')}</th>
                  <th>{t('exams.subject')}</th>
                  <th>{t('exams.duration')}</th>
                  <th>{t('exams.questions')}</th>
                  <th>{t('exams.status')}</th>
                  <th>{t('exams.created')}</th>
                  <th>{t('exams.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-ukf-50">
                    <td>
                      <div className="max-w-md">
                        <div className="font-medium text-ukf-900 line-clamp-2">
                          {exam.title}
                        </div>
                        <div className="text-sm text-ukf-500 mt-1">
                          {exam.questions_per_exam || exam.total_questions} {t('exams.questionsPerExam')}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="ukf-badge ukf-badge-info">
                        {exam.subject_name || t('exams.general')}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-ukf-400" />
                        <span className="text-ukf-700">
                          {formatDuration(exam.duration_minutes)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-ukf-700 font-medium">
                        {exam.questions_per_exam || exam.total_questions}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(exam.is_active ? 'active' : 'inactive')}
                        <span className={`ukf-badge ${getStatusColor(exam.is_active ? 'active' : 'inactive')}`}>
                          {exam.is_active ? t('exams.active') : t('exams.inactive')}
                        </span>
                      </div>
                    </td>
                    <td className="text-ukf-600 text-sm">
                      {new Date(exam.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewExam(exam)}
                          className="p-2 text-ukf-600 hover:text-ukf-700 hover:bg-ukf-100 rounded-lg transition-colors"
                          title="View Exam"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(exam)}
                          className="p-2 text-ukf-600 hover:text-ukf-700 hover:bg-ukf-100 rounded-lg transition-colors"
                          title="Edit Exam"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => toggleExamStatus(exam)}
                          className={`p-2 rounded-lg transition-colors ${
                            exam.is_active 
                              ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100' 
                              : 'text-green-600 hover:text-green-700 hover:bg-green-100'
                          }`}
                          title={exam.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {exam.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button 
                          onClick={() => handleDeleteExam(exam.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredExams.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-ukf-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-ukf-600 mb-2">No exams found</h3>
              <p className="text-ukf-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* UKF Footer */}
      <UKFFooter />
    </div>
  );
};

export default ExamsManagement;

