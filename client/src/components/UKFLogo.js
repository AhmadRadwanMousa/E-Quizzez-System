import React from 'react';
import ukfLogo from '../assets/images/ukf-logo.png';

const UKFLogo = ({ className = "", showText = true, size = "default", logoColor = "default" }) => {
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "h-8 w-8";
      case "medium":
        return "h-12 w-12";
      case "large":
        return "h-16 w-16";
      case "xlarge":
        return "h-20 w-20";
      default:
        return "h-10 w-10";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return "text-sm";
      case "medium":
        return "text-lg";
      case "large":
        return "text-xl";
      case "xlarge":
        return "text-2xl";
      default:
        return "text-base";
    }
  };

  // Apply logo color styling
  const getLogoStyling = () => {
    if (logoColor === "white") {
      return "filter brightness-0 invert"; // Makes the logo white
    }
    return ""; // Default color
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* UKF Logo Image */}
      <div className={`${getSizeClasses()} flex-shrink-0`}>
        <img 
          src={ukfLogo}
          alt="University of KhorFakkan Logo"
          className={`w-full h-full object-contain ${getLogoStyling()}`}
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`text-ukf-700 font-bold ${getTextSize()} leading-tight`}>
            University of KhorFakkan
          </span>
          <span className="text-ukf-500 text-xs font-medium">
            E-Quizzez Platform
          </span>
        </div>
      )}
    </div>
  );
};

export default UKFLogo;
