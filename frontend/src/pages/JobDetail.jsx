// src/pages/JobDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaBriefcase, FaGraduationCap, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function JobDetail() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/jobs/${id}`)
            .then(res => {
                setJob(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleApply = () => {
        api.post('/applications', { job_id: id })
            .then(res => {
                toast.success("Successfully applied!");
            })
            .catch(err => {
                toast.error(err.response?.data?.error || "Failed to apply.");
            });
    };

    if (loading) return <p>Loading job details...</p>;
    if (!job) return <p>Job not found.</p>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-indigo-600 font-semibold">{job.company}</p>
                    <h1 className="text-3xl font-bold text-gray-900 mt-1">{job.title}</h1>
                </div>
                <button 
                    onClick={handleApply}
                    className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
                >
                    Apply Now
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Job Description</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                    
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mt-8 mb-4">Tech Stack</h2>
                    <div className="flex flex-wrap gap-3">
                        {job.tech_stack.map(skill => (
                            <span key={skill} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">{skill}</span>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="md:col-span-1">
                    <div className="bg-slate-50 p-6 rounded-lg border">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Job Overview</h3>
                        <div className="space-y-4 text-gray-700">
                             <div className="flex items-start">
                                <FaBriefcase className="mr-3 mt-1 text-gray-500" />
                                <div><strong>Type:</strong> {job.type}</div>
                            </div>
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="mr-3 mt-1 text-gray-500" />
                                <div><strong>Location:</strong> {job.location}</div>
                            </div>
                            <div className="flex items-start">
                                <FaMoneyBillWave className="mr-3 mt-1 text-gray-500" />
                                <div><strong>Salary:</strong> {job.stipend ? `₹${job.stipend}/month` : `₹${job.ctc}/annum`}</div>
                            </div>
                            <div className="flex items-start">
                                <FaClock className="mr-3 mt-1 text-gray-500" />
                                <div><strong>Apply by:</strong> {new Date(job.deadline).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 mt-6 pt-4 border-t mb-4">Eligibility</h3>
                         <div className="space-y-3 text-gray-700 text-sm">
                             <div className="flex items-center">
                                <FaGraduationCap className="mr-3 text-gray-500" />
                                <span>CGPA: {job.eligibility.min_cgpa}+</span>
                            </div>
                            <div className="flex items-center">
                                {job.eligibility.backlogs_allowed ? 
                                    <FaCheckCircle className="mr-3 text-green-500" /> : 
                                    <FaTimesCircle className="mr-3 text-red-500" />}
                                <span>Backlogs: {job.eligibility.backlogs_allowed ? 'Allowed' : 'Not Allowed'}</span>
                            </div>
                             <div className="flex items-start">
                                <FaGraduationCap className="mr-3 mt-1 text-gray-500" />
                                <div><strong>Branches:</strong> {job.eligibility.branches.join(', ')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JobDetail;