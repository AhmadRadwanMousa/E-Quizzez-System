import React from 'react';
import { useLocalization } from '../contexts/LocalizationContext';
import { GraduationCap, Shield, Globe, Mail, Phone, MapPin, ArrowUp, ExternalLink } from 'lucide-react';
import UKFLogo from './UKFLogo';

const UKFFooter = ({ className = "" }) => {
  const { t } = useLocalization();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`bg-ukf-900 text-white mt-24 relative ${className}`}>
      {/* Top Border with Solid Color */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-ukf-700"></div>
      
      <div className="container-ukf py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* UKF Info */}
          <div className="col-span-1 lg:col-span-2">
            <UKFLogo size="large" className="mb-6" />
            <p className="text-ukf-200 text-sm leading-relaxed mb-6 max-w-lg">
              The University of KhorFakkan (UKF) is dedicated to fostering innovation, research, and academic excellence. 
              Our comprehensive programs, expert faculty, and state-of-the-art facilities provide an ideal environment for learning and personal growth.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center text-ukf-300 text-sm bg-ukf-800 px-3 py-2 rounded-lg">
                <GraduationCap className="h-4 w-4 mr-2 text-ukf-gold-400" />
                <span>12 Bachelor Programs</span>
              </div>
              <div className="flex items-center text-ukf-300 text-sm bg-ukf-800 px-3 py-2 rounded-lg">
                <Shield className="h-4 w-4 mr-2 text-ukf-gold-400" />
                <span>5 Colleges</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href="https://ukf.ac.ae" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-ukf-300 hover:text-ukf-gold-400 transition-colors duration-200 p-2 hover:bg-ukf-800 rounded-lg"
                aria-label="Visit UKF website"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a 
                href="mailto:info@ukf.ac.ae"
                className="text-ukf-300 hover:text-ukf-gold-400 transition-colors duration-200 p-2 hover:bg-ukf-800 rounded-lg"
                aria-label="Send email to UKF"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-ukf-gold-400 flex items-center">
              <span>Quick Links</span>
              <ExternalLink className="h-4 w-4 ml-2" />
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Admissions', href: '#' },
                { name: 'Academic Calendar', href: '#' },
                { name: 'Student Services', href: '#' },
                { name: 'Library', href: '#' },
                { name: 'Contact Us', href: '#' }
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-ukf-200 hover:text-white transition-colors duration-200 flex items-center group"
                  >
                    <span className="group-hover:text-ukf-gold-400 transition-colors duration-200">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-ukf-gold-400">Contact Info</h4>
            <div className="space-y-4">
              {[
                { icon: MapPin, text: 'KhorFakkan, UAE', href: null },
                { icon: Phone, text: '+971 9 123 4567', href: 'tel:+97191234567' },
                { icon: Mail, text: 'info@ukf.ac.ae', href: 'mailto:info@ukf.ac.ae' },
                { icon: Globe, text: 'www.ukf.ac.ae', href: 'https://ukf.ac.ae' }
              ].map((item) => (
                <div key={item.text} className="flex items-start group">
                  <item.icon className="h-4 w-4 mr-3 mt-0.5 text-ukf-gold-400 flex-shrink-0" />
                  {item.href ? (
                    <a 
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-ukf-200 hover:text-white transition-colors duration-200 group-hover:text-ukf-gold-400"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-ukf-200">{item.text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-ukf-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-ukf-300 text-sm text-center md:text-left">
              © 2025 University of KhorFakkan. All rights reserved.
            </p>
            
            {/* Back to Top Button */}
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-ukf-300 hover:text-white hover:bg-ukf-800 rounded-lg transition-all duration-200 group"
              aria-label="Back to top"
            >
              <ArrowUp className="h-4 w-4 group-hover:-translate-y-1 transition-transform duration-200" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UKFFooter;

