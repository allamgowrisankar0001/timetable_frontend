# Timetable Tracker

A React.js web application with Firebase authentication and MongoDB backend for tracking daily tasks with Yes/No buttons.

## Features

- 🔐 Firebase Google Authentication
- 📅 Weekly timetable with 7 days (Monday to Sunday)
- ➕ Add new actions with custom names
- ✅❌ Yes/No tracking for each day
- 🗑️ Delete actions
- 💾 MongoDB data persistence
- 🎨 Modern UI with Tailwind CSS
- 🔒 Protected routes

## Tech Stack

- **Frontend**: React.js + Vite + Tailwind CSS
- **Authentication**: Firebase Google Auth
- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Firebase project

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Google Authentication
4. Get your Firebase config and update `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. MongoDB Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `timetable`
3. Create a `.env` file in the `server` directory:

```env
MONGODB_URI=mongodb://localhost:27017/timetable
PORT=5000
```

### 3. Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
cd server
npm install
```

### 4. Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```

2. In a new terminal, start the frontend:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Sign In**: Click "Sign in with Google" to authenticate
2. **Add Actions**: Click the "➕ Add New Action" button to add new tasks
3. **Track Progress**: Use Yes/No buttons for each day to track completion
4. **Delete Actions**: Click the 🗑️ button to remove actions

## Project Structure

```
timetable/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Timetable.jsx
│   │   ├── AddActionModal.jsx
│   │   └── PrivateRoute.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   └── api.js
│   ├── firebase.js
│   └── App.jsx
├── server/
│   ├── models/
│   │   ├── User.js
│   │   └── TimetableEntry.js
│   ├── routes/
│   │   ├── users.js
│   │   └── timetable.js
│   └── index.js
└── README.md
```

## API Endpoints

### Users
- `POST /api/users` - Save/update user
- `GET /api/users/:uid` - Get user by UID

### Timetable
- `GET /api/timetable/:userId` - Get all entries for user
- `POST /api/timetable` - Add new entry
- `PUT /api/timetable/:id` - Update entry
- `DELETE /api/timetable/:id` - Delete entry

## Database Schema

### Users Collection
```javascript
{
  uid: "firebase_uid",
  name: "User Name",
  email: "user@example.com",
  photoURL: "profile.jpg"
}
```

### TimetableEntries Collection
```javascript
{
  userId: "firebase_uid",
  action: "Wake up at 6am",
  status: {
    Monday: "yes",
    Tuesday: "no",
    Wednesday: null,
    Thursday: "yes",
    Friday: null,
    Saturday: null,
    Sunday: null
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
