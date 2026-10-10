require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pets', require('./routes/pets'));
app.use('/api/adoptions', require('./routes/adoptions'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contact', require('./routes/contact'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  let status = err.status || 500;
  let message = err.message || 'Server error';
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pawhaven')
  .then(() => { console.log('MongoDB connected'); app.listen(PORT, () => console.log('API running on port ' + PORT)); })
  .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
