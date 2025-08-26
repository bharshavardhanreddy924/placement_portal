// src/pages/JobsList.jsx

import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaMoneyBillWave, FaClock } from 'react-icons/fa';

// A sub-component for displaying a single job card
const JobCard = ({ job }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-indigo-600 font-semibold">{job.company}</p>
                    <h3 className="text-xl font-bold text-gray-800 mt-1">{job.title}</h3>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${job.type === 'Internship' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {job.type}
                </span>
            </div>
            
            <div className="mt-4 flex flex-col space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    <span>{job.location}</span>
                </div>
                <div className="flex items-center">
                    <FaMoneyBillWave className="mr-2 text-gray-400" />
                    <span>{job.stipend ? `₹${job.stipend}/month` : `₹${job.ctc}/annum`}</span>
                </div>
                <div className="flex items-center">
                    <FaClock className="mr-2 text-gray-400" />
                    <span>Apply by: {new Date(job.deadline).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {job.tech_stack.slice(0, 4).map(skill => (
                    <span key={skill} className="bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded-md">{skill}</span>
                ))}
            </div>
        </div>
        <div className="bg-gray-50 px-6 py-4">
            <Link to={`/jobs/${job._id}`} className="w-full text-center block bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 transition-colors duration-300">
                View Details
            </Link>
        </div>
    </div>
);

function JobsList() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/jobs')
            .then(res => {
                setJobs(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading jobs...</p>;

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Find Your Next Opportunity</h1>
                <p className="text-gray-600 mt-1">Search for jobs and internships from top companies.</p>
                <div className="mt-4">
                    <input 
                        type="text"
                        placeholder="Search by title, company, or tech stack..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {jobs.map(job => (
                    <JobCard key={job._id} job={job} />
                ))}
            </div>
        </div>
    );
}

export default JobsList;