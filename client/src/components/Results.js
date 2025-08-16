import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
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

const Results = () => {
  const { user } = useAuth();
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
      setError('Failed to load results. Please try again.');
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const averageScore = results.length > 0 
    ? Math.round(results.reduce((acc, result) => acc + (result.score / result.total_questions) * 100, 0) / results.length)
    : 0;
  
  const averageTime = results.length > 0 
    ? Math.round(results.reduce((acc, result) => acc + result.time_taken, 0) / results.length / 60)
    : 0;
  
  const highScores = results.filter(result => (result.score / result.total_questions) * 100 >= 80).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Exam Results 📊
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Track your performance and see how you're progressing across all completed exams
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full translate-x-20 translate-y-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Exams</p>
                  <p className="text-3xl font-bold text-blue-600">{results.length}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Activity className="h-4 w-4 mr-1 text-blue-500" />
                <span>Completed</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-3xl font-bold text-green-600">{averageScore}%</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                <span>Performance</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                  <p className="text-3xl font-bold text-orange-600">{averageTime}m</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Zap className="h-4 w-4 mr-1 text-orange-500" />
                <span>Efficiency</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Scores</p>
                  <p className="text-3xl font-bold text-purple-600">{highScores}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Star className="h-4 w-4 mr-1 text-purple-500" />
                <span>80%+ scores</span>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-7 w-7 mr-3 text-green-600" />
              Exam History
            </h2>
            <div className="text-sm text-gray-500">
              {results.length} exam{results.length !== 1 ? 's' : ''} completed
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            </div>
          )}

          {results.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <BarChart3 className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results yet</h3>
              <p className="text-gray-600 mb-6">Complete your first exam to see your results and track your progress here.</p>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Start your first exam
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {results.map((result) => {
                const percentage = Math.round((result.score / result.total_questions) * 100);
                const scoreBadge = getScoreBadge(percentage);
                
                return (
                  <div key={result.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-xl font-bold text-gray-900">
                                {result.exam_title}
                              </h3>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                {result.subject}
                              </span>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${scoreBadge.color} text-white`}>
                                {scoreBadge.text}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">{formatDate(result.submitted_at)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-indigo-500" />
                                <span className="font-medium">{formatTime(result.time_taken)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <BarChart3 className="h-4 w-4 text-purple-500" />
                                <span className="font-medium">{result.score}/{result.total_questions}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getScoreIcon(percentage)}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(percentage)}`}>
                                  {percentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Score Bar */}
                        <div className="mt-6">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span className="font-medium">Performance Score</span>
                            <span className="font-bold">{result.score} out of {result.total_questions}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ease-out ${
                                percentage >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                percentage >= 80 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                                percentage >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                percentage >= 60 ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 
                                'bg-gradient-to-r from-red-400 to-red-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          
                          {/* Score indicators */}
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Performance Tips */}
        {results.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-900">🚀 Performance Tips & Insights</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  To Improve Your Score:
                </h4>
                <ul className="space-y-3 text-green-700 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    Review questions you got wrong and understand the concepts
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    Practice time management to avoid rushing through questions
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    Read questions carefully and identify key information
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    Focus on your weaker subjects and practice more
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Time Management Strategies:
                </h4>
                <ul className="space-y-3 text-green-700 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    Don't spend too long on one question - move on if stuck
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    Review your answers if time permits before submitting
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    Submit before time runs out to avoid losing progress
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    Practice with timed mock exams to build confidence
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-100 rounded-xl border border-green-200">
              <div className="flex items-center text-green-800">
                <Zap className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">
                  💡 Pro Tip: Your average score of {averageScore}% shows {averageScore >= 80 ? 'excellent performance' : averageScore >= 70 ? 'good progress' : 'room for improvement'}. Keep practicing and you'll see even better results!
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;

