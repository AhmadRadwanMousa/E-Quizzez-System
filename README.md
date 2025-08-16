# E-Quizzez 🎓

A modern, full-stack online quiz application built with Node.js, Express, React, and SQLite. Perfect for educational institutions, training centers, or anyone who wants to create and manage online exams.

## ✨ Features

### 🎯 **Question Bank System**
- **Dynamic Question Pool**: Create a bank of questions per subject
- **Randomized Selection**: Exams automatically select random questions from the pool
- **Configurable Count**: Set how many questions each exam should contain
- **Subject Organization**: Organize questions by subject and difficulty level

### 📝 **Exam Management**
- **Flexible Scheduling**: Set start and end times for exams
- **Time Limits**: Configurable duration for each exam
- **Question Count Control**: Define how many questions students see per exam
- **Active/Inactive Status**: Control exam availability

### 👥 **User Management**
- **Student Accounts**: Secure student registration and authentication
- **Admin Panel**: Comprehensive admin dashboard for managing the platform
- **Role-Based Access**: Separate interfaces for students and administrators

### 📊 **Results & Analytics**
- **Performance Tracking**: Monitor student performance across exams
- **Score Analysis**: Detailed breakdown of correct/incorrect answers
- **Time Tracking**: Monitor how long students take on exams
- **Progress Insights**: Visual performance indicators and tips

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Beautiful Interface**: Modern design with gradients and smooth animations
- **Intuitive Navigation**: Easy-to-use interface for both students and admins
- **Real-time Updates**: Instant feedback and live status updates

## 🚀 Tech Stack

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite** - Lightweight database
- **JWT** - JSON Web Token authentication
- **Bcrypt.js** - Password hashing
- **Express Rate Limit** - API rate limiting

### **Frontend**
- **React.js** - User interface library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

## 📁 Project Structure

```
E-Quizzez/
├── server.js                 # Main server file
├── package.json             # Server dependencies
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── package.json        # Client dependencies
│   └── tailwind.config.js  # Tailwind configuration
├── .gitignore              # Git ignore file
└── README.md               # This file
```

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js (v14 or higher)
- npm or yarn

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/e-quizzez.git
cd e-quizzez
```

### **2. Install Dependencies**
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### **3. Environment Setup**
Create a `.env` file in the root directory:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### **4. Start the Application**
```bash
# Start the server (from root directory)
npm start

# Start the client (in a new terminal, from client directory)
cd client
npm start
```

The application will be available at:
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000

## 🔐 Default Admin Account

After first run, a default admin account is created:
- **Email**: admin@equizzez.com
- **Password**: admin123

**⚠️ Important**: Change these credentials after first login!

## 📚 Usage Guide

### **For Administrators**

1. **Login** with admin credentials
2. **Create Questions**:
   - Go to Questions Management
   - Add questions with multiple choice answers
   - Organize by subject and difficulty
3. **Create Exams**:
   - Go to Exams Management
   - Set exam details (title, subject, duration)
   - Configure question count and scheduling
4. **Monitor Results**:
   - View student performance
   - Analyze exam statistics
   - Track individual progress

### **For Students**

1. **Login** with student credentials
2. **View Available Exams**:
   - See all active exams
   - Check exam details and duration
3. **Take Exams**:
   - Answer questions within time limit
   - Submit when finished
4. **View Results**:
   - Check performance scores
   - Review correct answers
   - Track progress over time

## 🔧 Configuration

### **Database**
The application uses SQLite by default. The database file is created automatically on first run.

### **Question Bank Settings**
- **Questions per Exam**: Set how many questions students see
- **Randomization**: Questions are automatically randomized for each student
- **Subject Filtering**: Questions are filtered by subject automatically

### **Exam Scheduling**
- **Start Time**: When the exam becomes available
- **End Time**: When the exam expires
- **Duration**: How long students have to complete the exam

## 🚀 Deployment

### **Heroku**
```bash
# Add buildpacks
heroku buildpacks:add --index 1 heroku/nodejs
heroku buildpacks:add --index 2 heroku/nodejs

# Deploy
git push heroku main
```

### **Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### **Railway**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** team for the amazing frontend framework
- **Express.js** team for the robust backend framework
- **Tailwind CSS** team for the utility-first CSS framework
- **Lucide** team for the beautiful icons

## 📞 Support

If you have any questions or need help:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Made with ❤️ for better education and learning experiences**

