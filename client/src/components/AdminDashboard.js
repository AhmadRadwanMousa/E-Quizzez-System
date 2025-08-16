import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Award, 
  BarChart3, 
  LogOut, 
  Settings, 
  FileText, 
  Plus, 
  TrendingUp, 
  Activity, 
  Shield, 
  Zap, 
  Target, 
  Clock,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Database,
  PieChart
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalQuestions: 0,
    totalExams: 0,
    activeExams: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout, getToken } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = getToken();
      const [examsRes, questionsRes, studentsRes] = await Promise.all([
        axios.get('/api/admin/exams', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/questions', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/students', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const activeExams = examsRes.data.data.filter(exam => exam.is_active).length;

      setStats({
        totalExams: examsRes.data.data.length,
        totalQuestions: questionsRes.data.data.length,
        totalStudents: studentsRes.data.data.length,
        activeExams: activeExams
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm mr-4">
                <Settings className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-indigo-100 text-sm">Manage your quiz platform</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-6 py-3 text-sm font-medium text-white hover:text-indigo-100 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full translate-x-20 translate-y-20"></div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.totalExams}</p>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Activity className="h-4 w-4 mr-1 text-indigo-500" />
              <span>Created</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalQuestions}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Database className="h-4 w-4 mr-1 text-green-500" />
              <span>In database</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalStudents}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <UserPlus className="h-4 w-4 mr-1 text-purple-500" />
              <span>Registered</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Exams</p>
                <p className="text-3xl font-bold text-orange-600">{stats.activeExams}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 mr-1 text-orange-500" />
              <span>Live now</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Questions</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Create, edit, and delete questions for your exams. Organize questions by subject and difficulty level.
            </p>
            <button
              onClick={() => navigate('/admin/questions')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              <span>Manage Questions</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-indigo-200 transition-colors">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Exams</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Create new exams, assign questions, set time limits, and control exam availability with start/end times.
            </p>
            <button
              onClick={() => navigate('/admin/exams')}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              <span>Manage Exams</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Students</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Create, edit, and delete student accounts. Manage student information and access permissions.
            </p>
            <button
              onClick={() => navigate('/admin/students')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              <span>Manage Students</span>
            </button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-indigo-600" />
              Quick Actions
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/admin/questions/new')}
                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
              >
                <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 group-hover:text-green-700">Add Question</p>
                  <p className="text-sm text-gray-600">Create a new question</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/exams/new')}
                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 group"
              >
                <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-indigo-200 transition-colors">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 group-hover:text-indigo-700">Create Exam</p>
                  <p className="text-sm text-gray-600">Set up a new exam</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/results')}
                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
              >
                <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 group-hover:text-purple-700">View Results</p>
                  <p className="text-sm text-gray-600">Check student performance</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900">System Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Database: Connected and healthy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Authentication: Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>API: Running smoothly</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Security: Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
