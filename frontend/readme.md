# Chat Application

A real-time chat application built with Node.js, Express, MongoDB, and vanilla JavaScript frontend. Features user authentication, contact management, group chats, message reactions, and admin functionality.

## 📋 Features

- **User Authentication**: Register, login, JWT-based authentication
- **Contact Management**: Add, view, and remove contacts
- **Real-time Chat**: Create chats, send messages, edit/delete messages
- **Message Reactions**: Add emoji reactions to messages
- **Admin Panel**: Delete users, chats, and messages (admin only)
- **User Profiles**: View and edit profile information
- **Responsive Design**: Bootstrap-based frontend
- **API Documentation**: Swagger UI for API exploration

## 🛠️ Technologies Used

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Swagger for API documentation

### Frontend
- Vanilla JavaScript
- Bootstrap 5 for styling
- HTML5 & CSS3

### DevOps
- Docker & Docker Compose
- Railway for deployment

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (or Docker)
- Git

### Local Development

1. **Clone the repository**
```bash
git clone <https://github.com/DaniilKhvan/Chat-app.git>
cd chat-app
```

2. **Install dependencies**
```bash
cd backend
npm install
```

3. **Set up environment variables**
Create a `.env` file in the `backend` directory:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your_secret_key_here
JWT_EXPIRES=7d
ADMIN_EMAIL=admin@example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=superStrongAdminPass123
NODE_ENV=development
```

4. **Start MongoDB**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest

```

5. **Run the application**
```bash
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/api/health

### Using Docker Compose

1. **Start all services**
```bash
docker-compose up -d
```

2. **Access the application**
- Frontend: http://localhost:3000
- MongoDB: localhost:27017

3. **Stop services**
```bash
docker-compose down
```

## ☁️ Deployment on Railway

### Automatic Deployment
1. Push code to GitHub repository
2. Login to [Railway](https://railway.app) with GitHub
3. Create new project → "Deploy from GitHub repo"
4. Select your repository
5. Railway automatically:
   - Detects Node.js application
   - Adds MongoDB database
   - Sets environment variables
   - Deploys application

### Manual Configuration (if needed)
1. **Add environment variables** in Railway dashboard:
   ```
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES=7d
   ADMIN_EMAIL=admin@example.com
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_admin_password
   ```
   
   *Note: MongoDB connection string is automatically added by Railway*

2. **Check deployment logs** for any issues

## 📖 API Documentation

### Base URL
- Local: `http://localhost:3000/api`
- Production: `https://your-app.up.railway.app/api`

### Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

#### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

#### Contacts
- `GET /contacts` - Get user's contacts
- `POST /contacts` - Add new contact
- `DELETE /contacts/:id` - Remove contact

#### Chats
- `GET /chats` - Get user's chats
- `POST /chats` - Create new chat
- `GET /chats/:id` - Get specific chat
- `DELETE /chats/:id` - Delete chat
- `GET /chats/:chatId/messages` - Get chat messages
- `POST /chats/:chatId/messages` - Send message

#### Messages
- `GET /messages/:id` - Get message
- `PUT /messages/:id` - Edit message
- `DELETE /messages/:id` - Delete message
- `POST /messages/:messageId/reactions` - Add reaction
- `GET /messages/:messageId/reactions` - Get reactions
- `DELETE /messages/:messageId/reactions/:reactionId` - Remove reaction

#### Admin (admin only)
- `DELETE /admin/users/:id` - Delete user
- `DELETE /admin/chats/:id` - Delete chat
- `DELETE /admin/messages/:id` - Delete message

### Interactive Documentation
Access Swagger UI at: `/api/docs`

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `MONGO_URI` | MongoDB connection string | mongodb://localhost:27017/chat-app |
| `JWT_SECRET` | Secret key for JWT tokens | (required) |
| `JWT_EXPIRES` | JWT expiration time | 7d |
| `ADMIN_EMAIL` | Default admin email | admin@example.com |
| `ADMIN_USERNAME` | Default admin username | admin |
| `ADMIN_PASSWORD` | Default admin password | (required) |
| `NODE_ENV` | Environment mode | development |

## 📁 Project Structure

```
chat-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # Database connection
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── contact.routes.js
│   │   │   ├── message.routes.js
│   │   │   ├── reaction.routes.js
│   │   │   ├── admin.routes.js
│   │   │   └── user.routes.js
│   │   ├── scripts/
│   │   │   └── createAdmin.js # Admin user creation
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # Server entry point
│   ├── package.json
│   ├── .env.example
│   └── swagger-output.json   # Auto-generated API docs
├── frontend/
│   ├── index.html           # Login/Register page
│   ├── chats.html           # Main chat interface
│   ├── contacts.html        # Contact management
│   ├── admin.html           # Admin panel
│   ├── profile.html         # User profile
│   ├── css/
│   │   └── styles.css       # Custom styles
│   ├── js/
│   │   ├── app.js           # Authentication logic
│   │   ├── chats.js         # Chat functionality
│   │   ├── contacts.js      # Contact management
│   │   ├── admin.js         # Admin functionality
│   │   └── config.js        # Environment configuration
│   └── assets/              # Static assets
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile              # Docker build configuration
└── README.md              # This file
```

## 🔐 Default Admin Credentials
For local development:
- **Email**: `admin@example.com`
- **Password**: `superStrongAdminPass123`

*Change these in production!*

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB connection failed**
   - Ensure MongoDB is running
   - Check `MONGO_URI` in environment variables
   - Verify network connectivity

2. **CORS errors in browser**
   - Frontend should use `config.js` for API base URL
   - Check that backend has `app.use(cors())`
   - Ensure frontend and backend are on same domain or properly configured

3. **JWT authentication failing**
   - Verify `JWT_SECRET` is set
   - Check token expiration
   - Ensure Authorization header is properly formatted

4. **Railway deployment issues**
   - Check deployment logs in Railway dashboard
   - Verify environment variables
   - Ensure `PORT` is set to 3000

### Logs
- Local: Check console output
- Railway: Dashboard → Deployments → View Logs


## 👥 Authors
Daniil Khan, Gulnaz Duiseman

## 🔗 Links
- [GitHub Repository](https://github.com/DaniilKhvan/Chat-app.git)
- [Live Demo](https://your-app.up.railway.app)
