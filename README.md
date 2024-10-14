# MessageWall 📝🎉

MessageWall is a real-time event messaging platform that allows event organizers to create and manage interactive message walls for their events. Attendees can send messages, which appear in real-time on the event's message wall.

## ✨ Features

- 🔐 User authentication for organizers (register, login, logout)
- 🎈 Event creation and management
- 💬 Real-time messaging
- 🛡️ Simple Message moderation for event organizers (delete)
- 🔒 Optional message approval system for events
- 📱 Responsive design for both desktop and mobile
- 👥 User roles (attendee and organizer)
- 🚪 No login required for attendees to participate
- ⭐ Save favorite events (for registered users)
- 🔄 Reply to messages
- 😊 Emoji support in messages
- 🕰️ Message cooldown system to prevent spam
- 📅 View past & saved events
- 🖼️ Event image upload and management
- 🔍 Grid and list view options for events
- 🔔 Real-time user count for active events
- 📊 Event duration display
- 🔗 Easy event sharing functionality
- 🌓 Dark/Light mode support
- 📊 Real-time polls for events
- 👀 Spectator mode for fullscreen message viewing
- 👍 Message reactions (thumbs up/down)
- 🔄 Automatic removal of ended events
- 🔒 Chat locking functionality
- 📊 Poll history, presets and management
- 🌐 Localization with English and Finnish languages
- 👑 Custom role management for organizers

## 🚀 Coming Soon
- 🔔 Push notification system
- 🔍 Search functionality for events
- 🛡️ Advanced chat moderation (ban, timeout)
& more

## 🛠️ Tech Stack

### Frontend
- ⚛️ React.js
- 🧭 React Router for navigation
- 🌐 Axios for API requests
- 🔌 Socket.io-client for real-time communication
- 🎨 Tailwind CSS for styling
- 🖼️ Lucide React for icons
- 🎭 Framer Motion for animations
- 🍞 React Hot Toast for notifications
- 🌐 i18next for localization

### Backend
- 🟢 Node.js
- 🚂 Express.js
- 🍃 MongoDB with Mongoose
- 🔌 Socket.io for real-time communication
- 🔑 JWT for authentication
- 📁 Multer for file uploads

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB

### Becoming an Organizer / Admin
To give yourself organizer/admin privileges:
1.   Access your MongoDB database
2.   Find the user document you created in the project
3.   Find your created account and change the role field to "organizer"

### Optional frontend `.env` variables
#### REACT_APP_SHOW_AUTH_LINKS=false
- Hide login and register icons


### Installation (development)

1. Clone the repository
   ```
   git clone https://github.com/silentsysop/messagewall.git
   cd messagewall
   ```

2. Install dependencies for both frontend and backend
   ```
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   SOCKET_IO_PATH=/socket.io
   BASE_URL=/api
   ```

4. Create a `.env` file in the frontend directory with the following content:
   ```
   REACT_APP_BACKEND_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   REACT_APP_SOCKET_PATH=/socket.io
   REACT_APP_BASENAME=/
   REACT_APP_ENABLE_LOGS=true
   ```

5. Start the backend server
   ```
   cd backend && npm start
   ```

6. In a new terminal, start the frontend development server
   ```
   cd frontend && npm start
   ```

7. Open your browser and navigate to `http://localhost:3000`

#### Running on subdirectories

1. If you want to run the project on your subdirectory for example `http://localhost:3000/messagewall`,
   start by editing your frontend `.env` file like this:
   ```
   REACT_APP_BACKEND_URL=http://localhost:5000/messagewall/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   REACT_APP_SOCKET_PATH=/messagewall/socket.io
   REACT_APP_BASENAME=/messagewall
   REACT_APP_ENABLE_LOGS=true
   ```

2. Backend's `.env` file:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   SOCKET_IO_PATH=/messagewall/socket.io
   BASE_URL=/messagewall/api
   ```

3. In your frontend package.json change/add the `homepage` on top of the name
   ```
   "homepage": "/messagewall",
   ```

4. Start the backend server
   ```
   cd backend && npm start
   ```

5. In a new terminal, start the frontend development server
   ```
   cd frontend && npm start
   ```

### Installation (production)
Repeat same steps 1-4 from development installation then:

4. Build the frontend:
   ```
   cd ../frontend && npm run build
   ```

#### Option 1: Using serve with PM2 (Simpler for Low to Medium Traffic Setup)
5. Install serve and PM2 globally:
   ```
   npm install -g serve pm2
   ```

6. Start the backend with PM2:
   ```
   cd ../backend
   pm2 start server.js --name "messagewall-backend"
   ```

7. Start the frontend with PM2 (port = 3000):
   ```
   cd ../frontend
   pm2 serve build 3000 --name "messagewall-frontend"
   ```

8. Check status and set up PM2 to start on system reboot:
   ```
   pm2 list
   pm2 startup
   pm2 save
   ```

## 📄 License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.
