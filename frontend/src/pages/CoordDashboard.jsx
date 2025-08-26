// src/pages/CoordDashboard.jsx

import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaUsers } from 'react-icons/fa';

function CoordDashboard() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = () => {
        setLoading(true);
        api.get('/coord/jobs')
            .then(res => setJobs(res.data))
            .catch(err => console.error("Failed to fetch jobs:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDelete = (jobId) => {
        if (window.confirm("Are you sure you want to delete this job and all its applications?")) {
            api.delete(`/jobs/${jobId}`)
                .then(res => {
                    toast.success("Job deleted successfully!");
                    fetchJobs(); // Refresh the list
                })
                .catch(err => {
                    toast.error("Failed to delete job.");
                    console.error(err);
                });
        }
    };

    if (loading) return <p>Loading dashboard...</p>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Job Postings</h1>
                <Link to="/coord/jobs/new" className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700">
                    Post New Job
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left py-3 px-4 font-semibold text-sm">Job Title</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm">Applicants</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm">Deadline</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {jobs.map(job => (
                            <tr key={job._id} className="border-b">
                                <td className="py-3 px-4">{job.title} <br/><span className="text-xs text-gray-500">{job.company}</span></td>
                                <td className="py-3 px-4">{job.application_count}</td>
                                <td className="py-3 px-4">{new Date(job.deadline).toLocaleDateString()}</td>
                                <td className="py-3 px-4 flex items-center space-x-3">
                                    <Link to={`/coord/jobs/${job._id}/applicants`} title="View Applicants" className="text-blue-500 hover:text-blue-700">
                                        <FaUsers />
                                    </Link>
                                    <Link to={`/coord/jobs/${job._id}/edit`} title="Edit Job" className="text-yellow-500 hover:text-yellow-700">
                                        <FaEdit />
                                    </Link>
                                    <button onClick={() => handleDelete(job._id)} title="Delete Job" className="text-red-500 hover:text-red-700">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CoordDashboard;