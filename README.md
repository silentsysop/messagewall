# MessageWall 📝🎉

MessageWall is a real-time event messaging platform that allows event organizers to create and manage interactive message walls for their events. Attendees can send messages, which appear in real-time on the event's message wall.

## ✨ Features

- 🔐 User authentication for organizers (register, login, logout)
- 🎈 Event creation and management
- 💬 Real-time messaging
- 🛡️ Message moderation for event organizers
- 📱 Responsive design for both desktop and mobile
- 👥 User roles (attendee and organizer)
- 🚪 No login required for attendees to participate
- ⭐ Save favorite events (for registered users)
- 🔄 Reply to messages
- 😊 Emoji support in messages

## 🛠️ Tech Stack

### Frontend
- ⚛️ React.js
- 🧭 React Router for navigation
- 🌐 Axios for API requests
- 🔌 Socket.io-client for real-time communication
- 🎨 Tailwind CSS for styling
- 🖼️ Lucide React for icons

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

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/messagewall.git
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
   ```

4. Start the backend server
   ```
   cd backend && npm start
   ```

5. In a new terminal, start the frontend development server
   ```
   cd frontend && npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`
