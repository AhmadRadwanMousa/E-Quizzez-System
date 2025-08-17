import React, { useState } from 'react';
import { Menu, X, LogOut, User, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { useNavigate } from 'react-router-dom';
import UKFLogo from './UKFLogo';
import LanguageSwitcher from './LanguageSwitcher';

const UKFHeader = ({ 
  title = "E-Quizzez Platform", 
  subtitle = "University of KhorFakkan", 
  showUserMenu = false,
  showLanguageSwitcher = true,
  showBackButton = false,
  backTo = null,
  backLabel = "Back to Dashboard"
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, adminUser, logout } = useAuth();
  const { t } = useLocalization();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      // Default back navigation based on user role
      if (user?.role === 'admin' || user?.is_admin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  // Determine user role and display name
  const getUserDisplayInfo = () => {
    // Check for admin user first
    if (adminUser) {
      return { 
        role: 'Admin', 
        name: adminUser.name || adminUser.username || adminUser.email || 'Admin'
      };
    }
    
    // Check for regular user
    if (user) {
      // Check if user has role property
      if (user.role) {
        return { 
          role: user.role === 'admin' ? 'Admin' : 'Student',
          name: user.name || user.username || 'User'
        };
      }
      
      // Check if user has admin properties to determine role
      if (user.is_admin || user.admin) {
        return { role: 'Admin', name: user.name || user.username || 'Admin' };
      }
      
      // Default to student
      return { role: 'Student', name: user.name || user.username || 'Student' };
    }
    
    // No user logged in
    return { role: 'User', name: 'Guest' };
  };

  const { role, name } = getUserDisplayInfo();

  return (
    <header className="bg-ukf-700 shadow-ukf-lg">
      <div className="container-ukf">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Title Section */}
          <div className="flex items-center space-x-6">
            {/* Back Button */}
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 px-3 py-2 text-ukf-200 hover:text-white hover:bg-ukf-600 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">{backLabel}</span>
              </button>
            )}
            
            {/* UKF Logo - White version */}
            <div className="flex-shrink-0">
              <UKFLogo 
                className="text-white" 
                showText={false} 
                size="medium"
                logoColor="white"
              />
            </div>
            
            {/* Page Title and Subtitle */}
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-white leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-ukf-200 text-sm font-medium">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Side - Language Switcher, User Menu, and Logout */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            {showLanguageSwitcher && (
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
            )}

            {/* User Menu */}
            {showUserMenu && (
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-white hover:text-ukf-200 transition-colors cursor-pointer">
                  <div className="h-8 w-8 bg-ukf-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{name}</span>
                    <span className="text-xs text-ukf-200">{role}</span>
                  </div>
                </div>
                
                <button className="p-2 text-ukf-200 hover:text-white hover:bg-ukf-600 rounded-lg transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Logout Button - Only show when user is logged in */}
            {(user || adminUser) && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-ukf-600 hover:bg-ukf-500 text-white rounded-lg transition-colors font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-ukf-200 hover:bg-ukf-600 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-ukf-600">
            <div className="flex flex-col space-y-4">
              {/* Mobile Back Button */}
              {showBackButton && (
                <div className="flex justify-center">
                  <button
                    onClick={handleBack}
                    className="flex items-center space-x-2 px-4 py-2 text-ukf-200 hover:text-white hover:bg-ukf-600 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-sm font-medium">{backLabel}</span>
                  </button>
                </div>
              )}
              
              {/* Mobile Page Title */}
              <div className="text-center">
                <h1 className="text-xl font-bold text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-ukf-200 text-sm font-medium mt-1">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Mobile User Menu */}
              {showUserMenu && (
                <div className="flex items-center justify-center space-x-4 py-3 border-t border-ukf-600">
                  <div className="flex items-center space-x-2 text-white">
                    <div className="h-8 w-8 bg-ukf-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{name}</span>
                      <span className="text-xs text-ukf-200">{role}</span>
                    </div>
                  </div>
                  
                  <button className="p-2 text-ukf-200 hover:text-white hover:bg-ukf-600 rounded-lg transition-colors">
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Mobile Language Switcher */}
              {showLanguageSwitcher && (
                <div className="flex justify-center py-3 border-t border-ukf-600">
                  <LanguageSwitcher />
                </div>
              )}

              {/* Mobile Logout Button - Only show when user is logged in */}
              {(user || adminUser) && (
                <div className="flex justify-center py-3 border-t border-ukf-600">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-ukf-600 hover:bg-ukf-500 text-white rounded-lg transition-colors font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default UKFHeader;

