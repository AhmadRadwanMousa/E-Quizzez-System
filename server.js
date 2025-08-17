const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'client/build')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (more development-friendly)
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
app.use('/api/auth/admin/', authLimiter);

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Students table
    db.run(`CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Admins table
    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Subjects table
    db.run(`CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Questions table
    db.run(`CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      subject_id INTEGER,
      difficulty TEXT DEFAULT 'medium',
      marks INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects (id)
    )`);

    // Exams table
    db.run(`CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject_id INTEGER,
      duration_minutes INTEGER DEFAULT 60,
      total_questions INTEGER DEFAULT 10,
      questions_per_exam INTEGER DEFAULT 10,
      total_marks INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects (id)
    )`);

    // Exam questions (many-to-many relationship)
    db.run(`CREATE TABLE IF NOT EXISTS exam_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER,
      question_id INTEGER,
      marks INTEGER DEFAULT 1,
      FOREIGN KEY (exam_id) REFERENCES exams (id),
      FOREIGN KEY (question_id) REFERENCES questions (id)
    )`);

    // Lightweight migrations (ignore failures if column exists)
    db.run(`ALTER TABLE exams ADD COLUMN total_marks INTEGER DEFAULT 0`, () => {});
    db.run(`ALTER TABLE exam_questions ADD COLUMN marks INTEGER DEFAULT 1`, () => {});
    db.run(`ALTER TABLE exams ADD COLUMN questions_per_exam INTEGER DEFAULT 10`, () => {});
    db.run(`ALTER TABLE exams ADD COLUMN start_time DATETIME`, () => {});
    db.run(`ALTER TABLE exams ADD COLUMN end_time DATETIME`, () => {});
    db.run(`ALTER TABLE results ADD COLUMN total_marks INTEGER DEFAULT 0`, () => {});
    db.run(`ALTER TABLE results ADD COLUMN start_time DATETIME`, () => {});
    
    // Remove old columns that cause constraint issues
    db.run(`ALTER TABLE questions DROP COLUMN subject`, (err) => {
      if (err) console.log('questions.subject column removal:', err.message);
    });
    db.run(`ALTER TABLE exams DROP COLUMN subject`, (err) => {
      if (err) console.log('exams.subject column removal:', err.message);
    });
    
    // Results table
    db.run(`CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      exam_id INTEGER,
      score INTEGER DEFAULT 0,
      total_questions INTEGER DEFAULT 0,
      total_marks INTEGER DEFAULT 0,
      answers TEXT DEFAULT '{}',
      time_taken INTEGER DEFAULT 0,
      start_time DATETIME,
      submitted_at DATETIME,
      FOREIGN KEY (student_id) REFERENCES students (id),
      FOREIGN KEY (exam_id) REFERENCES exams (id)
    )`);

    // Ensure a student can submit only once per exam
    db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_results_student_exam ON results(student_id, exam_id)`);
    
    // Run migration for existing data
    migrateExistingData();
    
    // Fix existing results data
    fixExistingResults();
    
    // Insert default admin user if not exists
    insertDefaultAdmin();
  });
  
  // Database is ready - no sample data inserted
  console.log('Database initialized successfully - starting fresh!');
}

// Migrate existing data to new schema
function migrateExistingData() {
  console.log('Starting data migration...');
  
  // First, ensure the subject_id column exists in questions
  db.run(`ALTER TABLE questions ADD COLUMN subject_id INTEGER`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding subject_id column to questions:', err);
      return;
    }
    console.log('questions.subject_id column ready');
    
    // Ensure marks column exists in questions
    db.run(`ALTER TABLE questions ADD COLUMN marks INTEGER DEFAULT 1`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding marks column to questions:', err);
        return;
      }
      console.log('questions.marks column ready');
      
      // Add subject_id column to exams table
      db.run(`ALTER TABLE exams ADD COLUMN subject_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding subject_id column to exams:', err);
          return;
        }
        console.log('exams.subject_id column ready');
        
        // Now check if we need to migrate existing data
        db.all("PRAGMA table_info(questions)", (err, columns) => {
          if (err) {
            console.error('Error checking questions columns:', err);
            return;
          }
          
          const hasSubjectColumn = columns.some(col => col.name === 'subject');
          const hasSubjectIdColumn = columns.some(col => col.name === 'subject_id');
          
          if (hasSubjectColumn && hasSubjectIdColumn) {
            console.log('Migrating questions from old schema...');
            
            // Create default subject for existing questions
            db.run(`INSERT OR IGNORE INTO subjects (name, code, description) VALUES (?, ?, ?)`, 
              ['General', 'GEN', 'General subject for existing questions'], 
              function(err) {
                if (err) {
                  console.error('Error creating default subject:', err);
                  return;
                }
                
                const defaultSubjectId = this.lastID;
                console.log('Created default subject with ID:', defaultSubjectId);
                
                // Update existing questions to use default subject
                db.run(`UPDATE questions SET subject_id = ? WHERE subject_id IS NULL`, [defaultSubjectId], function(err) {
                  if (err) {
                    console.error('Error updating questions:', err);
                  } else {
                    console.log(`Updated ${this.changes} questions to use default subject`);
                  }
                });
                
                // Update existing exams to use default subject
                db.run(`UPDATE exams SET subject_id = ? WHERE subject_id IS NULL`, [defaultSubjectId], function(err) {
                  if (err) {
                    console.error('Error updating exams:', err);
                  } else {
                    console.log(`Updated ${this.changes} exams to use default subject`);
                  }
                });
                
                // Now remove the old subject column to avoid constraint issues
                db.run(`ALTER TABLE questions DROP COLUMN subject`, (err) => {
                  if (err) {
                    console.log('Could not drop old subject column (may not exist):', err.message);
                  } else {
                    console.log('Successfully removed old subject column');
                  }
                });
              }
            );
          } else {
            console.log('No migration needed for questions');
            
            // Still try to remove the old subject column if it exists
            db.run(`ALTER TABLE questions DROP COLUMN subject`, (err) => {
              if (err) {
                console.log('Could not drop old subject column (may not exist):', err.message);
              } else {
                console.log('Successfully removed old subject column');
              }
            });
          }
        });
      });
    });
  });
}

// Fix existing results that don't have total_marks
function fixExistingResults() {
  console.log('Fixing existing results data...');
  
  // Get all results that have total_marks = 0 or NULL
  db.all('SELECT r.*, e.subject_id FROM results r INNER JOIN exams e ON r.exam_id = e.id WHERE r.total_marks = 0 OR r.total_marks IS NULL', (err, results) => {
    if (err) {
      console.error('Error fetching results to fix:', err);
      return;
    }
    
    if (results.length === 0) {
      console.log('No results need fixing');
      return;
    }
    
    console.log(`Found ${results.length} results to fix...`);
    
    results.forEach(result => {
      // Calculate total marks based on questions in the subject
      db.all('SELECT SUM(marks) as total_marks FROM questions WHERE subject_id = ?', [result.subject_id], (err, marksResult) => {
        if (err) {
          console.error('Error calculating marks for result:', result.id, err);
          return;
        }
        
        const totalMarks = marksResult[0]?.total_marks || result.total_questions;
        
        // Update the result with correct total_marks
        db.run('UPDATE results SET total_marks = ? WHERE id = ?', [totalMarks, result.id], function(err) {
          if (err) {
            console.error('Error updating result:', result.id, err);
          } else {
            console.log(`Fixed result ${result.id}: total_marks = ${totalMarks}`);
          }
        });
      });
    });
  });
}

// Insert default admin user
function insertDefaultAdmin() {
  const bcrypt = require('bcryptjs');
  const defaultAdmin = {
    username: 'admin',
    email: 'admin@equizzez.com',
    password: 'admin123',
    full_name: 'System Administrator'
  };
  
  // Check if admin already exists
  db.get('SELECT id FROM admins WHERE username = ?', [defaultAdmin.username], (err, row) => {
    if (err) {
      console.error('Error checking admin:', err);
      return;
    }
    
    if (!row) {
      // Admin doesn't exist, create it
      const hashedPassword = bcrypt.hashSync(defaultAdmin.password, 10);
      db.run(`INSERT INTO admins (username, email, password_hash, full_name, role, is_active) 
        VALUES (?, ?, ?, ?, ?, ?)`, 
        [defaultAdmin.username, defaultAdmin.email, hashedPassword, defaultAdmin.full_name, 'admin', 1],
        function(err) {
          if (err) {
            console.error('Error creating default admin:', err);
          } else {
            console.log('✅ Default admin user created successfully!');
            console.log(`   Username: ${defaultAdmin.username}`);
            console.log(`   Password: ${defaultAdmin.password}`);
            console.log(`   Email: ${defaultAdmin.email}`);
          }
        }
      );
    } else {
      console.log('Default admin user already exists');
      
      // Ensure the admin has the correct role
      db.run(`UPDATE admins SET role = 'admin' WHERE username = ? AND (role IS NULL OR role != 'admin')`, 
        [defaultAdmin.username], function(err) {
          if (err) {
            console.error('Error updating admin role:', err);
          } else if (this.changes > 0) {
            console.log('Updated admin role to "admin"');
          }
        }
      );
    }
  });
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Admin auth - Headers:', req.headers);
  console.log('Admin auth - Token:', token ? 'Present' : 'Missing');

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      console.error('Admin auth - JWT verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    
    console.log('Admin auth - Decoded user:', user);
    
    if (user.role !== 'admin') {
      console.error('Admin auth - User role mismatch:', user.role);
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    req.user = user;
    next();
  });
};

// Routes

// Admin login
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check admin credentials in database
    db.get('SELECT * FROM admins WHERE email = ? AND is_active = 1', [email], async (err, admin) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (!admin) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: admin.id, 
          email: admin.email, 
          username: admin.username,
          role: admin.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Admin login successful',
        data: {
          token,
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            full_name: admin.full_name,
            role: admin.role
          }
        }
      });
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Student login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { student_id, password } = req.body;
    
    if (!student_id || !password) {
      return res.status(400).json({ message: 'Student ID and password are required' });
    }

    // Check student credentials
    db.get('SELECT * FROM students WHERE student_id = ?', [student_id], async (err, student) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (!student) {
        return res.status(401).json({ message: 'Invalid student ID or password' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, student.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid student ID or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: student.id, student_id: student.student_id, role: 'student' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        data: {
          token,
          student: {
            id: student.id,
            student_id: student.student_id,
            name: student.name,
            email: student.email
          }
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Validate student token
app.get('/api/auth/validate', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Invalid token type' });
    }
    
    res.json({ 
      success: true, 
      message: 'Token valid',
      data: { user: req.user }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Validate admin token
app.get('/api/auth/admin/validate', authenticateAdmin, (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Admin token valid',
      data: { admin: req.user }
    });
  } catch (error) {
    console.error('Admin token validation error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get available exams
app.get('/api/exams', authenticateToken, (req, res) => {
  try {
    const studentId = req.user.id;
    db.all(`
      SELECT e.*, 
             CASE WHEN EXISTS (
               SELECT 1 FROM results r WHERE r.exam_id = e.id AND r.student_id = ?
             ) THEN 1 ELSE 0 END AS already_submitted
      FROM exams e
      WHERE e.is_active = 1
      ORDER BY e.created_at DESC
    `, [studentId], (err, exams) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json({
        message: 'Exams retrieved successfully',
        data: exams
      });
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single exam by ID
app.get('/api/exams/:examId', authenticateToken, (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;
    
    db.get(`
      SELECT e.*, s.name as subject_name, s.code as subject_code
      FROM exams e
      LEFT JOIN subjects s ON e.subject_id = s.id
      WHERE e.id = ? AND e.is_active = 1
    `, [examId], (err, exam) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      if (!exam) {
        return res.status(404).json({ success: false, message: 'Exam not found' });
      }

      // Check if student has already completed this exam
      db.get('SELECT id FROM results WHERE student_id = ? AND exam_id = ?', [studentId, examId], (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        const examData = {
          ...exam,
          already_completed: !!result
        };

        res.json({
          success: true,
          message: 'Exam retrieved successfully',
          data: examData
        });
      });
    });
  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Check if student has already completed an exam
app.get('/api/exams/:examId/completion-status', authenticateToken, (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;
    
    db.get('SELECT id FROM results WHERE student_id = ? AND exam_id = ?', [studentId, examId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.json({
        message: 'Completion status retrieved successfully',
        data: {
          completed: !!result,
          resultId: result ? result.id : null
        }
      });
    });
  } catch (error) {
    console.error('Get completion status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start exam session
app.post('/api/exams/:examId/start', authenticateToken, (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;
    
    // Check if student has already started or completed this exam
    db.get('SELECT id, start_time FROM results WHERE student_id = ? AND exam_id = ?', [studentId, examId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      if (result) {
        if (result.start_time) {
          // Exam already started, return the start time
          return res.json({
            success: true,
            message: 'Exam already started',
            data: {
              start_time: result.start_time,
              already_started: true
            }
          });
        } else {
          // Exam already completed
          return res.status(403).json({ 
            success: false,
            message: 'You have already completed this exam'
          });
        }
      }

      // Get exam info to check if it's active and get duration
      db.get('SELECT duration_minutes, is_active FROM exams WHERE id = ?', [examId], (err, examInfo) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (!examInfo) {
          return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        if (!examInfo.is_active) {
          return res.status(400).json({ success: false, message: 'This exam is not currently active' });
        }

        // Create exam session record with start time
        const startTime = new Date().toISOString();
        db.run(`
          INSERT INTO results (student_id, exam_id, start_time, score, total_questions, total_marks, answers, time_taken, submitted_at)
          VALUES (?, ?, ?, 0, 0, 0, '{}', 0, NULL)
        `, [studentId, examId, startTime], function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
          }

          res.json({
            success: true,
            message: 'Exam started successfully',
            data: {
              start_time: startTime,
              duration_minutes: examInfo.duration_minutes,
              already_started: false
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get exam questions
app.get('/api/exams/:examId/questions', authenticateToken, (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;
    
    // Check if student has already started or completed this exam
    db.get('SELECT id, start_time, submitted_at FROM results WHERE student_id = ? AND exam_id = ?', [studentId, examId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }

      if (result && result.submitted_at) {
        return res.status(403).json({ 
          success: false,
          message: 'You have already completed this exam',
          data: { completed: true }
        });
      }

      if (!result || !result.start_time) {
        return res.status(400).json({ 
          success: false,
          message: 'You must start the exam before accessing questions',
          data: { needs_start: true }
        });
      }

      // If not completed, get exam info first to know subject and questions needed
      db.get('SELECT subject_id, questions_per_exam, total_questions, duration_minutes FROM exams WHERE id = ?', [examId], (err, examInfo) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        if (!examInfo) {
          return res.status(404).json({ message: 'Exam not found' });
        }

        const questionsNeeded = examInfo.questions_per_exam || examInfo.total_questions || 10;

        // Get questions by subject
        db.all(`
          SELECT q.* FROM questions q
          WHERE q.subject_id = ?
          ORDER BY RANDOM()
          LIMIT ?
        `, [examInfo.subject_id, questionsNeeded], (err, questions) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
          }

          if (!questions || questions.length === 0) {
            return res.status(404).json({ message: 'No questions available for this subject' });
          }

          // Remove correct answers from questions sent to student
          const questionsForStudent = questions.map(q => ({
            id: q.id,
            question_text: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            subject_id: q.subject_id,
            difficulty: q.difficulty,
            marks: q.marks
          }));

          res.json({
            success: true,
            message: 'Questions retrieved successfully',
            data: {
              questions: questionsForStudent,
              start_time: result.start_time,
              exam_session_id: result.id,
              duration_minutes: examInfo.duration_minutes
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit exam
app.post('/api/exams/:examId/submit', authenticateToken, async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers, time_taken } = req.body;
    const studentId = req.user.id;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, message: 'Answers are required' });
    }

    // Check if exam session exists and is not completed
    db.get('SELECT id, start_time, submitted_at FROM results WHERE student_id = ? AND exam_id = ?', [studentId, examId], (dupErr, existing) => {
      if (dupErr) {
        console.error('Database error:', dupErr);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
      
      if (!existing || !existing.start_time) {
        return res.status(400).json({ success: false, message: 'You must start the exam before submitting' });
      }
      
      if (existing.submitted_at) {
        return res.status(403).json({ success: false, message: 'You have already submitted this exam' });
      }

      // Get exam info to know subject
      db.get('SELECT subject_id, questions_per_exam FROM exams WHERE id = ?', [examId], (err, examInfo) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (!examInfo) {
          return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        // Get correct answers for questions in this exam
        db.all(`
          SELECT q.id, q.correct_answer, q.marks
          FROM questions q
          WHERE q.subject_id = ?
          ORDER BY RANDOM()
          LIMIT ?
        `, [examInfo.subject_id, examInfo.questions_per_exam || 10], (err, correctAnswers) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
          }

          let score = 0;
          let totalMarks = 0;
          const totalQuestions = correctAnswers.length;

          // Convert answers object to array format for processing
          const answersArray = Object.entries(answers).map(([questionId, answerIndex]) => ({
            question_id: parseInt(questionId),
            selected_answer: answerIndex
          }));

          // Calculate score
          answersArray.forEach(answer => {
            const correctAnswer = correctAnswers.find(ca => ca.id === answer.question_id);
            if (correctAnswer) {
              totalMarks += Number(correctAnswer.marks || 1);
              if (answer.selected_answer === correctAnswer.correct_answer) {
                score += Number(correctAnswer.marks || 1);
              }
            }
          });

          // Update existing result with score and submission
          db.run(`
            UPDATE results 
            SET score = ?, total_questions = ?, total_marks = ?, answers = ?, time_taken = ?, submitted_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [score, totalQuestions, totalMarks, JSON.stringify(answersArray), time_taken || 0, existing.id], function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ success: false, message: 'Internal server error' });
            }

            res.json({
              success: true,
              message: 'Exam submitted successfully',
              data: {
                score,
                totalQuestions,
                totalMarks,
                percentage: totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0
              }
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get student results
app.get('/api/results', authenticateToken, (req, res) => {
  try {
    const studentId = req.user.id;
    
    db.all(`
      SELECT r.*, e.title as exam_title, s.name as subject_name
      FROM results r
      INNER JOIN exams e ON r.exam_id = e.id
      INNER JOIN subjects s ON e.subject_id = s.id
      WHERE r.student_id = ?
      ORDER BY r.submitted_at DESC
    `, [studentId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      // Calculate percentage for each result
      const resultsWithPercentage = results.map(result => {
        const percentage = result.total_marks > 0 ? Math.round((result.score / result.total_marks) * 100) : 0;
        return {
          ...result,
          percentage
        };
      });

      res.json({
        message: 'Results retrieved successfully',
        data: resultsWithPercentage
      });
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes for students
app.get('/api/students', authenticateAdmin, (req, res) => {
  try {
    db.all('SELECT * FROM students ORDER BY created_at DESC', (err, students) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json({
        message: 'Students retrieved successfully',
        data: students
      });
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes for results
app.get('/api/admin/results', authenticateAdmin, (req, res) => {
  try {
    db.all(`
      SELECT r.*, s.name as student_name, s.student_id as student_code, e.title as exam_title, sub.name as subject_name
      FROM results r
      INNER JOIN students s ON r.student_id = s.id
      INNER JOIN exams e ON r.exam_id = e.id
      INNER JOIN subjects sub ON e.subject_id = sub.id
      ORDER BY r.submitted_at DESC
    `, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      
      // Calculate percentage for each result
      const resultsWithPercentage = results.map(result => {
        const percentage = result.total_marks > 0 ? Math.round((result.score / result.total_marks) * 100) : 0;
        return {
          ...result,
          percentage
        };
      });
      
      res.json({
        message: 'Results retrieved successfully',
        data: resultsWithPercentage
      });
    });
  } catch (error) {
    console.error('Get admin results error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new student (admin only)
app.post('/api/admin/students', authenticateAdmin, async (req, res) => {
  try {
    const { student_id, name, email, password } = req.body;
    
    if (!student_id || !name || !password) {
      return res.status(400).json({ message: 'Student ID, name, and password are required' });
    }

    // Check if student ID already exists
    db.get('SELECT id FROM students WHERE student_id = ?', [student_id], (err, existing) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (existing) {
        return res.status(400).json({ message: 'Student ID already exists' });
      }

      // Hash password and create student
      const hashedPassword = bcrypt.hashSync(password, 10);
      db.run(`
        INSERT INTO students (student_id, password, name, email)
        VALUES (?, ?, ?, ?)
      `, [student_id, hashedPassword, name, email || ''], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        res.json({
          message: 'Student created successfully',
          data: { id: this.lastID }
        });
      });
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update student (admin only)
app.put('/api/admin/students/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, name, email, password } = req.body;
    
    if (!student_id || !name) {
      return res.status(400).json({ message: 'Student ID and name are required' });
    }

    let updateQuery = 'UPDATE students SET student_id = ?, name = ?, email = ?';
    let params = [student_id, name, email || ''];

    if (password) {
      updateQuery += ', password = ?';
      const hashedPassword = bcrypt.hashSync(password, 10);
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    db.run(updateQuery, params, function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.json({
        message: 'Student updated successfully'
      });
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete student (admin only)
app.delete('/api/admin/students/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Also remove results for this student
      db.run('DELETE FROM results WHERE student_id = ?', [id]);

      res.json({
        message: 'Student deleted successfully'
      });
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes for managing subjects
app.post('/api/admin/subjects', authenticateAdmin, (req, res) => {
  try {
    const { name, code, description } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ message: 'Name and code are required' });
    }

    db.run(`
      INSERT INTO subjects (name, code, description)
      VALUES (?, ?, ?)
    `, [name, code, description || ''], function(err) {
      if (err) {
        console.error('Database error:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Subject with this name or code already exists' });
        }
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.json({
        message: 'Subject added successfully',
        data: { id: this.lastID }
      });
    });
  } catch (error) {
    console.error('Add subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all subjects for admin
app.get('/api/admin/subjects', authenticateAdmin, (req, res) => {
  try {
    db.all(`
      SELECT s.*, COUNT(q.id) as questions_count 
      FROM subjects s 
      LEFT JOIN questions q ON s.id = q.subject_id 
      GROUP BY s.id 
      ORDER BY s.id DESC
    `, (err, subjects) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json({
        message: 'Subjects retrieved successfully',
        data: subjects
      });
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update subject
app.put('/api/admin/subjects/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ message: 'Name and code are required' });
    }

    db.run(`
      UPDATE subjects 
      SET name = ?, code = ?, description = ?
      WHERE id = ?
    `, [name, code, description || '', id], function(err) {
      if (err) {
        console.error('Database error:', err);
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Subject with this name or code already exists' });
        }
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      res.json({
        message: 'Subject updated successfully'
      });
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete subject
app.delete('/api/admin/subjects/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if subject has questions
    db.get('SELECT COUNT(*) as count FROM questions WHERE subject_id = ?', [id], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (result.count > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete subject. It has associated questions. Please remove or reassign questions first.' 
        });
      }

      // Delete subject if no questions
      db.run('DELETE FROM subjects WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: 'Subject not found' });
        }

        res.json({
          message: 'Subject deleted successfully'
        });
      });
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes for managing questions and exams
app.post('/api/admin/questions', authenticateAdmin, (req, res) => {
  try {
    const { question_text, option_a, option_b, option_c, option_d, correct_answer, subject_id, difficulty, marks } = req.body;
    
    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer || !subject_id) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    db.run(`
      INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer, subject_id, difficulty, marks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [question_text, option_a, option_b, option_c, option_d, correct_answer, subject_id, difficulty || 'medium', marks || 1], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.json({
        message: 'Question added successfully',
        data: { id: this.lastID }
      });
    });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all questions for admin
app.get('/api/admin/questions', authenticateAdmin, (req, res) => {
  try {
    db.all(`
      SELECT q.*, s.name as subject_name, s.code as subject_code
      FROM questions q
      LEFT JOIN subjects s ON q.subject_id = s.id
      ORDER BY q.id DESC
    `, (err, questions) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json({
        message: 'Questions retrieved successfully',
        data: questions
      });
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update question
app.put('/api/admin/questions/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { question_text, option_a, option_b, option_c, option_d, correct_answer, subject_id, difficulty, marks } = req.body;
    
    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer || !subject_id) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    db.run(`
      UPDATE questions 
      SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, 
          correct_answer = ?, subject_id = ?, difficulty = ?, marks = ?
      WHERE id = ?
    `, [question_text, option_a, option_b, option_c, option_d, correct_answer, subject_id, difficulty || 'medium', marks || 1, id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }

      res.json({
        message: 'Question updated successfully'
      });
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete question
app.delete('/api/admin/questions/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    db.run('DELETE FROM questions WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }

      // Also remove from exam_questions
      db.run('DELETE FROM exam_questions WHERE question_id = ?', [id]);

      res.json({
        message: 'Question deleted successfully'
      });
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create exam
app.post('/api/admin/exams', authenticateAdmin, (req, res) => {
  try {
    const { title, subject_id, duration_minutes, questions_per_exam, total_marks, start_time, end_time } = req.body;
    
    if (!title || !subject_id || !duration_minutes || !questions_per_exam) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Get all questions for the subject to create the question bank
    db.all('SELECT id FROM questions WHERE subject_id = ?', [subject_id], (err, questions) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (questions.length === 0) {
        return res.status(400).json({ message: 'No questions available for this subject' });
      }

      if (questions_per_exam > questions.length) {
        return res.status(400).json({ 
          message: `Only ${questions.length} questions available for this subject. Cannot create exam with ${questions_per_exam} questions.` 
        });
      }

      // Create the exam
      db.run(`
        INSERT INTO exams (title, subject_id, duration_minutes, total_questions, questions_per_exam, total_marks, is_active, start_time, end_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [title, subject_id, duration_minutes, questions.length, questions_per_exam, total_marks || questions_per_exam, 1, start_time || null, end_time || null], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        const examId = this.lastID;
        
        // Add all questions to the exam question bank
        questions.forEach((question) => {
          db.run('INSERT INTO exam_questions (exam_id, question_id, marks) VALUES (?, ?, ?)', 
            [examId, question.id, 1]);
        });

        res.json({
          message: 'Exam created successfully with question bank',
          data: { 
            id: examId,
            total_questions_in_bank: questions.length,
            questions_per_exam: questions_per_exam
          }
        });
      });
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all exams for admin
app.get('/api/admin/exams', authenticateAdmin, (req, res) => {
  try {
    db.all(`
      SELECT e.*, s.name as subject_name, s.code as subject_code
      FROM exams e
      LEFT JOIN subjects s ON e.subject_id = s.id
      ORDER BY e.id DESC
    `, (err, exams) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json({
        message: 'Exams retrieved successfully',
        data: exams
      });
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update exam
app.put('/api/admin/exams/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject_id, duration_minutes, questions_per_exam, total_marks, is_active, start_time, end_time } = req.body;
    
    if (!title || !subject_id || !duration_minutes || !questions_per_exam) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the new questions_per_exam is valid for the subject
    db.all('SELECT COUNT(*) as count FROM questions WHERE subject_id = ?', [subject_id], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      const totalQuestionsInSubject = result[0].count;
      if (questions_per_exam > totalQuestionsInSubject) {
        return res.status(400).json({ 
          message: `Only ${totalQuestionsInSubject} questions available for this subject. Cannot set exam to ${questions_per_exam} questions.` 
        });
      }

      // Update the exam
      db.run(`
        UPDATE exams 
        SET title = ?, subject_id = ?, duration_minutes = ?, total_questions = ?, questions_per_exam = ?, total_marks = ?, is_active = ?, start_time = ?, end_time = ?
        WHERE id = ?
      `, [title, subject_id, duration_minutes, totalQuestionsInSubject, questions_per_exam, total_marks || questions_per_exam, is_active ? 1 : 0, start_time || null, end_time || null, id], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ message: 'Exam not found' });
        }

        // Update exam questions - remove old ones and add all questions for the subject
        db.run('DELETE FROM exam_questions WHERE exam_id = ?', [id], (delErr) => {
          if (delErr) {
            console.error('Database error:', delErr);
            return res.status(500).json({ message: 'Internal server error' });
          }

          // Add all questions for the subject to the exam
          db.all('SELECT id FROM questions WHERE subject_id = ?', [subject_id], (qErr, questions) => {
            if (qErr) {
              console.error('Database error:', qErr);
              return res.status(500).json({ message: 'Internal server error' });
            }

            questions.forEach((question) => {
              db.run('INSERT INTO exam_questions (exam_id, question_id, marks) VALUES (?, ?, ?)', 
                [id, question.id, 1]);
            });

            res.json({
              message: 'Exam updated successfully',
              data: {
                total_questions_in_bank: questions.length,
                questions_per_exam: questions_per_exam
              }
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete exam
app.delete('/api/admin/exams/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    
    db.run('DELETE FROM exams WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      // Also remove from exam_questions and results
      db.run('DELETE FROM exam_questions WHERE exam_id = ?', [id]);
      db.run('DELETE FROM results WHERE exam_id = ?', [id]);

      res.json({
        message: 'Exam deleted successfully'
      });
    });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Access the application at:`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Network: http://YOUR_IP_ADDRESS:${PORT}`);
  console.log(`   (Replace YOUR_IP_ADDRESS with your computer's IP address)`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
