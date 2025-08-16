# Network Setup Guide for E-Quizzez

This guide will help you set up E-Quizzez so that multiple students can access it from the same network.

## 🌐 Step 1: Find Your Computer's IP Address

### Windows
1. Open Command Prompt (cmd)
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
4. It will look like: `192.168.1.100` or `10.0.0.50`

### Mac
1. Open Terminal
2. Type: `ifconfig`
3. Look for "inet" followed by your local IP address

### Linux
1. Open Terminal
2. Type: `ip addr show` or `ifconfig`
3. Look for your local IP address

## 🔧 Step 2: Configure Firewall

### Windows Firewall
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change settings"
4. Click "Allow another app"
5. Browse to your Node.js installation or add the port manually
6. Allow both Private and Public networks

### Mac Firewall
1. Go to System Preferences > Security & Privacy > Firewall
2. Click the lock icon to make changes
3. Click "Firewall Options"
4. Add Node.js to the list of allowed applications

### Linux Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 5000

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
```

## 🚀 Step 3: Start the Application

1. **Install dependencies** (if not done already):
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```

2. **Build the frontend**:
   ```bash
   cd client
   npm run build
   cd ..
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Verify it's working**:
   - Local access: http://localhost:5000
   - Network access: http://YOUR_IP_ADDRESS:5000

## 📱 Step 4: Students Access the Application

Students on the same network can now access the application by:

1. **Opening their web browser**
2. **Typing the URL**: `http://YOUR_IP_ADDRESS:5000`
3. **Logging in** with their credentials

### Example URLs:
- `http://192.168.1.100:5000`
- `http://10.0.0.50:5000`

## 🔍 Troubleshooting Network Issues

### Problem: Students can't access the application
**Solution**: Check if the server is binding to all network interfaces
- Ensure `server.js` has: `app.listen(PORT, '0.0.0.0', ...)`
- This allows connections from any IP address

### Problem: Firewall blocking connections
**Solution**: Verify firewall settings
- Check Windows Defender Firewall
- Ensure port 5000 is allowed
- Try temporarily disabling firewall for testing

### Problem: Router blocking connections
**Solution**: Check router settings
- Some routers block local network communication
- Try accessing from different devices on the same network

### Problem: Port already in use
**Solution**: Change the port
1. Edit `.env` file: `PORT=5001`
2. Restart the application
3. Update student URLs to use the new port

## 🌍 Advanced Network Configuration

### Using a Different Port
1. Edit `.env` file:
   ```
   PORT=8080
   ```
2. Update firewall rules for the new port
3. Students access via: `http://YOUR_IP_ADDRESS:8080`

### Using HTTPS (Optional)
1. Generate SSL certificates
2. Update server configuration
3. Students access via: `https://YOUR_IP_ADDRESS:5000`

### Domain Name (Optional)
1. Configure local DNS or use hosts file
2. Students can access via: `http://quiz.university.local:5000`

## 📊 Testing Network Access

### Test from another device:
1. **Mobile phone**: Connect to same WiFi, open browser
2. **Laptop**: Connect to same network, open browser
3. **Tablet**: Connect to same WiFi, open browser

### Test from command line:
```bash
# Test if port is accessible
telnet YOUR_IP_ADDRESS 5000

# Or use curl
curl http://YOUR_IP_ADDRESS:5000
```

## 🚨 Security Considerations

### For Production Use:
1. **Change default passwords** in the database
2. **Use strong JWT secrets**
3. **Enable HTTPS** with proper certificates
4. **Implement rate limiting** (already included)
5. **Regular security updates**

### For Development/Testing:
- Default settings are fine
- Demo accounts are pre-configured
- No external internet access required

## 📞 Getting Help

If you encounter network issues:

1. **Check the console output** for error messages
2. **Verify your IP address** hasn't changed
3. **Test local access** first (localhost:5000)
4. **Check firewall settings** on your computer
5. **Ensure all devices are on the same network**

## 🎯 Quick Checklist

- [ ] Found your computer's IP address
- [ ] Configured firewall to allow port 5000
- [ ] Started the application with `npm start`
- [ ] Tested local access (localhost:5000)
- [ ] Tested network access (YOUR_IP_ADDRESS:5000)
- [ ] Students can access from their devices

---

**Happy Quizzing! 🎓**

