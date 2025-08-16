# 🚀 Quick Start Guide - E-Quizzez

Get your MCQ exam system running in 5 minutes!

## ⚡ Super Quick Setup

### 1. Install Dependencies
```bash
npm install
cd client
npm install
cd ..
```

### 2. Build Frontend
```bash
cd client
npm run build
cd ..
```

### 3. Start the Application
```bash
npm start
```

### 4. Access the Application
- **Local**: http://localhost:5000
- **Network**: http://YOUR_IP_ADDRESS:5000

## 👥 Login Credentials

| Student ID | Password | Name |
|------------|----------|------|
| 2021001    | password123 | Ahmed Ali |
| 2021002    | password123 | Fatima Hassan |
| 2021003    | password123 | Omar Khalil |

## 🌐 Network Access Setup

### Find Your IP Address
- **Windows**: Run `ipconfig` in Command Prompt
- **Mac/Linux**: Run `ifconfig` in Terminal

### Allow Firewall Access
- **Windows**: Allow Node.js through Windows Defender Firewall
- **Mac**: Add Node.js to Firewall exceptions

### Students Access Via
```
http://YOUR_IP_ADDRESS:5000
```

## 📱 What Students Can Do

1. **Login** with their student ID and password
2. **View available exams** on the dashboard
3. **Take exams** with multiple choice questions
4. **Navigate between questions** easily
5. **Submit exams** and see results immediately
6. **View performance history** and statistics

## 🎯 Features Included

- ✅ Student authentication system
- ✅ Multiple choice question support
- ✅ Real-time exam timer
- ✅ Progress tracking
- ✅ Automatic scoring
- ✅ Result storage and analytics
- ✅ Responsive design for all devices
- ✅ Network hosting capability

## 🔧 Customization

### Add More Questions
Edit `server.js` in the `insertSampleData()` function

### Add More Students
Edit `server.js` in the `insertSampleData()` function

### Change Port
Create `.env` file with: `PORT=8080`

## 🚨 Troubleshooting

### Port Already in Use
- Change port in `.env` file
- Or kill process: `lsof -ti:5000 | xargs kill -9`

### Can't Access from Network
- Check firewall settings
- Ensure server binds to `0.0.0.0`
- Verify IP address hasn't changed

### Database Issues
- Delete `database.sqlite` and restart
- Check file permissions

## 📞 Need Help?

1. Check the full README.md
2. Review NETWORK_SETUP.md
3. Check console output for errors
4. Verify all dependencies are installed

---

**You're all set! 🎓 Start quizzing your students!**

