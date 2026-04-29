import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import ManageQuestions from './pages/ManageQuestions';
import { getStoredUser } from './config/api';

function RequireAuth({ children, role }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    const redirectPath = user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student-dashboard" element={<RequireAuth role="student"><StudentDashboard /></RequireAuth>} />
        <Route path="/teacher-dashboard" element={<RequireAuth role="teacher"><TeacherDashboard /></RequireAuth>} />
        <Route path="/quiz" element={<RequireAuth><Quiz /></RequireAuth>} />
        <Route path="/results" element={<RequireAuth><Results /></RequireAuth>} />
        <Route path="/leaderboard" element={<RequireAuth><Leaderboard /></RequireAuth>} />
        <Route path="/teacher-dashboard/manage-questions/:testId" element={<RequireAuth role="teacher"><ManageQuestions /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
