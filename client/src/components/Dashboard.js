import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
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
import UKFHeader from './UKFHeader';
import UKFFooter from './UKFFooter';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLocalization();
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
    <div className="min-h-screen bg-gradient-to-br from-ukf-50 via-white to-ukf-accent-50">
      {/* UKF Header */}
      <UKFHeader 
        title="Student Dashboard"
        subtitle="Welcome to Your Learning Journey"
        showUserMenu={true}
        showLanguageSwitcher={true}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-ukf-hero text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('studentDashboard.welcomeBack', { name: user?.name })}
            </h1>
            <p className="text-xl text-ukf-100 max-w-2xl mx-auto">
              {t('studentDashboard.readyToAce')}
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
          <div className="ukf-card p-8 transform -mt-16 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="h-20 w-20 bg-ukf-gradient rounded-full flex items-center justify-center shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-ukf-900 mb-2">{user?.name}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2 text-ukf-600">
                    <Shield className="h-4 w-4 text-ukf-500" />
                    <span className="font-medium">{t('studentDashboard.studentId')}: {user?.student_id}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-ukf-600">
                    <Calendar className="h-4 w-4 text-ukf-500" />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-ukf-accent-100 text-ukf-accent-800 px-4 py-2 rounded-full">
                <div className="h-2 w-2 bg-ukf-accent-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{t('studentDashboard.activeStudent')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="ukf-card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ukf-600">{t('studentDashboard.availableExams')}</p>
                <p className="text-3xl font-bold text-ukf-600">{exams.length}</p>
              </div>
              <div className="h-12 w-12 bg-ukf-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-ukf-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-ukf-500">
              <TrendingUp className="h-4 w-4 mr-1 text-ukf-accent-500" />
              <span>{t('studentDashboard.readyToTake')}</span>
            </div>
          </div>

          <div className="ukf-card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ukf-600">{t('studentDashboard.completed')}</p>
                <p className="text-3xl font-bold text-ukf-accent-600">{completedCount}</p>
              </div>
              <div className="h-12 w-12 bg-ukf-accent-100 rounded-xl flex items-center justify-center">
                <Trophy className="h-6 w-6 text-ukf-accent-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-ukf-500">
              <CheckCircle className="h-4 w-4 mr-1 text-ukf-accent-500" />
              <span>{t('studentDashboard.greatJob')}</span>
            </div>
          </div>

          <div className="ukf-card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ukf-600">{t('studentDashboard.pending')}</p>
                <p className="text-3xl font-bold text-ukf-gold-600">{pendingCount}</p>
              </div>
              <div className="h-12 w-12 bg-ukf-gold-100 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-ukf-gold-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-ukf-500">
              <Clock className="h-4 w-4 mr-1 text-ukf-gold-500" />
              <span>{t('studentDashboard.stillToComplete')}</span>
            </div>
          </div>
        </div>

        {/* Available Exams Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-ukf-900 flex items-center">
              <BookOpen className="h-7 w-7 mr-3 text-ukf-600" />
              {t('studentDashboard.availableExamsSection')}
            </h2>
            <div className="text-sm text-ukf-500">
              {t('studentDashboard.examsAvailable', { count: exams.length, plural: exams.length !== 1 ? 's' : '' })}
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
            <div className="ukf-card p-12 text-center">
              <BookOpen className="h-20 w-20 text-ukf-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-ukf-900 mb-2">{t('studentDashboard.noExamsAvailable')}</h3>
              <p className="text-ukf-600 mb-6">{t('studentDashboard.checkBackLater')}</p>
              <div className="inline-flex items-center px-4 py-2 bg-ukf-100 text-ukf-800 rounded-full text-sm">
                <Clock className="h-4 w-4 mr-2" />
                {t('studentDashboard.comingSoon')}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {exams.map((exam) => {
                const isCompleted = completionStatus[exam.id];
                const isExpired = new Date(exam.end_time) < new Date();
                const isNotStarted = new Date(exam.start_time) > new Date();
                
                return (
                  <div key={exam.id} className="ukf-card p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-ukf-900 mb-2">{exam.title}</h3>
                        <p className="text-ukf-600 text-sm mb-3">{exam.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-ukf-600 mb-4">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-ukf-500" />
                            <span>{exam.questions_per_exam || exam.total_questions} {t('studentDashboard.questions')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-ukf-500" />
                            <span>{exam.duration_minutes} {t('studentDashboard.minutes')}</span>
                          </div>
                        </div>
                        
                        {exam.total_marks && (
                          <div className="flex items-center space-x-2 text-sm text-ukf-600">
                            <Award className="h-4 w-4 text-ukf-gold-500" />
                            <span>{exam.total_marks} {t('studentDashboard.marks')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isCompleted ? (
                      <div className="flex items-center justify-center space-x-2 text-ukf-accent-600 bg-ukf-accent-50 px-4 py-3 rounded-xl font-medium">
                        <CheckCircle className="h-5 w-5" />
                        <span>{t('studentDashboard.completed')}</span>
                      </div>
                    ) : isExpired ? (
                      <div className="text-center text-ukf-500 bg-ukf-50 px-4 py-3 rounded-xl">
                        {t('exam.examExpired')}
                      </div>
                    ) : isNotStarted ? (
                      <div className="text-center text-ukf-500 bg-ukf-50 px-4 py-3 rounded-xl">
                        {t('exam.examNotStarted')}
                      </div>
                    ) : (
                      <Link
                        to={`/exam/${exam.id}`}
                        className="ukf-button-primary w-full flex items-center justify-center space-x-2"
                      >
                        <Play className="h-5 w-5" />
                        <span>{t('studentDashboard.startExam')}</span>
                        <Zap className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-ukf-900 flex items-center">
              <Trophy className="h-6 w-6 mr-3 text-ukf-gold-500" />
              {t('studentDashboard.myResults')}
            </h3>
            <Link
              to="/results"
              className="ukf-button-secondary flex items-center space-x-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>{t('studentDashboard.viewAllResults')}</span>
            </Link>
          </div>
          
          <div className="ukf-card p-6">
            <div className="text-center">
              <div className="h-16 w-16 bg-ukf-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-ukf-gold-500" />
              </div>
              <h4 className="text-lg font-semibold text-ukf-900 mb-2">{t('studentDashboard.resultsOverview')}</h4>
              <p className="text-ukf-600 mb-4">{t('studentDashboard.resultsDescription')}</p>
              <Link
                to="/results"
                className="ukf-button-primary inline-flex items-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>{t('studentDashboard.viewResults')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="ukf-card p-8 bg-gradient-to-r from-ukf-50 to-ukf-accent-50 border-ukf-200">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 bg-ukf-100 rounded-xl flex items-center justify-center mr-4">
              <FileText className="h-6 w-6 text-ukf-600" />
            </div>
            <h3 className="text-xl font-bold text-ukf-900">{t('studentDashboard.examInstructionsAndTips')}</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-ukf-800 mb-3">{t('studentDashboard.beforeStarting')}</h4>
              <ul className="space-y-2 text-ukf-700 text-sm">
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-ukf-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('studentDashboard.ensureStableInternetConnection')}
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-ukf-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('studentDashboard.findQuietEnvironmentToFocus')}
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-ukf-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('studentDashboard.haveStudentIdReady')}
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-ukf-800 mb-3">{t('studentDashboard.duringExam')}</h4>
              <ul className="space-y-2 text-ukf-700 text-sm">
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-ukf-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('studentDashboard.readEachQuestionCarefully')}
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-ukf-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('studentDashboard.canOnlySelectOneAnswerPerQuestion')}
                </li>
                <li className="flex items-start">
                  <span className="h-2 w-2 bg-ukf-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('studentDashboard.answersCannotBeChangedAfterSubmission')}
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-ukf-100 rounded-xl border border-ukf-200">
            <div className="flex items-center text-ukf-800">
              <Shield className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">
                {t('studentDashboard.needHelpContactInstructorImmediately')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* UKF Footer */}
      <UKFFooter />
    </div>
  );
};

export default Dashboard;
