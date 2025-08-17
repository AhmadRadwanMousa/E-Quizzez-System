import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Download, Eye, TrendingUp, TrendingDown, Trophy, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import UKFHeader from './UKFHeader';
import UKFFooter from './UKFFooter';

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    student_id: '',
    exam_id: '',
    min_score: '',
    max_score: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { t } = useLocalization();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const [resultsRes, studentsRes, examsRes] = await Promise.all([
        axios.get('/api/admin/results', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/exams', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setResults(resultsRes.data.data);
      setStudents(studentsRes.data.data);
      setExams(examsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load results data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredResults = () => {
    return results.filter(result => {
      if (filters.student_id && result.student_id !== parseInt(filters.student_id)) return false;
      if (filters.exam_id && result.exam_id !== parseInt(filters.exam_id)) return false;
      if (filters.min_score && result.score < parseInt(filters.min_score)) return false;
      if (filters.max_score && result.score > parseInt(filters.max_score)) return false;
      return true;
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 80) return 'text-blue-600 bg-blue-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (percentage) => {
    if (percentage >= 90) return <Trophy className="h-4 w-4 text-green-600" />;
    if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-blue-600" />;
    if (percentage >= 70) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    if (percentage >= 60) return <TrendingDown className="h-4 w-4 text-orange-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return '—';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : `Student ${studentId}`;
  };

  const getExamTitle = (examId) => {
    const exam = exams.find(e => e.id === examId);
    return exam ? exam.title : `Exam ${examId}`;
  };

  const calculateStats = () => {
    const filtered = getFilteredResults();
    if (filtered.length === 0) return { total: 0, average: 0, highest: 0, lowest: 100 };
    
    const scores = filtered.map(r => r.percentage || 0);
    return {
      total: filtered.length,
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      highest: Math.round(Math.max(...scores)),
      lowest: Math.round(Math.min(...scores))
    };
  };

  const exportToCSV = () => {
    const filtered = getFilteredResults();
    const csvContent = [
      ['Student', 'Exam', 'Score', 'Total Marks', 'Percentage', 'Time Taken', 'Submitted'],
      ...filtered.map(r => [
        getStudentName(r.student_id),
        getExamTitle(r.exam_id),
        r.score,
        r.total_marks,
        `${r.percentage || 0}%`,
        formatTime(r.time_taken),
        formatDate(r.submitted_at)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ukf-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ukf-700 mx-auto mb-4"></div>
          <p className="text-ukf-700 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const filteredResults = getFilteredResults();

  return (
    <div className="min-h-screen bg-ukf-50">
      {/* UKF Header */}
      <UKFHeader
        title="Exam Results Management"
        subtitle="Monitor Student Performance and Analytics"
        showUserMenu={true}
        showLanguageSwitcher={true}
        showBackButton={true}
        backTo="/admin/dashboard"
        backLabel="Back to Dashboard"
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
            <span className="text-ukf-700 font-medium">Results Management</span>
          </nav>
        </div>

        {/* Page Title Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-ukf-900 mb-2">Exam Results Management</h2>
          <p className="text-ukf-600 text-lg">Monitor student performance and analyze exam results</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <div className="flex items-center">
              <span className="text-lg mr-2">❌</span>
              {error}
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div className="ukf-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="ukf-button-secondary flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
              </button>
            </div>

            <div className="flex space-x-3">
              <button onClick={exportToCSV} className="ukf-button-primary flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{stats.total}</div>
            <div className="ukf-stat-label">Total Results</div>
            <Trophy className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>

          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{stats.average}%</div>
            <div className="ukf-stat-label">Average Score</div>
            <TrendingUp className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>

          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{stats.highest}%</div>
            <div className="ukf-stat-label">Highest Score</div>
            <Trophy className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>

          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{stats.lowest}%</div>
            <div className="ukf-stat-label">Lowest Score</div>
            <TrendingDown className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="ukf-card p-6 mb-8">
            <h3 className="text-lg font-semibold text-ukf-900 mb-4">Filter Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-ukf-700 mb-2">Student</label>
                <select
                  value={filters.student_id}
                  onChange={(e) => setFilters(prev => ({ ...prev, student_id: e.target.value }))}
                  className="ukf-input w-full"
                >
                  <option value="">All Students</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.student_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ukf-700 mb-2">Exam</label>
                <select
                  value={filters.exam_id}
                  onChange={(e) => setFilters(prev => ({ ...prev, exam_id: e.target.value }))}
                  className="ukf-input w-full"
                >
                  <option value="">All Exams</option>
                  {exams.map(exam => (
                    <option key={exam.id} value={exam.id}>
                      {exam.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ukf-700 mb-2">Min Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.min_score}
                  onChange={(e) => setFilters(prev => ({ ...prev, min_score: e.target.value }))}
                  className="ukf-input w-full"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ukf-700 mb-2">Max Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.max_score}
                  onChange={(e) => setFilters(prev => ({ ...prev, max_score: e.target.value }))}
                  className="ukf-input w-full"
                  placeholder="100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="ukf-card overflow-hidden">
          <div className="px-6 py-4 border-b border-ukf-200">
            <h3 className="text-lg font-semibold text-ukf-900">
              Results ({filteredResults.length})
            </h3>
          </div>
          
          {filteredResults.length === 0 ? (
            <div className="p-12 text-center text-ukf-500">
              <Trophy className="h-16 w-16 text-ukf-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-ukf-600 mb-2">
                {results.length === 0 ? 'No exam results yet.' : 'No results match the current filters.'}
              </h3>
              <p className="text-ukf-500">
                {results.length === 0 ? 'Students need to complete exams to see results here.' : 'Try adjusting your filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="ukf-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Exam</th>
                    <th>Score</th>
                    <th>Time Taken</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => {
                    const percentage = result.percentage || 0;
                    return (
                      <tr key={result.id} className="hover:bg-ukf-50">
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-ukf-100 rounded-full flex items-center justify-center">
                              <Trophy className="h-5 w-5 text-ukf-600" />
                            </div>
                            <div>
                              <div className="font-medium text-ukf-900">
                                {getStudentName(result.student_id)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-ukf-700">
                            {getExamTitle(result.exam_id)}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <span className={`ukf-badge ${getScoreColor(percentage)}`}>
                              {getScoreIcon(percentage)}
                              <span className="ml-1">{result.score}/{result.total_marks} marks</span>
                            </span>
                            <span className="text-sm text-ukf-500">({percentage}%)</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center text-ukf-700">
                            <Clock className="h-4 w-4 mr-2 text-ukf-400" />
                            {formatTime(result.time_taken)}
                          </div>
                        </td>
                        <td className="text-ukf-600 text-sm">
                          {formatDate(result.submitted_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* UKF Footer */}
      <UKFFooter />
    </div>
  );
};

export default AdminResults;
