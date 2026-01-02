# AI Therapist Agent

A full-stack AI-powered mental health assistant that provides personalized therapy sessions, mood tracking, and wellness activities. Built with Next.js, Express, and Google Gemini AI.

[**🚀 Live Demo**](https://ai-therapist-agent-1pm3.vercel.app/)

## 🌟 Features

*   **AI Therapy Chat**: Real-time conversations with an empathetic AI therapist powered by Google Gemini.
*   **Mood Tracking**: Log and visualize your daily mood patterns.
*   **Wellness Dashboard**: Track your activities, therapy sessions, and receive personalized insights.
*   **Anxiety Games**: Interactive games (Breathing, Zen Garden) to help manage stress and anxiety.
*   **Secure Authentication**: User registration and login with JWT authentication.
*   **Responsive Design**: Beautiful, modern UI built with Tailwind CSS and Framer Motion.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: Next.js 16 (React 19)
*   **Styling**: Tailwind CSS, Framer Motion, Lucide React
*   **State Management**: React Hooks & Context API
*   **HTTP Client**: Fetch API

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose)
*   **AI Model**: Google Gemini (via `@google/generative-ai`)
*   **Authentication**: JSON Web Tokens (JWT), bcryptjs
*   **Background Jobs**: Inngest

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB Atlas account (or local MongoDB)
*   Google Cloud Project with Gemini API enabled

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Diptipathak2007/ai-therapist-agent.git
    cd ai-therapist-agent
    ```

2.  **Install Frontend Dependencies**
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    cd ..
    ```

### Environment Variables

Create a `.env` file in the `backend` directory and a `.env.local` file in the root directory.

**Backend (`backend/.env`)**
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Frontend (`.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Running Locally

1.  **Start the Backend Server**
    ```bash
    cd backend
    npm run dev
    ```
    The backend will start on `http://localhost:3001`.

2.  **Start the Frontend Server** (in a new terminal)
    ```bash
    # from the root directory
    npm run dev
    ```
    The frontend will start on `http://localhost:3000`.

## 📦 Deployment

This project uses a **Split Deployment** strategy:

### 1. Backend (Render/Railway)
Since the backend uses a persistent Express server, it cannot be deployed to Vercel.
*   Deploy the `backend` directory to a service like **Render**.
*   **Build Command**: `npm install && npm run build`
*   **Start Command**: `npm start`
*   **Environment Variables**: Set all variables from `backend/.env`. Update `NEXT_PUBLIC_APP_URL` to your deployed frontend URL.

### 2. Frontend (Vercel)
*   Deploy the root directory to **Vercel**.
*   **Environment Variables**: Set `NEXT_PUBLIC_API_URL` to your deployed backend URL (e.g., `https://your-backend.onrender.com`).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
