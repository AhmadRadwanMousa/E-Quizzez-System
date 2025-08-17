import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Edit, 
  Trash2, 
  Plus,
  X,
  Save,
  BookOpen,
  Hash
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import UKFHeader from './UKFHeader';
import UKFFooter from './UKFFooter';

const SubjectsManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { t } = useLocalization();

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    filterSubjects();
  }, [searchTerm, subjects]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await axios.get('/api/admin/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const subjectsData = response.data.data || response.data || [];
      setSubjects(subjectsData);
      setFilteredSubjects(subjectsData);
      
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to load subjects');
      setSubjects([]);
      setFilteredSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSubjects = () => {
    let filtered = subjects;

    if (searchTerm) {
      filtered = filtered.filter(subject =>
        subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubjects(filtered);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setEditingSubject(null);
    setFormData({ 
      name: '', 
      code: '', 
      description: '' 
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
      
      if (editingSubject) {
        await axios.put(`/api/admin/subjects/${editingSubject.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Subject updated successfully');
      } else {
        await axios.post('/api/admin/subjects', formData, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setSuccess('Subject created successfully');
      }
      
      resetForm();
      await fetchSubjects();
      
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Operation failed');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({ 
      name: subject.name || '', 
      code: subject.code || '', 
      description: subject.description || '' 
    });
    setShowForm(true);
  };

  const handleDelete = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject? This will affect all related questions.')) {
      try {
        const token = getToken();
        await axios.delete(`/api/admin/subjects/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Subject deleted successfully');
        fetchSubjects();
      } catch (error) {
        setError(error.response?.data?.message || error.message || 'Delete failed');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ukf-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ukf-700 mx-auto mb-4"></div>
          <p className="text-ukf-700 font-medium">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ukf-50">
      {/* UKF Header */}
      <UKFHeader
        title="Subjects Management"
        subtitle="Manage academic subjects and courses"
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
            <span className="text-ukf-700 font-medium">Subjects Management</span>
          </nav>
        </div>

        {/* Page Title */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-ukf-900 mb-2">Subjects Management</h2>
          <p className="text-ukf-600 text-lg">Create and manage academic subjects for your questions</p>
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
            <div className="ukf-stat-number text-ukf-700">{subjects.length}</div>
            <div className="ukf-stat-label">Total Subjects</div>
            <BookOpen className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
          
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{subjects.filter(s => s.is_active !== false).length}</div>
            <div className="ukf-stat-label">Active Subjects</div>
            <Hash className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
          
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{subjects.filter(s => s.description).length}</div>
            <div className="ukf-stat-label">With Description</div>
            <BookOpen className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
        </div>

        {/* Subject Form */}
        {showForm && (
          <div className="ukf-card p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-ukf-900">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 text-ukf-600 hover:text-ukf-700 hover:bg-ukf-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subject Name and Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">Subject Name *</label>
                  <input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder="e.g., Mathematics, Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">Subject Code *</label>
                  <input
                    name="code"
                    required
                    value={formData.code}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder="e.g., MATH, CS101"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-ukf-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="ukf-input resize-none"
                  placeholder="Brief description of the subject..."
                />
              </div>

              {/* Form Actions */}
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
                  <span>{editingSubject ? 'Update Subject' : 'Create Subject'}</span>
                </button>
              </div>
            </form>
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
                  placeholder="Search subjects..."
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
                <span>Add Subject</span>
              </button>
              
              <button 
                onClick={fetchSubjects}
                disabled={loading}
                className="ukf-button-secondary flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ukf-600"></div>
                ) : (
                  <div className="h-4 w-4">🔄</div>
                )}
                <span>{loading ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subjects Table */}
        <div className="ukf-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="ukf-table">
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Questions Count</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-ukf-50">
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-ukf-100 rounded-full flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-ukf-600" />
                        </div>
                        <div>
                          <p className="text-ukf-900 font-medium">{subject.name}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {subject.code}
                      </span>
                    </td>
                    <td>
                      <p className="text-ukf-600 max-w-md truncate">
                        {subject.description || 'No description'}
                      </p>
                    </td>
                    <td>
                      <span className="text-ukf-700 font-medium">
                        {subject.questions_count || 0} questions
                      </span>
                    </td>
                    <td className="text-ukf-600 text-sm">
                      {subject.created_at ? new Date(subject.created_at).toLocaleDateString() : 'No date'}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEdit(subject)}
                          className="p-2 text-ukf-600 hover:text-ukf-700 hover:bg-ukf-100 rounded-lg transition-colors"
                          title="Edit Subject"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(subject.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Subject"
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

          {filteredSubjects.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-ukf-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-ukf-600 mb-2">No subjects found</h3>
              <p className="text-ukf-500">Create your first subject to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* UKF Footer */}
      <UKFFooter />
    </div>
  );
};

export default SubjectsManagement;

