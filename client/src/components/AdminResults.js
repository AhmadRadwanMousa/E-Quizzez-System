import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Download, Eye, TrendingUp, TrendingDown, Trophy, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = calculateStats();
  const filteredResults = getFilteredResults();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button onClick={() => navigate('/admin/dashboard')} className="mr-4 p-2 text-gray-400 hover:text-gray-600">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button onClick={exportToCSV} className="btn-primary flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Results</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.average}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Highest Score</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.highest}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lowest Score</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.lowest}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  value={filters.student_id}
                  onChange={(e) => setFilters(prev => ({ ...prev, student_id: e.target.value }))}
                  className="input-field w-full"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
                <select
                  value={filters.exam_id}
                  onChange={(e) => setFilters(prev => ({ ...prev, exam_id: e.target.value }))}
                  className="input-field w-full"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.min_score}
                  onChange={(e) => setFilters(prev => ({ ...prev, min_score: e.target.value }))}
                  className="input-field w-full"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.max_score}
                  onChange={(e) => setFilters(prev => ({ ...prev, max_score: e.target.value }))}
                  className="input-field w-full"
                  placeholder="100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Results ({filteredResults.length})
            </h3>
          </div>
          
          {filteredResults.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {results.length === 0 ? 'No exam results yet.' : 'No results match the current filters.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Taken
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResults.map((result) => {
                    const percentage = result.percentage || 0;
                    return (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {getStudentName(result.student_id)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getExamTitle(result.exam_id)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(percentage)}`}>
                              {getScoreIcon(percentage)}
                              <span className="ml-1">{result.score}/{result.total_marks} marks</span>
                            </span>
                            <span className="text-sm text-gray-500">({percentage}%)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            {formatTime(result.time_taken)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
    </div>
  );
};

export default AdminResults;
