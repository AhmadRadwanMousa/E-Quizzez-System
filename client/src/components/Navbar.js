import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { BookOpen, User, LogOut, BarChart3 } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import UKFLogo from './UKFLogo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLocalization();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-lg border-b border-ukf-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <UKFLogo size="small" className="mr-6" />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/')
                  ? 'bg-ukf-100 text-ukf-700'
                  : 'text-ukf-600 hover:text-ukf-700 hover:bg-ukf-50'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>{t('navigation.dashboard')}</span>
            </Link>

            <Link
              to="/results"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/results')
                  ? 'bg-ukf-100 text-ukf-700'
                  : 'text-ukf-600 hover:text-ukf-700 hover:bg-ukf-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>{t('navigation.results')}</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <div className="hidden md:flex items-center space-x-2 text-sm text-ukf-700">
              <User className="h-4 w-4" />
              <span className="font-medium">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-ukf-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">{t('auth.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

