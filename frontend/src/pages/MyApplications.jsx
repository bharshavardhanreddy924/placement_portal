// src/pages/MyApplications.jsx

import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get('/applications')
            .then(res => {
                setApplications(res.data);
            })
            .catch(err => {
                console.error("Failed to fetch applications:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p className="text-center text-gray-600">Loading your applications...</p>;
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Applications</h1>
            
            {applications.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">You haven't applied to any jobs yet.</p>
                    <Link to="/jobs" className="mt-4 inline-block bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition">
                        Browse Jobs
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map(app => (
                        <div key={app._id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                            <div>
                                <h2 className="font-bold text-xl text-gray-800">{app.job?.title || 'Job Title'}</h2>
                                <p className="text-gray-600">{app.job?.company || 'Company'}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Applied on: {new Date(app.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <span 
                                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                        app.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                                        app.status === 'Shortlisted' ? 'bg-yellow-100 text-yellow-800' :
                                        app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-green-100 text-green-800' // Hired
                                    }`}
                                >
                                    {app.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyApplications;