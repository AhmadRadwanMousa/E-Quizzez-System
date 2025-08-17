import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
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
  UserPlus, 
  Database
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import UKFHeader from './UKFHeader';
import UKFFooter from './UKFFooter';

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
  const { t } = useLocalization();

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
      <div className="min-h-screen bg-ukf-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ukf-700 mx-auto mb-4"></div>
          <p className="text-ukf-700 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ukf-50">
      {/* UKF Header */}
      <UKFHeader
        title={t('adminDashboard.title')}
        subtitle={t('adminDashboard.subtitle')}
        showUserMenu={true}
        showLanguageSwitcher={true}
      />

      {/* Main Content */}
      <div className="container-ukf py-8">
        {/* Page Title Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-ukf-900 mb-2">{t('adminDashboard.administrativeControlCenter')}</h2>
          <p className="text-ukf-600 text-lg">{t('adminDashboard.platformDescription')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{stats.totalStudents}</div>
            <div className="ukf-stat-label">{t('adminDashboard.totalStudents')}</div>
            <Users className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
          
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{stats.totalQuestions}</div>
            <div className="ukf-stat-label">{t('adminDashboard.totalQuestions')}</div>
            <FileText className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
          
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{stats.totalExams}</div>
            <div className="ukf-stat-label">{t('adminDashboard.totalExams')}</div>
            <BookOpen className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
          
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{stats.activeExams}</div>
            <div className="ukf-stat-label">{t('adminDashboard.activeExams')}</div>
            <Activity className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-ukf-900 mb-6 text-center">{t('adminDashboard.quickActions')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/admin/students')}
              className="ukf-card p-6 text-center hover:shadow-ukf-xl transition-all duration-300 group"
            >
              <div className="h-16 w-16 bg-ukf-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-ukf-200 transition-colors">
                <Users className="h-8 w-8 text-ukf-700" />
              </div>
              <h4 className="text-lg font-semibold text-ukf-900 mb-2">{t('adminDashboard.manageStudents')}</h4>
              <p className="text-ukf-600 text-sm">{t('adminDashboard.manageStudentsDesc')}</p>
            </button>

            <button
              onClick={() => navigate('/admin/subjects')}
              className="ukf-card p-6 text-center hover:shadow-ukf-xl transition-all duration-300 group"
            >
              <div className="h-16 w-16 bg-ukf-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-ukf-200 transition-colors">
                <BookOpen className="h-8 w-8 text-ukf-700" />
              </div>
              <h4 className="text-lg font-semibold text-ukf-900 mb-2">{t('adminDashboard.manageSubjects')}</h4>
              <p className="text-ukf-600 text-sm">{t('adminDashboard.manageSubjectsDesc')}</p>
            </button>

            <button
              onClick={() => navigate('/admin/questions')}
              className="ukf-card p-6 text-center hover:shadow-ukf-xl transition-all duration-300 group"
            >
              <div className="h-16 w-16 bg-ukf-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-ukf-200 transition-colors">
                <FileText className="h-8 w-8 text-ukf-700" />
              </div>
              <h4 className="text-lg font-semibold text-ukf-900 mb-2">{t('adminDashboard.manageQuestions')}</h4>
              <p className="text-ukf-600 text-sm">{t('adminDashboard.manageQuestionsDesc')}</p>
            </button>

            <button
              onClick={() => navigate('/admin/exams')}
              className="ukf-card p-6 text-center hover:shadow-ukf-xl transition-all duration-300 group"
            >
              <div className="h-16 w-16 bg-ukf-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-ukf-200 transition-colors">
                <BookOpen className="h-8 w-8 text-ukf-700" />
              </div>
              <h4 className="text-lg font-semibold text-ukf-900 mb-2">{t('adminDashboard.manageExams')}</h4>
              <p className="text-ukf-600 text-sm">{t('adminDashboard.manageExamsDesc')}</p>
            </button>

            <button
              onClick={() => navigate('/admin/results')}
              className="ukf-card p-6 text-center hover:shadow-ukf-xl transition-all duration-300 group"
            >
              <div className="h-16 w-16 bg-ukf-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-ukf-200 transition-colors">
                <TrendingUp className="h-8 w-8 text-ukf-700" />
              </div>
              <h4 className="text-lg font-semibold text-ukf-900 mb-2">{t('adminDashboard.manageResults')}</h4>
              <p className="text-ukf-600 text-sm">{t('adminDashboard.manageResultsDesc')}</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-ukf-900 mb-6 text-center">{t('adminDashboard.platformOverview')}</h3>
          <div className="ukf-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-ukf-800 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-ukf-600" />
                  {t('adminDashboard.systemStatus')}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-ukf-600">{t('adminDashboard.database')}</span>
                    <span className="ukf-badge ukf-badge-success">{t('adminDashboard.online')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ukf-600">{t('adminDashboard.apiServices')}</span>
                    <span className="ukf-badge ukf-badge-success">{t('adminDashboard.active')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ukf-600">{t('adminDashboard.security')}</span>
                    <span className="ukf-badge ukf-badge-success">{t('adminDashboard.protected')}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-ukf-800 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-ukf-600" />
                  {t('adminDashboard.performance')}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-ukf-600">{t('adminDashboard.responseTime')}</span>
                    <span className="text-ukf-700 font-medium">~45ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ukf-600">{t('adminDashboard.uptime')}</span>
                    <span className="text-ukf-700 font-medium">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ukf-600">{t('adminDashboard.load')}</span>
                    <span className="text-ukf-700 font-medium">{t('adminDashboard.low')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UKF Footer */}
      <UKFFooter />
    </div>
  );
};

export default AdminDashboard;
