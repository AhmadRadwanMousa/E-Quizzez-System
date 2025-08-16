import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, User, Mail, Calendar, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.data);
    } catch (error) {
      setError('Failed to fetch students');
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
      const token = localStorage.getItem('adminToken');
      
      if (editingStudent) {
        // Update existing student
        await axios.put(`/api/admin/students/${editingStudent.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Student updated successfully!');
      } else {
        // Create new student
        await axios.post('/api/admin/students', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Student created successfully!');
      }

      // Reset form and refresh students
      setFormData({
        student_id: '',
        name: '',
        email: '',
        password: ''
      });
      setEditingStudent(null);
      setShowForm(false);
      fetchStudents();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      name: student.name,
      email: student.email || '',
      password: '' // Don't show current password
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student? This will also delete all their exam results.')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Student deleted successfully!');
      fetchStudents();
    } catch (error) {
      setError('Failed to delete student');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      name: '',
      email: '',
      password: ''
    });
    setEditingStudent(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
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
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
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

        {/* Student Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="student_id"
                      required
                      value={formData.student_id}
                      onChange={handleChange}
                      className="input-field pl-10 w-full"
                      placeholder="e.g., 2021001"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="e.g., John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10 w-full"
                    placeholder="e.g., john.doe@university.edu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingStudent ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required={!editingStudent}
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pr-20 w-full"
                    placeholder={editingStudent ? 'Enter new password or leave blank' : 'Enter password'}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {!editingStudent && (
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600"
                      >
                        Generate
                      </button>
                    )}
                  </div>
                </div>
                {!editingStudent && formData.password && (
                  <p className="text-sm text-gray-500 mt-1">
                    Generated password: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{formData.password}</span>
                  </p>
                )}
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
                  {editingStudent ? 'Update Student' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Students List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              All Students ({students.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {students.map((student) => (
              <div key={student.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {student.name}
                        </h4>
                        <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      {student.email && (
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{student.email}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Joined: {new Date(student.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(student)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Edit Student"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete Student"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No students found. Add your first student!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;

