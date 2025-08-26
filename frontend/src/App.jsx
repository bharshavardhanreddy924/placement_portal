import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import JobsList from './pages/JobsList';
import JobDetail from './pages/JobDetail';
import Profile from './pages/Profile';
import MyApplications from './pages/MyApplications';
import CoordCreateJob from './pages/CoordCreateJob';
import CoordApplicants from './pages/CoordApplicants';
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="bg-slate-50 min-h-screen">
                    <Toaster position="top-right" />
                    <Navbar />
                    <main className="container mx-auto px-4 py-8">
                        <Routes>
                            <Route path="/" element={<JobsList />} />
                            <Route path="/jobs" element={<JobsList />} />
                            <Route path="/jobs/:id" element={<JobDetail />} />
                            <Route path="/me" element={<Profile />} />
                            <Route path="/my-applications" element={<MyApplications />} />
                            <Route path="/coord/jobs/new" element={<CoordCreateJob />} />
                            <Route path="/coord/jobs/:id/applicants" element={<CoordApplicants />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;