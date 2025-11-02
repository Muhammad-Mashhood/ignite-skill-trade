import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { useAuth } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SkillsPage from './pages/SkillsPage';
import MatchingPage from './pages/MatchingPage';
import TradesPage from './pages/TradesPage';
import PostsPage from './pages/PostsPage';
import MyPostsPage from './pages/MyPostsPage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import ProposalsPage from './pages/ProposalsPage';
import FeedPage from './pages/FeedPage';
import InboxPage from './pages/InboxPage';
import ChatPage from './pages/ChatPage';
import CreateCoursePage from './pages/CreateCoursePage';
import MyCoursesPage from './pages/MyCoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CoursesPage from './pages/CoursesPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';

// Layout wrapper for authenticated pages
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Redirect root based on auth status */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Navigate to="/feed" replace /> : <HomePage />
        } 
      />
      
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } 
      />
      
      {/* Protected Routes with Layout */}
      <Route
        path="/feed"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <FeedPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <ProfilePage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/skills"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <SkillsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/matching"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <MatchingPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/trades"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <TradesPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/posts"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <PostsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/posts/my"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <MyPostsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/posts/create"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <CreatePostPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/posts/:id"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <PostDetailPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/proposals"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <ProposalsPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/inbox"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <InboxPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/chat/:userId"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <ChatPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <CoursesPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/courses/create"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <CreateCoursePage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/courses/my"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <MyCoursesPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <CourseDetailPage />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
