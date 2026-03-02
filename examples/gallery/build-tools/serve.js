const express = require('express');
const path = require('path');
const csrf = require('csurf');

const app = express();
const PORT = process.env.PORT || 8080;

// Parse cookies and body for CSRF middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Setup CSRF protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));

// CSRF token endpoint
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// CSRF error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ error: 'Invalid CSRF token' });
  } else {
    next(err);
  }
});

// Catch all handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
