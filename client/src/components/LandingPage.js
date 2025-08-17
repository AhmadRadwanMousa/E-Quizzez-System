import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../contexts/LocalizationContext';
import { BookOpen, Users, Award, ArrowRight } from 'lucide-react';
import UKFHeader from './UKFHeader';
import UKFFooter from './UKFFooter';

const LandingPage = () => {
  const { t, currentLanguage, changeLanguage } = useLocalization();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ukf-50 via-white to-ukf-accent-50">
      {/* UKF Header */}
      <UKFHeader 
        title="E-Quizzez Platform"
        subtitle="University of KhorFakkan"
        showUserMenu={false}
        showLanguageSwitcher={true}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-ukf-900 mb-6">
            {t('dashboard.welcome')}
          </h2>
          <p className="text-xl text-ukf-700 max-w-3xl mx-auto">
            {t('dashboard.welcome')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="h-16 w-16 bg-ukf-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-ukf-600" />
            </div>
            <h3 className="text-xl font-semibold text-ukf-900 mb-2">{t('navigation.exams')}</h3>
            <p className="text-ukf-700">{t('exams.title')}</p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 bg-ukf-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-ukf-accent-600" />
            </div>
            <h3 className="text-xl font-semibold text-ukf-900 mb-2">{t('navigation.students')}</h3>
            <p className="text-ukf-700">{t('students.title')}</p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 bg-ukf-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-ukf-gold-600" />
            </div>
            <h3 className="text-xl font-semibold text-ukf-900 mb-2">{t('navigation.results')}</h3>
            <p className="text-ukf-700">{t('results.title')}</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-ukf-gradient hover:from-ukf-700 hover:to-ukf-accent-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {t('auth.signIn')}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>

      {/* UKF Footer */}
      <UKFFooter />
    </div>
  );
};

export default LandingPage;
