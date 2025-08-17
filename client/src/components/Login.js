import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { BookOpen, User, Lock, Eye, EyeOff } from 'lucide-react';
import UKFHeader from './UKFHeader';
import UKFFooter from './UKFFooter';

const Login = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useLocalization();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentId || !formData.password) {
      setError(t('login.pleaseFillAllFields'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(formData.studentId, formData.password);
      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      setError(t('login.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ukf-50 via-white to-ukf-accent-50">
      {/* UKF Header */}
      <UKFHeader 
        title="Student Login"
        subtitle="Access Your E-Quizzez Account"
        showUserMenu={false}
        showLanguageSwitcher={true}
      />

      {/* Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-ukf-600 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-ukf-900">
              {t('login.welcomeToEQuizzez')}
            </h2>
            <p className="mt-2 text-sm text-ukf-700">
              {t('login.universityMCQExamSystem')}
            </p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Student ID Field */}
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-ukf-700 mb-2">
                {t('login.studentId')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-ukf-400" />
                </div>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  required
                  className="ukf-input pl-10"
                  placeholder={t('login.enterYourStudentId')}
                  value={formData.studentId}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ukf-700 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-ukf-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="ukf-input pl-10 pr-10"
                  placeholder={t('login.enterYourPassword')}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-ukf-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-ukf-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="ukf-button-primary w-full flex justify-center items-center py-3 text-base font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('login.signingIn')}
                </>
              ) : (
                t('login.signIn')
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-ukf-50 rounded-lg border border-ukf-200">
            <h4 className="text-sm font-medium text-ukf-800 mb-2">
              {t('login.demoCredentials')}:
            </h4>
            <div className="space-y-1 text-xs text-ukf-600">
              <p><strong>{t('login.studentId')}:</strong> 2021001</p>
              <p><strong>{t('login.password')}:</strong> password123</p>
            </div>
            <p className="text-xs text-ukf-500 mt-2">
              {t('login.tryOtherIds')}
            </p>
          </div>

          {/* Admin Login Link */}
          <div className="text-center">
            <button
              onClick={() => navigate('/admin/login')}
              className="text-sm text-ukf-600 hover:text-ukf-500 font-medium"
            >
              {t('login.adminLogin')} →
            </button>
          </div>
        </div>
      </div>

      {/* UKF Footer */}
      <UKFFooter />
    </div>
  );
};

export default Login;
