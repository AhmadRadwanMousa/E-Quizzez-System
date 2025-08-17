import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import UKFHeader from './UKFHeader';
import UKFFooter from './UKFFooter';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const { t } = useLocalization();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginAdmin(formData.email, formData.password);
      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ukf-50 via-white to-ukf-accent-50">
      {/* UKF Header */}
      <UKFHeader 
        title="Admin Login"
        subtitle="Access Administrative Dashboard"
        showUserMenu={false}
        showLanguageSwitcher={true}
      />

      {/* Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-ukf-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-ukf-900">
              {t('adminLogin.title')}
            </h2>
            <p className="mt-2 text-sm text-ukf-700">
              {t('adminLogin.subtitle')}
            </p>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ukf-700 mb-2">
                {t('adminLogin.emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-ukf-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="ukf-input pl-10"
                  placeholder={t('adminLogin.demoEmail')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ukf-700 mb-2">
                {t('adminLogin.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-ukf-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="ukf-input pr-10"
                  placeholder="••••••••"
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

            {/* Demo Credentials */}
            <div className="bg-ukf-accent-50 border border-ukf-accent-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-ukf-accent-800 mb-2">
                {t('adminLogin.demoCredentials')}:
              </h4>
              <p className="text-sm text-ukf-accent-700">
                <strong>{t('auth.email')}:</strong> {t('adminLogin.demoEmail')}<br />
                <strong>{t('auth.password')}:</strong> {t('adminLogin.demoPassword')}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="ukf-button-primary w-full flex justify-center items-center py-3 text-base font-medium"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                t('adminLogin.signInAsAdmin')
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-ukf-600 hover:text-ukf-500 font-medium"
            >
              {t('adminLogin.backToStudentLogin')}
            </button>
          </div>
        </div>
      </div>

      {/* UKF Footer */}
      <UKFFooter />
    </div>
  );
};

export default AdminLogin;
