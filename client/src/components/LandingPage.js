import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Shield, BookOpen, Users, BarChart3, Award } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">E-Quizzez</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
              >
                Student Login
              </Link>
              <Link
                to="/admin/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to{' '}
            <span className="text-indigo-600">E-Quizzez</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            The modern online examination system for universities and educational institutions. 
            Create, manage, and take exams with ease.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Start Exam
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Shield className="h-5 w-5 mr-2" />
              Admin Panel
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="text-center">
            <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Features
            </h3>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Everything you need for modern online examinations
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Question Bank */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                <BookOpen className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900 text-center">Question Bank</h4>
              <p className="mt-2 text-base text-gray-500 text-center">
                Create a comprehensive question bank with multiple subjects and difficulty levels.
              </p>
            </div>

            {/* Dynamic Exams */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mx-auto">
                <Award className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900 text-center">Dynamic Exams</h4>
              <p className="mt-2 text-base text-gray-500 text-center">
                Generate exams with random questions from your question bank.
              </p>
            </div>

            {/* Student Management */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900 text-center">Student Management</h4>
              <p className="mt-2 text-base text-gray-500 text-center">
                Manage student registrations and track their progress.
              </p>
            </div>

            {/* Results & Analytics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mx-auto">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900 text-center">Results & Analytics</h4>
              <p className="mt-2 text-base text-gray-500 text-center">
                Get detailed results and performance analytics for all students.
              </p>
            </div>

            {/* Secure Authentication */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white mx-auto">
                <Shield className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900 text-center">Secure Authentication</h4>
              <p className="mt-2 text-base text-gray-500 text-center">
                JWT-based authentication with role-based access control.
              </p>
            </div>

            {/* Real-time Updates */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white mx-auto">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900 text-center">Real-time Updates</h4>
              <p className="mt-2 text-base text-gray-500 text-center">
                Instant updates and notifications for exam status and results.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Ready to get started?
          </h3>
          <p className="mt-4 text-xl text-gray-500">
            Choose your role and begin your journey with E-Quizzez
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Student Login
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center px-8 py-4 border border-indigo-600 text-lg font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 mt-24">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center space-x-3 mb-4">
              <GraduationCap className="h-8 w-8 text-indigo-400" />
              <h3 className="text-2xl font-bold text-white">E-Quizzez</h3>
            </div>
            <p className="text-gray-400">
              Modern online examination system for educational institutions
            </p>
            <p className="text-gray-500 mt-2 text-sm">
              © 2024 E-Quizzez. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
