import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const { getToken } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await axios.get('/api/students', { headers: { Authorization: `Bearer ${token}` } });
      setStudents(res.data.data);
    } catch (e) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
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
        setSuccess('Student updated successfully');
      } else {
        await axios.post('/api/admin/students', formData, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess('Student created successfully');
      }
      resetForm();
      fetchStudents();
    } catch (e) {
      setError(e.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({ student_id: student.student_id, name: student.name, email: student.email || '', password: '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This will also remove their results.')) return;
    try {
      const token = getToken();
      await axios.delete(`/api/admin/students/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Student deleted successfully');
      fetchStudents();
    } catch (e) {
      setError('Failed to delete student');
    }
  };

  const formatDateTime = (ts) => new Date(ts).toLocaleString();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button onClick={() => navigate('/admin/dashboard')} className="mr-4 p-2 text-gray-400 hover:text-gray-600">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}
        {success && <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">{success}</div>}

        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                  <input name="student_id" required value={formData.student_id} onChange={handleChange} className="input-field w-full" placeholder="e.g., 2021006" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input name="name" required value={formData.name} onChange={handleChange} className="input-field w-full" placeholder="Full name" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" value={formData.email} onChange={handleChange} className="input-field w-full" placeholder="email@university.edu" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{editingStudent ? 'Password (optional)' : 'Password *'}</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field w-full" placeholder={editingStudent ? 'Leave blank to keep current' : 'Set password'} required={!editingStudent} />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingStudent ? 'Update Student' : 'Create Student'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Students ({students.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {students.map((s) => (
              <div key={s.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-1">{s.name}</h4>
                    <p className="text-sm text-gray-700">ID: {s.student_id}</p>
                    <p className="text-sm text-gray-600">Email: {s.email || '—'}</p>
                    <p className="text-xs text-gray-500 mt-1">Created: {formatDateTime(s.created_at)}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button onClick={() => handleEdit(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <div className="p-6 text-center text-gray-500">No students yet. Add your first student.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsManagement;

