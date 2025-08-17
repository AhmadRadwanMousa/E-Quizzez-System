import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import axios from 'axios';
import { Clock, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Send, BookOpen, User, Target, Timer } from 'lucide-react';
import UKFHeader from './UKFHeader';
import UKFFooter from './UKFFooter';

const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const { t } = useLocalization();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [examInfo, setExamInfo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [examStarted, setExamStarted] = useState(false);
  const [examStartTime, setExamStartTime] = useState(null);

  useEffect(() => {
    if (examId) {
      fetchExamInfo();
    }
  }, [examId]);

  useEffect(() => {
    if (examInfo && !examStarted) {
      // Try to start the exam automatically
      startExam();
    }
  }, [examInfo]);

  useEffect(() => {
    if (examInfo && examInfo.subject_id) {
      fetchQuestions();
    }
  }, [examInfo]);

  useEffect(() => {
    if (timeRemaining > 0 && !isNaN(timeRemaining)) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1 || isNaN(prev)) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const startExam = async () => {
    try {
      setError('');
      const token = getToken();
      console.log('Starting exam for exam ID:', examId);
      
      const response = await axios.post(`/api/exams/${examId}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Start exam response:', response.data);
      
      if (response.data.success) {
        const { start_time, duration_minutes, already_started } = response.data.data;
        
        setExamStartTime(start_time);
        setExamStarted(true);
        
        if (already_started && start_time) {
          // Calculate remaining time based on start time
          try {
            const startTime = new Date(start_time);
            const now = new Date();
            
            // Validate dates
            if (isNaN(startTime.getTime()) || isNaN(now.getTime())) {
              console.error('Invalid date values:', { start_time, startTime, now });
              // Use examInfo duration instead of response duration_minutes
              const fallbackDuration = examInfo?.duration_minutes || 60;
              setTimeRemaining(fallbackDuration * 60);
            } else {
              const elapsedSeconds = Math.floor((now - startTime) / 1000);
              // Use examInfo duration instead of response duration_minutes
              const totalSeconds = (examInfo?.duration_minutes || 60) * 60;
              const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
              
              console.log('Time calculation:', { 
                start_time, 
                startTime, 
                now, 
                elapsedSeconds, 
                totalSeconds, 
                remainingSeconds,
                examInfoDuration: examInfo?.duration_minutes,
                responseDuration: duration_minutes
              });
              
              setTimeRemaining(remainingSeconds);
              
              if (remainingSeconds <= 0) {
                // Time's up, auto-submit
                handleSubmitExam();
                return;
              }
            }
          } catch (error) {
            console.error('Error calculating remaining time:', error);
            // Use examInfo duration instead of response duration_minutes
            const fallbackDuration = examInfo?.duration_minutes || 60;
            setTimeRemaining(fallbackDuration * 60);
          }
        } else {
          // Fresh start, set full duration
          setTimeRemaining((examInfo?.duration_minutes || 60) * 60);
        }
        
        // After starting exam, fetch questions
        fetchQuestions();
      } else {
        setError('Failed to start exam. Please try again.');
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      if (error.response?.status === 403) {
        setError('You have already completed this exam.');
      } else if (error.response?.status === 400) {
        setError('This exam is not currently active.');
      } else {
        setError('Failed to start exam. Please check your connection and try again.');
      }
    }
  };

  const fetchExamInfo = async () => {
    try {
      setError('');
      const token = getToken();
      console.log('Fetching exam info for exam ID:', examId);
      const response = await axios.get(`/api/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Exam info response:', response.data);
      
      if (response.data.success && response.data.data) {
        setExamInfo(response.data.data);
        // Don't set timer here - wait for exam start
      } else {
        setError('Failed to load exam information. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching exam info:', error);
      if (error.response?.status === 404) {
        setError('Exam not found. Please check the exam ID and try again.');
      } else if (error.response?.status === 401) {
        setError('You are not authorized to access this exam. Please log in.');
      } else {
        setError('Failed to load exam information. Please check your connection and try again.');
      }
    }
  };

  const fetchQuestions = async () => {
    try {
      setError('');
      const token = getToken();
      
      // First, get the exam info to know the subject and number of questions needed
      if (!examInfo) {
        setError('Exam information not available. Please try again.');
        return;
      }

      console.log('Fetching questions for exam ID:', examId);

      // Use the proper exam questions endpoint
      const response = await axios.get(`/api/exams/${examId}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Questions response:', response.data);
      
      if (response.data.success && response.data.data) {
        const { questions: questionsData, start_time, exam_session_id, duration_minutes } = response.data.data;
        setQuestions(questionsData);
        
        // Update start time if not already set
        if (start_time && !examStartTime) {
          setExamStartTime(start_time);
        }
        
        // Log the data for debugging
        console.log('Questions response data:', {
          questionsCount: questionsData?.length,
          start_time,
          exam_session_id,
          duration_minutes,
          examInfoDuration: examInfo?.duration_minutes
        });
      } else {
        setError('Failed to load exam questions. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      if (error.response?.status === 404) {
        setError('Questions not found for this exam.');
      } else if (error.response?.status === 401) {
        setError('You are not authorized to access this exam.');
      } else if (error.response?.status === 403) {
        setError('You have already completed this exam.');
      } else {
        setError('Failed to load exam questions. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmitExam = async () => {
    if (submitting) return;

    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered questions. Are you sure you want to submit the exam?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      
      // Calculate time taken (convert remaining time to time taken)
      const timeTaken = (examInfo.duration_minutes * 60) - timeRemaining;
      
      // Convert answers to the format expected by backend
      const answersForSubmission = {};
      Object.entries(answers).forEach(([questionId, answerIndex]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        if (question) {
          // Map answer index to actual answer text (A, B, C, D)
          const answerText = ['A', 'B', 'C', 'D'][answerIndex];
          answersForSubmission[questionId] = answerText;
        }
      });

      console.log('Submitting exam with answers:', answersForSubmission);
      console.log('Time taken:', timeTaken);

      const response = await axios.post(`/api/exams/${examId}/submit`, {
        answers: answersForSubmission,
        time_taken: timeTaken
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Submit response:', response.data);
      
      if (response.data.success) {
        alert('Exam submitted successfully!');
        navigate('/results');
      } else {
        setError('Failed to submit exam. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      if (error.response?.status === 401) {
        setError('You are not authorized to submit this exam.');
      } else if (error.response?.status === 403) {
        setError('You have already submitted this exam.');
      } else {
        setError('Failed to submit exam. Please check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    // Handle invalid or NaN values
    if (!seconds || isNaN(seconds) || seconds < 0) {
      return '0:00';
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get question options - handle different data structures
  const getQuestionOptions = (question) => {
    if (question.options && Array.isArray(question.options)) {
      return question.options;
    }
    if (question.option_a && question.option_b && question.option_c && question.option_d) {
      return [question.option_a, question.option_b, question.option_c, question.option_d];
    }
    return ['No options available'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ukf-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ukf-700 mx-auto mb-4"></div>
          <p className="text-ukf-700 font-medium">Loading exam...</p>
        </div>
      </div>
    );
  }

  // Show start exam button if exam info is loaded but not started
  if (examInfo && !examStarted && questions.length === 0) {
    return (
      <div className="min-h-screen bg-ukf-50">
        <UKFHeader 
          title="Exam Ready"
          subtitle="Click Start to Begin"
          showUserMenu={true}
          showLanguageSwitcher={true}
        />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="ukf-card p-8 text-center">
            <BookOpen className="h-20 w-20 text-ukf-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-ukf-900 mb-4">
              {examInfo.title || 'Exam'}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
              <div className="text-center">
                <div className="text-2xl font-bold text-ukf-700 mb-2">
                  {examInfo.duration_minutes || 60}
                </div>
                <div className="text-sm text-ukf-500">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-ukf-700 mb-2">
                  {examInfo.questions_per_exam || 10}
                </div>
                <div className="text-sm text-ukf-500">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-ukf-700 mb-2">
                  {examInfo.total_marks || examInfo.questions_per_exam || 10}
                </div>
                <div className="text-sm text-ukf-500">Total Marks</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-ukf-50 p-4 rounded-lg">
                <h3 className="font-semibold text-ukf-800 mb-2">Important Instructions:</h3>
                <ul className="text-sm text-ukf-600 space-y-1 text-left">
                  <li>• You cannot pause or restart the exam once started</li>
                  <li>• The timer will continue even if you refresh the page</li>
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Answer all questions before time runs out</li>
                </ul>
              </div>
            </div>

            <button 
              onClick={startExam}
              className="ukf-button-primary text-lg px-8 py-4"
            >
              Start Exam Now
            </button>
          </div>
        </div>
        
        <UKFFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ukf-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">{t('exam.loadingError')}</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="ukf-button-primary w-full"
            >
              {t('exam.tryAgain')}
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="ukf-button-secondary w-full"
            >
              {t('exam.backToDashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!examInfo) {
    return (
      <div className="min-h-screen bg-ukf-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <BookOpen className="h-16 w-16 text-ukf-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ukf-600 mb-2">{t('exam.infoNotAvailable')}</h2>
          <p className="text-ukf-500 mb-6">{t('exam.infoNotAvailableDesc')}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="ukf-button-primary"
          >
            {t('exam.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-ukf-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <BookOpen className="h-16 w-16 text-ukf-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ukf-600 mb-2">{t('exam.noQuestionsAvailable')}</h2>
          <p className="text-ukf-500 mb-6">{t('exam.noQuestionsAvailableDesc')}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="ukf-button-primary"
          >
            {t('exam.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const questionOptions = getQuestionOptions(currentQuestion);
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-ukf-50">
      {/* UKF Header */}
      <UKFHeader 
        title="Exam in Progress"
        subtitle="Complete Your Assessment"
        showUserMenu={true}
        showLanguageSwitcher={true}
      />

      {/* Time Warning */}
      {timeRemaining <= 300 && timeRemaining > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 font-medium">
              Less than 5 minutes remaining!
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Exam Header */}
        <div className="ukf-card p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-ukf-900 mb-2">
                {examInfo.title || 'Exam'}
              </h1>
              <div className="flex items-center space-x-6 text-sm text-ukf-600">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-ukf-500" />
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-ukf-500" />
                  <span>{user?.name || 'Student'}</span>
                </div>
              </div>
            </div>
            
            {/* Timer */}
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-ukf-700">
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-sm text-ukf-500">Time Remaining</div>
              </div>
              <Timer className="h-8 w-8 text-ukf-600" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-ukf-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-ukf-200 rounded-full h-2">
              <div 
                className="bg-ukf-700 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="ukf-card p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-ukf-900 mb-4">
              Question {currentQuestionIndex + 1}:
            </h2>
            <p className="text-lg text-ukf-800 leading-relaxed">
              {currentQuestion.question_text || currentQuestion.text || 'Question text not available'}
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {questionOptions.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  answers[currentQuestion.id] === index
                    ? 'border-ukf-700 bg-ukf-50 text-ukf-900'
                    : 'border-ukf-200 hover:border-ukf-300 hover:bg-ukf-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={index}
                  checked={answers[currentQuestion.id] === index}
                  onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                  answers[currentQuestion.id] === index
                    ? 'border-ukf-700 bg-ukf-700'
                    : 'border-ukf-300'
                }`}>
                  {answers[currentQuestion.id] === index && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="text-ukf-800">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="ukf-card p-6">
          <h3 className="text-lg font-semibold text-ukf-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-ukf-600" />
            Question Navigation
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                  index === currentQuestionIndex
                    ? 'border-ukf-700 bg-ukf-700 text-white'
                    : answers[questions[index].id] !== undefined
                    ? 'border-ukf-accent-500 bg-ukf-accent-100 text-ukf-accent-700'
                    : 'border-ukf-200 bg-white text-ukf-600 hover:border-ukf-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="ukf-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-ukf-600">
                {Object.keys(answers).length} answered / {questions.length}
              </span>
              
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  className="ukf-button-primary"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Exam
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="ukf-button-primary"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* UKF Footer */}
      <UKFFooter />
    </div>
  );
};

export default Exam;

