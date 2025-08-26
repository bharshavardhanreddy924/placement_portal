// src/pages/CoordCreateJob.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Corrected from '../api/axios'
import toast from 'react-hot-toast';

function CoordCreateJob() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        type: 'Full-time',
        location: '',
        ctc: '',
        stipend: '',
        tech_stack: [],
        deadline: '',
        description: '',
        eligibility: {
            min_cgpa: '',
            min_percentage: '',
            branches: [],
            backlogs_allowed: true,
        },
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEligibilityChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            eligibility: {
                ...prev.eligibility,
                [name]: type === 'checkbox' ? checked : value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const jobData = {
          ...formData,
          tech_stack: formData.tech_stack.toString().split(',').map(s => s.trim()).filter(Boolean),
          ctc: formData.ctc ? Number(formData.ctc) : null,
          stipend: formData.stipend ? Number(formData.stipend) : null,
          eligibility: {
            ...formData.eligibility,
            min_cgpa: formData.eligibility.min_cgpa ? Number(formData.eligibility.min_cgpa) : null,
            min_percentage: formData.eligibility.min_percentage ? Number(formData.eligibility.min_percentage) : null,
            branches: formData.eligibility.branches.toString().split(',').map(s => s.trim()).filter(Boolean),
          }
        };

        try {
            const response = await api.post('/jobs', jobData);
            toast.success('Job created successfully!');
            navigate(`/coord/dashboard`); // Navigate to dashboard after creation
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create job.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // The rest of the component remains the same...
    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Create New Job Posting</h1>
                
                <div className="space-y-4">
                    <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Job Title (e.g., Software Engineer)" className="form-input w-full" required />
                    <input name="company" value={formData.company} onChange={handleInputChange} placeholder="Company Name" className="form-input w-full" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="type" value={formData.type} onChange={handleInputChange} className="form-select w-full">
                            <option value="Full-time">Full-time</option>
                            <option value="Internship">Internship</option>
                        </select>
                        <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Location (e.g., Bangalore)" className="form-input w-full" required />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="ctc" type="number" value={formData.ctc} onChange={handleInputChange} placeholder="Annual CTC (LPA)" className="form-input w-full" />
                        <input name="stipend" type="number" value={formData.stipend} onChange={handleInputChange} placeholder="Monthly Stipend (for Internship)" className="form-input w-full" />
                    </div>
                    <input name="tech_stack" value={formData.tech_stack} onChange={e => setFormData({...formData, tech_stack: e.target.value})} placeholder="Tech Stack (comma-separated, e.g., React, Python)" className="form-input w-full" />
                    <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Job Description" className="form-input w-full min-h-32" />
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Application Deadline</label>
                        <input name="deadline" type="datetime-local" value={formData.deadline} onChange={handleInputChange} className="form-input w-full mt-1" required />
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                 <h2 className="text-xl font-bold text-slate-800 mb-6">Eligibility Criteria</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="min_cgpa" type="number" step="0.1" value={formData.eligibility.min_cgpa} onChange={handleEligibilityChange} placeholder="Minimum CGPA (e.g., 7.5)" className="form-input w-full" />
                    <input name="min_percentage" type="number" step="0.1" value={formData.eligibility.min_percentage} onChange={handleEligibilityChange} placeholder="Minimum Percentage (e.g., 75)" className="form-input w-full" />
                    <div className="md:col-span-2">
                        <input name="branches" value={formData.eligibility.branches} onChange={(e) => handleEligibilityChange({ target: { name: 'branches', value: e.target.value } })} placeholder="Eligible Branches (comma-separated)" className="form-input w-full" />
                    </div>
                    <label className="flex items-center space-x-2 md:col-span-2">
                        <input name="backlogs_allowed" type="checkbox" checked={formData.eligibility.backlogs_allowed} onChange={handleEligibilityChange} className="form-checkbox h-5 w-5" />
                        <span>Allow candidates with standing backlogs</span>
                    </label>
                 </div>
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition duration-300">
                    {isSubmitting ? 'Posting Job...' : 'Post Job'}
                </button>
            </div>
        </form>
    );
}

export default CoordCreateJob;
