// src/pages/CoordDashboard.jsx

import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaUsers, FaPlus, FaBriefcase, FaUserFriends } from 'react-icons/fa';
import { FiClock } from 'react-icons/fi';

// A modal component for delete confirmation to provide a better user experience than window.confirm
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, jobTitle }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                <h2 className="text-lg font-bold text-slate-800">Confirm Deletion</h2>
                <p className="text-slate-600 my-4">
                    Are you sure you want to delete the job posting for "{jobTitle}"? This action will also delete all associated applications and cannot be undone.
                </p>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


function CoordDashboard() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobToDelete, setJobToDelete] = useState(null);

    const fetchJobs = () => {
        setLoading(true);
        api.get('/coord/jobs')
            .then(res => setJobs(res.data))
            .catch(err => {
                toast.error("Failed to fetch jobs.");
                console.error("Failed to fetch jobs:", err);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const openDeleteModal = (job) => {
        setJobToDelete(job);
    };

    const closeDeleteModal = () => {
        setJobToDelete(null);
    };

    const handleDelete = () => {
        if (!jobToDelete) return;

        const promise = api.delete(`/jobs/${jobToDelete._id}`);
        toast.promise(promise, {
            loading: 'Deleting job...',
            success: 'Job deleted successfully!',
            error: 'Failed to delete job.'
        });

        promise.then(() => {
            fetchJobs(); // Refresh the list after deletion
            closeDeleteModal();
        }).catch(err => {
            console.error(err);
            closeDeleteModal();
        });
    };

    // useMemo will recalculate stats only when the jobs array changes
    const stats = useMemo(() => {
        const totalJobs = jobs.length;
        const totalApplicants = jobs.reduce((acc, job) => acc + (job.application_count || 0), 0);
        const activeJobs = jobs.filter(job => new Date(job.deadline) > new Date()).length;
        return { totalJobs, totalApplicants, activeJobs };
    }, [jobs]);


    if (loading) {
        return <div className="text-center py-10">Loading dashboard...</div>;
    }

    // A reusable Stat Card component for the dashboard header
    const StatCard = ({ icon, title, value, color }) => (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <style>
                {`
                @keyframes fade-in-scale {
                    0% {
                        transform: scale(0.95);
                        opacity: 0;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.3s ease-out forwards;
                }
                `}
            </style>
            <DeleteConfirmationModal
                isOpen={!!jobToDelete}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                jobTitle={jobToDelete?.title}
            />

            {/* Header section with title and action button */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Coordinator Dashboard</h1>
                <Link to="/coord/jobs/new" className="inline-flex items-center justify-center sm:justify-start space-x-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-sm">
                    <FaPlus />
                    <span>Post New Job</span>
                </Link>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<FaBriefcase className="text-blue-500 h-6 w-6"/>} title="Total Jobs Posted" value={stats.totalJobs} color="bg-blue-100" />
                <StatCard icon={<FaUserFriends className="text-green-500 h-6 w-6"/>} title="Total Applications" value={stats.totalApplicants} color="bg-green-100" />
                <StatCard icon={<FiClock className="text-yellow-500 h-6 w-6"/>} title="Active Postings" value={stats.activeJobs} color="bg-yellow-100" />
            </div>

            {/* Jobs Table Card */}
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm">
                 <h2 className="text-xl font-bold text-slate-800 mb-6">My Job Postings</h2>
                 <div className="overflow-x-auto">
                    {jobs.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Job Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Applicants</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {jobs.map(job => {
                                    const isExpired = new Date(job.deadline) < new Date();
                                    return (
                                        <tr key={job._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-900">{job.title}</div>
                                                <div className="text-sm text-slate-500">{job.company}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {isExpired ? 'Expired' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-center font-medium">{job.application_count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(job.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-4">
                                                    <Link to={`/coord/jobs/${job._id}/applicants`} title="View Applicants" className="text-slate-500 hover:text-indigo-600 transition-colors">
                                                        <FaUsers size={18} />
                                                    </Link>
                                                    <Link to={`/coord/jobs/${job._id}/edit`} title="Edit Job" className="text-slate-500 hover:text-indigo-600 transition-colors">
                                                        <FaEdit size={18} />
                                                    </Link>
                                                    <button onClick={() => openDeleteModal(job)} title="Delete Job" className="text-slate-500 hover:text-red-600 transition-colors">
                                                        <FaTrash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12">
                            <FaBriefcase className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-2 text-lg font-medium text-slate-800">No jobs posted yet.</h3>
                            <p className="text-slate-500 mt-1">Click "Post New Job" to get started and manage your postings here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CoordDashboard;
