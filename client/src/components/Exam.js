import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Clock, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultDialog, setResultDialog] = useState(null);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes default
  const [examInfo, setExamInfo] = useState(null);

  useEffect(() => {
    fetchQuestions();
    fetchExamInfo();
  }, [examId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      handleSubmitExam();
    }
  }, [timeLeft]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/exams/${examId}/questions`);
      setQuestions(response.data.data);
      
      // Initialize answers object
      const initialAnswers = {};
      response.data.data.forEach(q => {
        initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load exam questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamInfo = async () => {
    try {
      const response = await axios.get('/api/exams');
      const exam = response.data.data.find(e => e.id == examId);
      if (exam) {
        setExamInfo(exam);
        setTimeLeft(exam.duration_minutes * 60);
      }
    } catch (error) {
      console.error('Error fetching exam info:', error);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const handleSubmitExam = async () => {
    if (submitting) return;

    const unansweredCount = Object.values(answers).filter(answer => answer === '').length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        question_id: parseInt(questionId),
        selected_answer: selectedAnswer
      }));

      const timeTaken = (examInfo?.duration_minutes * 60) - timeLeft;
      
      const response = await axios.post(`/api/exams/${examId}/submit`, {
        answers: answersArray,
        time_taken: timeTaken
      });
      const data = response.data.data;
      setResultDialog({
        score: data.score,
        totalQuestions: data.totalQuestions,
        totalMarks: data.totalMarks || data.totalQuestions,
        percentage: data.percentage
      });
    } catch (error) {
      console.error('Error submitting exam:', error);
      setError('Failed to submit exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
        <p className="text-gray-600">This exam has no questions available.</p>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQ.id] !== '';
  const progress = (Object.values(answers).filter(answer => answer !== '').length / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {examInfo?.title || 'Exam'}
            </h1>
            <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
          
          {/* Timer */}
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-lg ${
            timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            <Clock className="h-5 w-5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          {Math.round(progress)}% complete ({Object.values(answers).filter(answer => answer !== '').length}/{questions.length} answered)
        </div>
      </div>

      {/* Question Navigation */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Navigation</h3>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => goToQuestion(index)}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                index === currentQuestion
                  ? 'bg-primary-600 text-white'
                  : answers[questions[index].id]
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Current Question */}
      <div className="card">
        <div className="mb-6">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mb-3">
            Question {currentQuestion + 1}
          </span>
          <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
            {currentQ.question_text}
          </h3>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {['A', 'B', 'C', 'D'].map((option) => {
            const optionText = currentQ[`option_${option.toLowerCase()}`];
            const isSelected = answers[currentQ.id] === option;
            
            return (
              <label
                key={option}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question_${currentQ.id}`}
                  value={option}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(currentQ.id, option)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  isSelected ? 'border-primary-500' : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                  )}
                </div>
                <span className="font-medium text-gray-900">
                  {option}. {optionText}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-3">
          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={nextQuestion}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitExam}
              disabled={submitting}
              className="btn-success flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Exam'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Time Warning */}
      {timeLeft < 300 && timeLeft > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>Less than 5 minutes remaining! Please submit your exam soon.</span>
        </div>
      )}

      {resultDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-success-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Exam Submitted!</h3>
            <p className="text-center text-gray-600 mb-6">Well done. Here is your performance.</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Score</p>
                <p className="text-xl font-semibold text-gray-900">{resultDialog.score}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Marks</p>
                <p className="text-xl font-semibold text-gray-900">{resultDialog.totalMarks}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Percentage</p>
                <p className="text-xl font-semibold text-gray-900">{resultDialog.percentage}%</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => navigate('/results')}
                className="btn-primary"
              >
                View Results
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam;

