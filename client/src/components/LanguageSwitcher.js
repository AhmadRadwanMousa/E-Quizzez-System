import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLocalization();

  const handleLanguageChange = () => {
    const newLanguage = currentLanguage === 'en' ? 'ar' : 'en';
    changeLanguage(newLanguage);
  };

  return (
    <button
      onClick={handleLanguageChange}
      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white hover:text-ukf-100 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-white focus:ring-opacity-50 group"
      title={currentLanguage === 'en' ? 'Switch to Arabic' : 'Switch to English'}
      aria-label={`Switch to ${currentLanguage === 'en' ? 'Arabic' : 'English'}`}
    >
      <Globe className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
      <span className="font-medium">
        {currentLanguage === 'en' ? 'العربية' : 'English'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
