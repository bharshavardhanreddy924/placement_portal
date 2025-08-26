// src/pages/CoordEditJob.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

function CoordEditJob() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [jobData, setJobData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the existing job data to populate the form
        api.get(`/jobs/${id}`)
            .then(res => {
                // Format deadline for the datetime-local input
                const deadline = new Date(res.data.deadline);
                deadline.setMinutes(deadline.getMinutes() - deadline.getTimezoneOffset());
                res.data.deadline = deadline.toISOString().slice(0, 16);
                setJobData(res.data);
                setLoading(false);
            })
            .catch(err => {
                toast.error("Failed to load job data.");
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setJobData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        api.put(`/jobs/${id}`, jobData)
            .then(res => {
                toast.success("Job updated successfully!");
                navigate('/coord/dashboard');
            })
            .catch(err => {
                toast.error("Failed to update job.");
                console.error(err);
            });
    };

    if (loading) return <p>Loading job editor...</p>;
    if (!jobData) return <p>Job not found.</p>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Job Posting</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Add all your form fields here, similar to your 'Create Job' page */}
                <div>
                    <label className="block text-sm font-medium">Job Title</label>
                    <input type="text" name="title" value={jobData.title} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Company</label>
                    <input type="text" name="company" value={jobData.company} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Deadline</label>
                    <input type="datetime-local" name="deadline" value={jobData.deadline} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea name="description" value={jobData.description} onChange={handleChange} rows="5" className="w-full mt-1 p-2 border rounded-md"></textarea>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CoordEditJob;