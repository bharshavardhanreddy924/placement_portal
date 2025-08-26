import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { role, setRole, user } = useAuth();

    const handleRoleChange = (newRole) => {
        setRole(newRole);
    };

    const studentLinks = [
        { name: 'Jobs', href: '/jobs' },
        { name: 'My Applications', href: '/my-applications' },
        { name: 'Profile', href: '/me' },
    ];

    const coordinatorLinks = [
        { name: 'Post a Job', href: '/coord/jobs/new' },
    ];

    const links = role === 'student' ? studentLinks : coordinatorLinks;
    const activeLinkClass = "bg-slate-700 text-white";
    const inactiveLinkClass = "text-slate-300 hover:bg-slate-800 hover:text-white";

    return (
        <nav className="bg-slate-900 shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <NavLink to="/" className="text-white text-xl font-bold">Placement Portal</NavLink>
                        <div className="flex items-baseline space-x-4">
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

                    <div className="flex items-center space-x-4">
                         <span className="text-slate-400 text-sm">
                            {user ? `Welcome, ${user.name.first}` : 'Loading...'}
                         </span>
                        <div className="bg-slate-800 p-1 rounded-lg flex space-x-1">
                            <button
                                onClick={() => handleRoleChange('student')}
                                className={`px-3 py-1 text-sm rounded-md ${role === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
                            >
                                Student
                            </button>
                            <button
                                onClick={() => handleRoleChange('coordinator')}
                                className={`px-3 py-1 text-sm rounded-md ${role === 'coordinator' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
                            >
                                Coordinator
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}