// src/pages/CoordEditJob.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

function CoordEditJob() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState(null);

    // Effect to fetch the job data when the component mounts
    useEffect(() => {
        api.get(`/jobs/${id}`)
            .then(res => {
                const job = res.data;
                // Format data to be compatible with form inputs
                const deadline = new Date(job.deadline);
                deadline.setMinutes(deadline.getMinutes() - deadline.getTimezoneOffset());
                
                setFormData({
                    ...job,
                    deadline: deadline.toISOString().slice(0, 16),
                    tech_stack: job.tech_stack?.join(', ') || '',
                    eligibility: {
                        ...job.eligibility,
                        branches: job.eligibility?.branches?.join(', ') || ''
                    }
                });
            })
            .catch(err => {
                toast.error("Failed to load job data.");
                console.error(err);
                navigate('/coord/dashboard');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    // Handler for general input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler for nested eligibility object changes
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

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Prepare data for the API by converting strings back to numbers/arrays
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
            await api.put(`/jobs/${id}`, jobData);
            toast.success('Job updated successfully!');
            navigate('/coord/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update job.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !formData) {
        return <div className="text-center py-10">Loading job editor...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Edit Job Posting</h1>
                
                <div className="space-y-4">
                    <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Job Title" className="form-input w-full" required />
                    <input name="company" value={formData.company} onChange={handleInputChange} placeholder="Company Name" className="form-input w-full" required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="type" value={formData.type} onChange={handleInputChange} className="form-select w-full">
                            <option value="Full-time">Full-time</option>
                            <option value="Internship">Internship</option>
                        </select>
                        <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Location" className="form-input w-full" required />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="ctc" type="number" value={formData.ctc || ''} onChange={handleInputChange} placeholder="Annual CTC (LPA)" className="form-input w-full" />
                        <input name="stipend" type="number" value={formData.stipend || ''} onChange={handleInputChange} placeholder="Monthly Stipend" className="form-input w-full" />
                    </div>
                    <input name="tech_stack" value={formData.tech_stack} onChange={handleInputChange} placeholder="Tech Stack (comma-separated)" className="form-input w-full" />
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
                    <input name="min_cgpa" type="number" step="0.1" value={formData.eligibility.min_cgpa || ''} onChange={handleEligibilityChange} placeholder="Minimum CGPA" className="form-input w-full" />
                    <input name="min_percentage" type="number" step="0.1" value={formData.eligibility.min_percentage || ''} onChange={handleEligibilityChange} placeholder="Minimum Percentage" className="form-input w-full" />
                    <div className="md:col-span-2">
                        <input name="branches" value={formData.eligibility.branches} onChange={handleEligibilityChange} placeholder="Eligible Branches (comma-separated)" className="form-input w-full" />
                    </div>
                    <label className="flex items-center space-x-2 md:col-span-2">
                        <input name="backlogs_allowed" type="checkbox" checked={formData.eligibility.backlogs_allowed} onChange={handleEligibilityChange} className="form-checkbox h-5 w-5" />
                        <span>Allow candidates with standing backlogs</span>
                    </label>
                 </div>
            </div>

            <div className="flex justify-end space-x-4">
                <button type="button" onClick={() => navigate('/coord/dashboard')} className="px-8 py-3 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300 transition duration-300">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition duration-300">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}

export default CoordEditJob;
