const express = require('express');
const mongoose = require('mongoose');
const expenseApiRoutes = require('./routes/expenseRoutes');
const pageRoutes = require('./routes/pageRoutes');
const path = require('path');
const methodOverride = require('method-override');

// Load environment variables (for local dev - optional)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use MONGO_URI from environment variables
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/', pageRoutes);            // EJS pages
app.use('/api', expenseApiRoutes);  // REST APIs

module.exports = app;
