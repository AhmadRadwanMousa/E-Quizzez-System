# 🎓 E-Quizzez Platform - University of KhorFakkan

A comprehensive online examination platform built with React.js, Node.js, and SQLite, featuring role-based access control, multilingual support (English/Arabic), and a modern UKF-themed design.

## 🚀 Quick Start Guide

### Prerequisites
Before you begin, ensure you have the following installed on your system:
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **A modern web browser** (Chrome, Firefox, Safari, Edge)

### Step 1: Clone the Repository
```bash
# Clone the repository to your local machine
git clone https://github.com/yourusername/E-Quizzez.git

# Navigate to the project directory
cd E-Quizzez
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 3: Environment Setup
```bash
# Copy the environment example file
cp env.example .env

# Edit the .env file with your configuration
# You can use any text editor or IDE
```

**Important Environment Variables:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_PATH=./database.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Admin Default Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@ukf.ac.ae
```

### Step 4: Start the Application

#### Option A: Using the Provided Scripts (Recommended)
```bash
# For Windows users
start.bat

# For Linux/Mac users
chmod +x start.sh
./start.sh
```

#### Option B: Manual Start
```bash
# Terminal 1: Start the backend server
npm start

# Terminal 2: Start the frontend development server
cd client
npm start
```

### Step 5: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:3000/admin/login

## 🔐 Default Login Credentials

### Admin Access
- **Username**: `admin`
- **Password**: `admin123`
- **URL**: http://localhost:3000/admin/login

### Student Access
- **Student ID**: `STU001`
- **Password**: `student123`
- **URL**: http://localhost:3000/login

## 📱 Application Features

### 🎯 Student Features
- **Dashboard**: View available exams, progress, and results
- **Exam Taking**: Interactive exam interface with timer
- **Results**: View detailed exam results and performance analytics
- **Profile**: Manage personal information and preferences

### 🛠️ Admin Features
- **Dashboard**: System overview and statistics
- **Student Management**: Add, edit, delete, and import/export students
- **Subject Management**: Create and manage academic subjects
- **Question Bank**: Comprehensive question management system
- **Exam Creation**: Design and configure examinations
- **Results Analysis**: Detailed performance analytics and reporting

### 🌐 System Features
- **Multilingual Support**: English and Arabic with RTL support
- **Responsive Design**: Works on desktop, tablet, and mobile
- **UKF Branding**: Official University of KhorFakkan theme
- **Real-time Updates**: Live exam progress and notifications

## 🗄️ Database Structure

The application uses SQLite with the following main tables:
- **users**: Student and admin accounts
- **subjects**: Academic subjects/courses
- **questions**: Question bank with multiple choice options
- **exams**: Exam configurations and settings
- **results**: Student exam results and performance data

## 🔧 Development Setup

### Backend Development
```bash
# Navigate to root directory
cd E-Quizzez

# Install development dependencies
npm install --save-dev nodemon

# Run in development mode with auto-restart
npm run dev
```

### Frontend Development
```bash
# Navigate to client directory
cd client

# Start development server with hot reload
npm start

# Build for production
npm run build
```

### Database Management
```bash
# View database (requires SQLite CLI)
sqlite3 database.sqlite

# Common SQLite commands
.tables          # List all tables
.schema users    # View table structure
SELECT * FROM users;  # Query data
.quit           # Exit SQLite
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

#### 2. Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. Database Connection Issues
```bash
# Check if database file exists
ls -la database.sqlite

# Remove and recreate database
rm database.sqlite
npm start
```

#### 4. Frontend Build Issues
```bash
# Clear build cache
cd client
rm -rf build
npm run build
```

### Error Logs
- **Backend logs**: Check terminal where `npm start` is running
- **Frontend logs**: Check browser console (F12 → Console)
- **Database logs**: Check terminal for SQLite errors

## 📁 Project Structure

```
E-Quizzez/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── locales/       # Localization files
│   │   └── index.js       # Entry point
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind CSS configuration
├── server.js              # Backend server (Node.js/Express)
├── package.json           # Backend dependencies
├── .env                   # Environment variables
├── database.sqlite        # SQLite database
├── start.bat             # Windows startup script
├── start.sh              # Linux/Mac startup script
└── README.md             # This file
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Separate admin and student interfaces
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin requests

## 🌍 Localization

The application supports multiple languages:
- **English**: Default language
- **Arabic**: Full RTL support with Arabic translations

### Adding New Languages
1. Create new locale file in `client/src/locales/`
2. Add language switcher option
3. Implement RTL support if needed

## 📊 Performance Optimization

- **Lazy Loading**: Components load on demand
- **Image Optimization**: Compressed and optimized images
- **Code Splitting**: Automatic bundle optimization
- **Caching**: Browser and API response caching

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ..
NODE_ENV=production npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-production-secret-key
DB_PATH=/path/to/production/database.sqlite
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@ukf.ac.ae
- **Documentation**: [UKF E-Quizzez Wiki](https://github.com/yourusername/E-Quizzez/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/E-Quizzez/issues)

## 🎉 Getting Started Checklist

- [ ] ✅ Clone the repository
- [ ] ✅ Install Node.js dependencies
- [ ] ✅ Configure environment variables
- [ ] ✅ Start the backend server
- [ ] ✅ Start the frontend application
- [ ] ✅ Access the application in browser
- [ ] ✅ Login with admin credentials
- [ ] ✅ Create your first subject
- [ ] ✅ Add some questions
- [ ] ✅ Create an exam
- [ ] ✅ Test student login and exam taking

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks
- **Database Backup**: Regular backup of `database.sqlite`
- **Log Rotation**: Monitor and rotate log files
- **Security Updates**: Keep dependencies updated
- **Performance Monitoring**: Monitor response times and resource usage

### Backup Strategy
```bash
# Create database backup
cp database.sqlite database_backup_$(date +%Y%m%d_%H%M%S).sqlite

# Restore from backup
cp database_backup_YYYYMMDD_HHMMSS.sqlite database.sqlite
```

---

**Happy Learning with E-Quizzez! 🎓✨**

*Built with ❤️ for the University of KhorFakkan*

