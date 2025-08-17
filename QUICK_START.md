# 🚀 Quick Start Guide - E-Quizzez Platform

## ⚡ Get Running in 5 Minutes

### Prerequisites Check
- ✅ Node.js installed (version 16+)
- ✅ Git installed
- ✅ Modern web browser

### 🎯 One-Click Start (Windows)
```bash
# Just double-click this file:
start.bat
```

### 🎯 One-Click Start (Linux/Mac)
```bash
# Make executable and run:
chmod +x start.sh
./start.sh
```

### 🔑 Default Login
- **Admin**: `admin` / `admin123`
- **Student**: `STU001` / `student123`

### 🌐 Access URLs
- **Main App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login
- **API**: http://localhost:5000

---

## 🛠️ Manual Setup (If scripts don't work)

### Step 1: Install Dependencies
```bash
npm install
cd client && npm install && cd ..
```

### Step 2: Start Servers
```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
cd client && npm start
```

---

## 🚨 Common Issues

### Port Already in Use
```bash
# Windows
taskkill /f /im node.exe

# Linux/Mac
pkill -f node
```

### Dependencies Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 What's Next?

1. **Login as Admin** → Create subjects and questions
2. **Create Exams** → Set duration and question count
3. **Add Students** → Import or create student accounts
4. **Test System** → Login as student and take exams

---

## 🆘 Need Help?

- Check the main [README.md](README.md) for detailed instructions
- Look at the troubleshooting section
- Check browser console (F12) for errors
- Verify both servers are running (ports 3000 and 5000)

---

**🎉 You're all set! The E-Quizzez platform is ready to use!**

