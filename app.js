const express = require('express');
const mongoose = require('mongoose');
const expenseApiRoutes = require('./routes/expenseRoutes');
const pageRoutes = require('./routes/pageRoutes');
const path = require('path');
const methodOverride = require('method-override');

// Load environment variables from .env in development mode
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/splitapp';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/', pageRoutes);           // Rendered pages
app.use('/api', expenseApiRoutes); // API endpoints

module.exports = app;
