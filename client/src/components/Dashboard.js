import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  BookOpen, 
  Clock, 
  FileText, 
  Play, 
  CheckCircle, 
  XCircle, 
  User, 
  Trophy, 
  Target, 
  TrendingUp,
  Calendar,
  Award,
  Zap,
  Shield
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [completionStatus, setCompletionStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/exams');
      const examsData = response.data.data;
      setExams(examsData);
      
      // Fetch completion status for each exam
      const statusPromises = examsData.map(exam => 
        axios.get(`/api/exams/${exam.id}/completion-status`)
      );
      
      const statusResponses = await Promise.all(statusPromises);
      const statusMap = {};
      statusResponses.forEach((response, index) => {
        statusMap[examsData[index].id] = response.data.data.completed;
      });
      setCompletionStatus(statusMap);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setError('Failed to load exams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const completedCount = Object.values(completionStatus).filter(Boolean).length;
  const pendingCount = exams.length - completedCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Ready to ace your exams? Choose from the available tests below and demonstrate your knowledge.
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full translate-x-20 translate-y-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Profile Card */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transform -mt-16 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{user?.name}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Student ID: {user?.student_id}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Active Student</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Exams</p>
                <p className="text-3xl font-bold text-blue-600">{exams.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              <span>Ready to take</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
              <span>Great job!</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1 text-orange-500" />
              <span>Still to complete</span>
            </div>
          </div>
        </div>

        {/* Available Exams Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="h-7 w-7 mr-3 text-blue-600" />
              Available Exams
            </h2>
            <div className="text-sm text-gray-500">
              {exams.length} exam{exams.length !== 1 ? 's' : ''} available
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

          {exams.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No exams available</h3>
              <p className="text-gray-600 mb-6">Check back later for new exams or contact your instructor.</p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm">
                <Clock className="h-4 w-4 mr-2" />
                Coming soon
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {exam.title}
                        </h3>
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          {exam.subject}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span>{exam.questions_per_exam || exam.total_questions} questions</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-indigo-500" />
                            <span>{exam.duration_minutes} min</span>
                          </div>
                        </div>
                        
                        {exam.total_marks > 0 && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span>{exam.total_marks} marks</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    {completionStatus[exam.id] ? (
                      <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl font-medium">
                        <CheckCircle className="h-5 w-5" />
                        <span>Completed ✓</span>
                      </div>
                    ) : (
                      <Link
                        to={`/exam/${exam.id}`}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <Play className="h-5 w-5" />
                        <span>Start Exam</span>
                        <Zap className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exam Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-blue-900">📋 Exam Instructions & Tips</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">Before Starting:</h4>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Ensure you have a stable internet connection
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Find a quiet environment to focus
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Have your student ID ready
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">During the Exam:</h4>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Read each question carefully
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You can only select one answer per question
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Answers cannot be changed after submission
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center text-blue-800">
              <Shield className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">
                Need help? Contact your instructor immediately if you encounter any technical issues.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
