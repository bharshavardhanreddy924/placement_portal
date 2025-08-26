// src/pages/JobsList.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext'; // Import useAuth to check user role
import { FaBriefcase, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaUsers } from 'react-icons/fa';

// A reusable component for displaying a single job card
const JobCard = ({ job, user }) => {
    // Determine the correct link based on the user's role
    const detailUrl = user?.role === 'coordinator' 
        ? `/coord/jobs/${job._id}/applicants` 
        : `/jobs/${job._id}`;

    const buttonText = user?.role === 'coordinator' ? 'View Applicants' : 'View Details';

    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-bold text-slate-800">{job.title}</h3>
                <p className="text-slate-600 font-medium flex items-center gap-2 mt-1"><FaBuilding /> {job.company}</p>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-2"><FaMapMarkerAlt /> {job.location}</p>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <FaCalendarAlt /> Deadline: {new Date(job.deadline).toLocaleDateString()}
                </p>
            </div>
            <div className="mt-4 flex justify-between items-center">
                {user?.role === 'coordinator' && (
                     <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                        <FaUsers />
                        <span>{job.application_count} Applicants</span>
                     </div>
                )}
                <Link to={detailUrl} className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 transition-colors">
                    {buttonText}
                </Link>
            </div>
        </div>
    );
};


function JobsList() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // Get the current user from the AuthContext

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        // Choose the API endpoint based on the user's role
        const endpoint = user?.role === 'coordinator' ? '/coord/jobs' : '/jobs';
        
        const fetchJobs = () => {
            api.get(endpoint)
                .then(res => {
                    if (isMounted) {
                        setJobs(res.data);
                    }
                })
                .catch(err => {
                    toast.error("Failed to fetch jobs.");
                    console.error("Failed to fetch jobs:", err);
                })
                .finally(() => {
                    if (isMounted) {
                        setLoading(false);
                    }
                });
        };

        fetchJobs();

        return () => {
            isMounted = false;
        };
    }, [user]); // Re-run the effect if the user object changes

    if (loading) {
        return <div className="text-center py-10">Loading jobs...</div>;
    }

    // Determine the title based on the user's role
    const pageTitle = user?.role === 'coordinator' ? 'My Job Postings' : 'Available Job Opportunities';

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800">{pageTitle}</h1>

            {jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map(job => (
                        <JobCard key={job._id} job={job} user={user} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <FaBriefcase className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-lg font-medium text-slate-800">
                        {user?.role === 'coordinator' ? 'No jobs posted yet' : 'No jobs available right now'}
                    </h3>
                    <p className="text-slate-500 mt-1">
                         {user?.role === 'coordinator' ? 'Click "Post a Job" to create a new listing.' : 'Please check back later for new opportunities.'}
                    </p>
                </div>
            )}
        </div>
    );
}

export default JobsList;
