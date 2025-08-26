// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import JobsList from './pages/JobsList';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import MyApplications from './pages/MyApplications';
import CoordCreateJob from './pages/CoordCreateJob';
import CoordApplicants from './pages/CoordApplicants';
import Login from './pages/Login';
import Register from './pages/Register';

// Import the coordinator pages that were missing routes
import CoordDashboard from './pages/CoordDashboard';
import CoordEditJob from './pages/CoordEditJob';

function AppContent() {
    const { isAuthenticated } = useAuth();
    
    return (
        <div className="min-h-screen bg-slate-100">
            <Toaster position="top-right" />
            <Router>
                {isAuthenticated && <Navbar />}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        {/* Auth Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* Common/Student Routes */}
                        <Route path="/" element={<ProtectedRoute><JobsList /></ProtectedRoute>} />
                        <Route path="/jobs" element={<ProtectedRoute><JobsList /></ProtectedRoute>} />
                        <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
                        <Route path="/me" element={<ProtectedRoute requiredRole="student"><Profile /></ProtectedRoute>} />
                        <Route path="/my-applications" element={<ProtectedRoute requiredRole="student"><MyApplications /></ProtectedRoute>} />
                        
                        {/* Coordinator Routes */}
                        <Route path="/coord/dashboard" element={<ProtectedRoute requiredRole="coordinator"><CoordDashboard /></ProtectedRoute>} />
                        <Route path="/coord/jobs/new" element={<ProtectedRoute requiredRole="coordinator"><CoordCreateJob /></ProtectedRoute>} />
                        <Route path="/coord/jobs/:id/edit" element={<ProtectedRoute requiredRole="coordinator"><CoordEditJob /></ProtectedRoute>} />
                        <Route path="/coord/jobs/:id/applicants" element={<ProtectedRoute requiredRole="coordinator"><CoordApplicants /></ProtectedRoute>} />
                    </Routes>
                </main>
            </Router>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
