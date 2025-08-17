import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  Download,
  Upload,
  Mail,
  X,
  Save,
  User,
  Calendar,
  BookOpen
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import UKFHeader from './UKFHeader';
import UKFFooter from './UKFFooter';

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { t } = useLocalization();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      const token = getToken();
      const response = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(t('students.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setEditingStudent(null);
    setFormData({ student_id: '', name: '', email: '', password: '' });
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  const closeStudentDetails = () => {
    setShowStudentDetails(false);
    setSelectedStudent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = getToken();
      if (editingStudent) {
        await axios.put(`/api/admin/students/${editingStudent.id}`, {
          student_id: formData.student_id,
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined
        }, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess(t('students.updateSuccess'));
      } else {
        await axios.post('/api/admin/students', formData, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setSuccess(t('students.createSuccess'));
      }
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error('Form submission error:', error);
      setError(error.response?.data?.message || t('students.operationFailed'));
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({ 
      student_id: student.student_id, 
      name: student.name, 
      email: student.email || '', 
      password: '' 
    });
    setShowForm(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm(t('students.confirmDelete'))) {
      try {
        const token = getToken();
        await axios.delete(`/api/admin/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess(t('students.deleteSuccess'));
        fetchStudents();
      } catch (error) {
        console.error('Delete error:', error);
        setError(t('students.deleteFailed'));
      }
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = getToken();
      const response = await axios.get('/api/admin/students/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess(t('students.exportSuccess'));
    } catch (error) {
      console.error('Export error:', error);
      setError(t('students.exportFailed'));
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
      setError(t('students.invalidFileType'));
      event.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('students.fileTooLarge'));
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

      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      const response = await axios.post('/api/admin/students/import', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Import response:', response.data);
      setSuccess(t('students.importSuccess'));
      fetchStudents();
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          t('students.importFailed');
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
          <p className="text-ukf-700 font-medium">{t('students.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ukf-50">
      {/* UKF Header */}
      <UKFHeader
        title={t('students.managementTitle')}
        subtitle={t('students.managementSubtitle')}
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
            <span className="text-ukf-700 font-medium">Students Management</span>
          </nav>
        </div>
        
        {/* Page Title Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-ukf-900 mb-2">{t('students.pageTitle')}</h2>
          <p className="text-ukf-600 text-lg">{t('students.pageDescription')}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{students.length}</div>
            <div className="ukf-stat-label">{t('students.totalStudents')}</div>
            <Users className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
          
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{students.filter(s => s.email).length}</div>
            <div className="ukf-stat-label">{t('students.withEmail')}</div>
            <Mail className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
        </div>

        {/* Student Form */}
        {showForm && (
          <div className="ukf-card p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-ukf-900">
                {editingStudent ? t('students.editStudent') : t('students.addNewStudent')}
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
                  <label className="block text-sm font-medium text-ukf-700 mb-2">{t('students.studentId')} *</label>
                  <input
                    name="student_id"
                    required
                    value={formData.student_id}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder={t('students.studentIdPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">{t('students.name')} *</label>
                  <input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder={t('students.namePlaceholder')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">{t('students.email')}</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder={t('students.emailPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ukf-700 mb-2">
                    {editingStudent ? t('students.passwordOptional') : t('students.password')} *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="ukf-input"
                    placeholder={editingStudent ? t('students.passwordOptionalPlaceholder') : t('students.passwordPlaceholder')}
                    required={!editingStudent}
                  />
                </div>
              </div>
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
                  <span>{editingStudent ? t('students.updateStudent') : t('students.createStudent')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Student Details Modal */}
        {showStudentDetails && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="ukf-card max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-0">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-ukf-700 to-ukf-600 text-white p-6 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{t('students.studentDetails')}</h3>
                      <p className="text-ukf-100 text-sm">{t('students.comprehensiveInfo')}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeStudentDetails}
                    className="p-2 text-white hover:text-ukf-200 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-8">
                {/* Student Profile Section */}
                <div className="mb-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="h-24 w-24 bg-gradient-to-br from-ukf-400 to-ukf-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-ukf-500 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                        <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Basic Info */}
                    <div className="text-center md:text-left">
                      <h4 className="text-3xl font-bold text-ukf-900 mb-2">{selectedStudent.name}</h4>
                      <div className="inline-flex items-center space-x-2 bg-ukf-50 px-4 py-2 rounded-full">
                        <div className="h-2 w-2 bg-ukf-500 rounded-full"></div>
                        <span className="text-ukf-700 font-mono text-lg">{selectedStudent.student_id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                      <h5 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                        <Mail className="h-5 w-5 mr-2 text-blue-600" />
                        {t('students.contactInfo')}
                      </h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                          <span className="text-blue-700 font-medium">{t('students.email')}</span>
                          <span className="text-blue-900 font-mono">
                            {selectedStudent.email || t('students.noEmail')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Account Information */}
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-100">
                      <h5 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                        {t('students.accountInfo')}
                      </h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200">
                          <span className="text-emerald-700 font-medium">{t('students.created')}</span>
                          <span className="text-emerald-900 font-medium">
                            {new Date(selectedStudent.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200">
                          <span className="text-emerald-700 font-medium">{t('students.lastLogin')}</span>
                          <span className="text-emerald-900 font-medium">
                            {t('students.recently')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Academic Information */}
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100">
                      <h5 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                        {t('students.academicInfo')}
                      </h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                          <span className="text-purple-700 font-medium">{t('students.department')}</span>
                          <span className="text-purple-900 font-medium">
                            {selectedStudent.department || t('students.general')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                          <span className="text-purple-700 font-medium">{t('students.level')}</span>
                          <span className="text-purple-900 font-medium">{t('students.undergraduate')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Information */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
                      <h5 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-amber-600" />
                        {t('students.statusInfo')}
                      </h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                          <span className="text-amber-700 font-medium">{t('students.status')}</span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                            <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                            {t('students.active')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                          <span className="text-amber-700 font-medium">{t('students.verification')}</span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            <div className="h-2 w-2 bg-blue-400 rounded-full mr-2"></div>
                            {t('students.verified')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-ukf-50 to-ukf-100 p-6 rounded-xl border border-ukf-200 text-center">
                    <div className="h-12 w-12 bg-ukf-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-ukf-700 mb-1">0</div>
                    <div className="text-ukf-600 text-sm">{t('students.examsTaken')}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200 text-center">
                    <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <div className="h-6 w-6 text-white font-bold">%</div>
                    </div>
                    <div className="text-2xl font-bold text-green-700 mb-1">0%</div>
                    <div className="text-green-600 text-sm">{t('students.averageScore')}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200 text-center">
                    <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-blue-700 mb-1">0</div>
                    <div className="text-blue-600 text-sm">{t('students.daysActive')}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-ukf-200">
                  <button
                    onClick={() => {
                      closeStudentDetails();
                      handleEdit(selectedStudent);
                    }}
                    className="ukf-button-secondary flex items-center justify-center space-x-2 px-6 py-3 text-lg"
                  >
                    <Edit className="h-5 w-5" />
                    <span>{t('students.editStudent')}</span>
                  </button>
                  <button
                    onClick={() => {
                      closeStudentDetails();
                      handleDeleteStudent(selectedStudent.id);
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span>{t('students.deleteStudent')}</span>
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
                  placeholder={t('students.searchPlaceholder')}
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
                <span>{t('students.addStudent')}</span>
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
                <span>{exporting ? t('students.exporting') : t('students.export')}</span>
              </button>
              
              <label className="ukf-button-secondary flex items-center space-x-2 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>{importing ? t('students.importing') : t('students.import')}</span>
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

        {/* Students Table */}
        <div className="ukf-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="ukf-table">
              <thead>
                <tr>
                  <th>{t('students.studentId')}</th>
                  <th>{t('students.name')}</th>
                  <th>{t('students.email')}</th>
                  <th>{t('students.created')}</th>
                  <th>{t('students.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-ukf-50">
                    <td className="font-mono text-ukf-700">{student.student_id}</td>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-ukf-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-ukf-600" />
                        </div>
                        <div>
                          <div className="font-medium text-ukf-900">{student.name}</div>
                          <div className="text-sm text-ukf-500">{student.department || t('students.general')}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-ukf-400" />
                        <span className="text-ukf-700">{student.email || t('students.noEmail')}</span>
                      </div>
                    </td>
                    <td className="text-ukf-600 text-sm">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewStudent(student)}
                          className="p-2 text-ukf-600 hover:text-ukf-700 hover:bg-ukf-100 rounded-lg transition-colors"
                          title={t('students.viewStudent')}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(student)}
                          className="p-2 text-ukf-600 hover:text-ukf-700 hover:bg-ukf-100 rounded-lg transition-colors"
                          title={t('students.editStudent')}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                          title={t('students.deleteStudent')}
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

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-ukf-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-ukf-600 mb-2">{t('students.noStudentsFound')}</h3>
              <p className="text-ukf-500">{t('students.noStudentsDescription')}</p>
            </div>
          )}
        </div>
      </div>

      {/* UKF Footer */}
      <UKFFooter />
    </div>
  );
};

export default StudentsManagement;

