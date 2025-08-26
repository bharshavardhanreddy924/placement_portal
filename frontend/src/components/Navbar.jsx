// src/components/Navbar.jsx

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully!');
        navigate('/login');
    };

    const studentLinks = [
        { name: 'Jobs', href: '/jobs' },
        { name: 'My Applications', href: '/my-applications' },
        { name: 'Profile', href: '/me' },
    ];

    const coordinatorLinks = [
        { name: 'Dashboard', href: '/coord/dashboard' }, // <-- CHANGE THIS LINE
        { name: 'Post a Job', href: '/coord/jobs/new' },
    ];

    const links = user?.role === 'student' ? studentLinks : coordinatorLinks;

    const activeLinkClass = "bg-slate-700 text-white";
    const inactiveLinkClass = "text-slate-300 hover:bg-slate-800 hover:text-white";

    return (
        <nav className="bg-slate-900 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <NavLink to="/" className="flex-shrink-0 flex items-center space-x-2 text-white text-xl font-bold">
                            <span>Placement Portal</span>
                        </NavLink>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {links.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        className={({ isActive }) =>
                                            `${isActive ? activeLinkClass : inactiveLinkClass} px-3 py-2 rounded-md text-sm font-medium`
                                        }
                                    >
                                        {item.name}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                         <span className="text-slate-300 text-sm font-medium">
                            Welcome, {user?.name.first}
                         </span>
                         <button
                            onClick={handleLogout}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition duration-150"
                         >
                            Logout
                         </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}