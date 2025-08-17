import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import axios from 'axios';
import { 
  BarChart3, 
  Trophy, 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Award,
  Star,
  CheckCircle,
  XCircle,
  Zap,
  BookOpen,
  Activity
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import UKFHeader from './UKFHeader';
import UKFFooter from './UKFFooter';

const Results = () => {
  const { user } = useAuth();
  const { t } = useLocalization();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/results');
      setResults(response.data.data);
    } catch (error) {
      console.error('Error fetching results:', error);
      setError(t('studentResults.failedToLoadResults'));
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100 border-green-200';
    if (percentage >= 80) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    if (percentage >= 60) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getScoreIcon = (percentage) => {
    if (percentage >= 90) return <Trophy className="h-5 w-5 text-green-600" />;
    if (percentage >= 80) return <Star className="h-5 w-5 text-blue-600" />;
    if (percentage >= 70) return <TrendingUp className="h-5 w-5 text-yellow-600" />;
    if (percentage >= 60) return <Target className="h-5 w-5 text-orange-600" />;
    return <TrendingDown className="h-5 w-5 text-red-600" />;
  };

  const getScoreBadge = (percentage) => {
    if (percentage >= 90) return { text: 'Excellent', color: 'bg-green-500' };
    if (percentage >= 80) return { text: 'Great', color: 'bg-blue-500' };
    if (percentage >= 70) return { text: 'Good', color: 'bg-yellow-500' };
    if (percentage >= 60) return { text: 'Fair', color: 'bg-orange-500' };
    return { text: 'Needs Improvement', color: 'bg-red-500' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'N/A';
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ukf-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ukf-700 mx-auto mb-4"></div>
          <p className="text-ukf-700 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  const averageScore = results.length > 0 
    ? Math.round(results.reduce((acc, result) => acc + (result.score / result.total_questions) * 100, 0) / results.length)
    : 0;
  
  const averageTime = results.length > 0 
    ? Math.round(results.reduce((acc, result) => acc + result.time_taken, 0) / results.length / 60)
    : 0;
  
  const highScores = results.filter(result => (result.score / result.total_questions) * 100 >= 80).length;

  return (
    <div className="min-h-screen bg-ukf-50">
      {/* UKF Header */}
      <UKFHeader 
        title="Exam Results"
        subtitle="Your Academic Performance Overview"
        showUserMenu={true}
        showLanguageSwitcher={true}
        showBackButton={true}
        backTo="/dashboard"
        backLabel="Back to Dashboard"
      />

      <div className="container-ukf py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ukf-900 mb-2">Your Exam Results</h1>
          <p className="text-ukf-600 text-lg">Track your progress and performance across all examinations</p>
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{results.length}</div>
            <div className="ukf-stat-label">Total Exams</div>
            <BookOpen className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
          
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{averageScore}%</div>
            <div className="ukf-stat-label">Average Score</div>
            <BarChart3 className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
          
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{highScores}</div>
            <div className="ukf-stat-label">High Scores (80%+)</div>
            <Trophy className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
          
          <div className="ukf-stat-card">
            <div className="ukf-stat-number text-ukf-700">{averageTime}m</div>
            <div className="ukf-stat-label">Avg. Time</div>
            <Clock className="h-8 w-8 text-ukf-400 mx-auto mt-3" />
          </div>
        </div>

        {/* Results Table */}
        {results.length > 0 ? (
          <div className="ukf-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="ukf-table">
                <thead>
                  <tr>
                    <th>Exam</th>
                    <th>Score</th>
                    <th>Time Taken</th>
                    <th>Date</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => {
                    const percentage = result.percentage || 0;
                    const scoreBadge = getScoreBadge(percentage);
                    
                    return (
                      <tr key={result.id} className="hover:bg-ukf-50">
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-ukf-100 rounded-full flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-ukf-600" />
                            </div>
                            <div>
                              <div className="font-medium text-ukf-900">
                                {result.exam_title || 'Unknown Exam'}
                              </div>
                              <div className="text-sm text-ukf-500">
                                {result.score} / {result.total_marks} marks
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            {getScoreIcon(percentage)}
                            <span className={`font-semibold ${getScoreColor(percentage)} px-3 py-1 rounded-full text-sm border`}>
                              {percentage}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-ukf-400" />
                            <span className="text-ukf-700">{formatTime(result.time_taken)}</span>
                          </div>
                        </td>
                        <td className="text-ukf-600 text-sm">
                          {formatDate(result.submitted_at)}
                        </td>
                        <td>
                          <span className={`ukf-badge ${scoreBadge.color} text-white`}>
                            {scoreBadge.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="ukf-card p-12 text-center">
            <BookOpen className="h-16 w-16 text-ukf-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-ukf-600 mb-2">No Results Yet</h3>
            <p className="text-ukf-500">Complete your first exam to see your results here</p>
          </div>
        )}
      </div>

      {/* UKF Footer */}
      <UKFFooter />
    </div>
  );
};

export default Results;

