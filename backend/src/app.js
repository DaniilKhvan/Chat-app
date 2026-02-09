const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');

const authRoutes = require('./routes/auth.routes');
const contactRoutes = require('./routes/contact.routes');
const chatRoutes = require('./routes/chat.routes');
const messageRoutes = require('./routes/message.routes');
const reactionRoutes = require('./routes/reaction.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api', messageRoutes);
app.use('/api', reactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/swagger.json', (req, res) => res.json(swaggerFile));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(null, {
  swaggerOptions: { url: '/api/swagger.json' }
}));

app.use('/api', (req, res) => {
  if (req.path === '/' || req.path === '') return res.json({ msg: 'API root — empty' });
  res.status(501).json({ message: 'Not implemented yet' });
});

const frontendPath = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendPath));
app.use('/assets', express.static(path.join(frontendPath, 'assets')));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'API route not found' });
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
