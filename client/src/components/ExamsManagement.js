import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const ExamsManagement = () => {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    duration_minutes: 60,
    questions_per_exam: 10,
    total_marks: 0,
    start_time: '',
    end_time: ''
  });
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { getToken } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getToken();
      const [examsRes, subjectsRes] = await Promise.all([
        axios.get('/api/admin/exams', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/subjects', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setExams(examsRes.data.data);
      setSubjects(subjectsRes.data.data);
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
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
      
      if (editingExam) {
        // Update existing exam
        await axios.put(`/api/admin/exams/${editingExam.id}`, {
          ...formData,
          total_marks: Number(formData.total_marks || 0),
          is_active: editingExam.is_active
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Exam updated successfully!');
      } else {
        // Create new exam
        await axios.post('/api/admin/exams', {
          ...formData,
          total_marks: Number(formData.total_marks || 0)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Exam created successfully!');
      }

      // Reset form and refresh data
      setFormData({
        title: '',
        subject: '',
        duration_minutes: 60,
        questions_per_exam: 10,
        total_marks: 0,
        start_time: '',
        end_time: ''
      });
      setEditingExam(null);
      setShowForm(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      subject: exam.subject,
      duration_minutes: exam.duration_minutes,
      total_marks: exam.total_marks || 0,
      questions_per_exam: exam.questions_per_exam || 10,
      start_time: exam.start_time || '',
      end_time: exam.end_time || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam? This will also delete all results.')) return;

    try {
      const token = getToken();
      await axios.delete(`/api/admin/exams/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Exam deleted successfully!');
      fetchData();
    } catch (error) {
      setError('Failed to delete exam');
    }
  };

  const toggleExamStatus = async (exam) => {
    try {
      const token = getToken();
      await axios.put(`/api/admin/exams/${exam.id}`, {
        title: exam.title,
        subject: exam.subject,
        duration_minutes: exam.duration_minutes,
        questions_per_exam: exam.questions_per_exam || exam.total_questions,
        total_marks: exam.total_marks || 0,
        start_time: exam.start_time || null,
        end_time: exam.end_time || null,
        is_active: !exam.is_active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Exam ${exam.is_active ? 'deactivated' : 'activated'} successfully!`);
      fetchData();
    } catch (error) {
      setError('Failed to update exam status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      duration_minutes: 60,
      questions_per_exam: 10,
      total_marks: 0,
      start_time: '',
      end_time: ''
    });
    setEditingExam(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Exams Management</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Exam Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingExam ? 'Edit Exam' : 'Create New Exam'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="e.g., Midterm Exam, Final Test"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="input-field w-full"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.subject} value={subject.subject}>
                        {subject.subject} ({subject.question_count} questions available)
                      </option>
                    ))}
                  </select>
                  {formData.subject && subjects.find(s => s.subject === formData.subject) && (
                    <p className="text-sm text-gray-600 mt-1">
                      Available questions: {subjects.find(s => s.subject === formData.subject).question_count}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Questions per Exam *
                  </label>
                  <input
                    type="number"
                    name="questions_per_exam"
                    required
                    min="1"
                    max={formData.subject ? subjects.find(s => s.subject === formData.subject)?.question_count || 1 : 100}
                    value={formData.questions_per_exam}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="10"
                  />
                  {formData.subject && subjects.find(s => s.subject === formData.subject) && (
                    <p className="text-sm text-gray-600 mt-1">
                      Maximum: {subjects.find(s => s.subject === formData.subject).question_count} questions
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  required
                  min="1"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="60"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Marks (optional)
                  </label>
                  <input
                    type="number"
                    name="total_marks"
                    min="0"
                    value={formData.total_marks}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Auto-sum if 0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    name="duration_minutes"
                    required
                    min="1"
                    value={formData.duration_minutes}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time (optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="When exam becomes available"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Leave empty to make exam available immediately
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time (optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="When exam expires"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Leave empty for no expiration
                  </p>
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
                  {editingExam ? 'Update Exam' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Exams List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              All Exams ({exams.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {exams.map((exam) => (
              <div key={exam.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {exam.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        exam.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {exam.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span><strong>Subject:</strong> {exam.subject}</span>
                      <span><strong>Duration:</strong> {exam.duration_minutes} minutes</span>
                      <span><strong>Question Bank:</strong> {exam.total_questions} questions</span>
                      <span><strong>Per Exam:</strong> {exam.questions_per_exam || exam.total_questions} questions</span>
                    </div>
                    {(exam.start_time || exam.end_time) && (
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        {exam.start_time && (
                          <span><strong>Available from:</strong> {new Date(exam.start_time).toLocaleString()}</span>
                        )}
                        {exam.end_time && (
                          <span><strong>Expires at:</strong> {new Date(exam.end_time).toLocaleString()}</span>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Created: {new Date(exam.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => toggleExamStatus(exam)}
                      className={`p-2 rounded-md ${
                        exam.is_active 
                          ? 'text-yellow-600 hover:bg-yellow-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={exam.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {exam.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(exam)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {exams.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No exams found. Create your first exam!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamsManagement;

