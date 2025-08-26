import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export default function JobDetail() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isApplying, setIsApplying] = useState(false);
    const { user, role } = useAuth();

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await api.get(`/jobs/${id}`);
                setJob(response.data);
            } catch (error) {
                console.error("Failed to fetch job details", error);
                toast.error('Job not found.');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleApply = async () => {
        setIsApplying(true);
        try {
            await api.post('/applications', { job_id: id });
            toast.success('Successfully applied!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to apply.');
        } finally {
            setIsApplying(false);
        }
    };

    if (loading) return <p className="text-center">Loading job details...</p>;
    if (!job) return <p className="text-center">Job not found.</p>;

    const eligibility = job.eligibility || {};

    return (
        <div className="bg-white border border-slate-200 p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
            <p className="text-xl text-slate-700 mt-1">{job.company}</p>
            <p className="text-md text-slate-500 mt-2">{job.location} • {job.type}</p>
            
            <div className="mt-6 flex flex-wrap gap-2">
                {job.tech_stack.map(tech => (
                    <span key={tech} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">{tech}</span>
                ))}
            </div>

            {role === 'student' && (
                <div className="mt-8">
                    <button
                        onClick={handleApply}
                        disabled={isApplying}
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition duration-300"
                    >
                        {isApplying ? 'Applying...' : 'Easy Apply'}
                    </button>
                    {!user?.resume_url && <p className="text-red-600 text-sm mt-2">You must add a resume URL to your profile to apply.</p>}
                </div>
            )}

            <div className="mt-10 border-t border-slate-200 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Job Description</h3>
                    <p className="mt-2 text-slate-600 whitespace-pre-wrap">{job.description}</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Details</h3>
                    <ul className="mt-2 space-y-2 text-slate-600">
                        <li><strong>Deadline:</strong> {format(new Date(job.deadline), 'PPPp')}</li>
                        {job.ctc && <li><strong>CTC:</strong> ₹{job.ctc.toLocaleString('en-IN')} / year</li>}
                        {job.stipend && <li><strong>Stipend:</strong> ₹{job.stipend.toLocaleString('en-IN')} / month</li>}
                    </ul>

                    <h3 className="text-lg font-semibold text-slate-800 mt-6">Eligibility</h3>
                    <ul className="mt-2 space-y-2 text-slate-600 list-disc list-inside">
                        {eligibility.min_cgpa && <li>Minimum CGPA: {eligibility.min_cgpa}</li>}
                        {eligibility.min_percentage && <li>Minimum Percentage: {eligibility.min_percentage}%</li>}
                        {eligibility.branches?.length > 0 && <li>Eligible Branches: {eligibility.branches.join(', ')}</li>}
                        {'backlogs_allowed' in eligibility && <li>Backlogs Allowed: {eligibility.backlogs_allowed ? 'Yes' : 'No'}</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
}