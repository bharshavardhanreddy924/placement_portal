// src/pages/CoordApplicants.jsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api'; // Corrected from '../api/axios'
import toast from 'react-hot-toast';
// Assuming you have these components. If not, they can be simple placeholders.
import Spinner from '../components/Spinner'; 
import StatusChip from '../components/StatusChip';

function CoordApplicants() {
    const { id } = useParams();
    const [applications, setApplications] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchApplicants = async () => {
        try {
            // Fetch both applications and job details concurrently
            const [appsResponse, jobResponse] = await Promise.all([
                api.get(`/jobs/${id}/applications`),
                api.get(`/jobs/${id}`)
            ]);
            setApplications(appsResponse.data);
            setJob(jobResponse.data);
        } catch (error) {
            toast.error("Failed to load applicant data.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicants();
    }, [id]);

    const handleStatusChange = async (appId, newStatus) => {
        const promise = api.put(`/applications/${appId}/status`, { status: newStatus });

        toast.promise(promise, {
            loading: 'Updating status...',
            success: 'Status updated successfully!',
            error: 'Failed to update status.'
        });

        try {
            await promise;
            // Refresh data after update to show the new status
            fetchApplicants();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    // The rest of the component remains the same...
    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800">Applicants for {job?.title}</h1>
            <p className="text-slate-600 mb-6">{job?.company}</p>

            {applications.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Branch</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CGPA/%</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Resume</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {applications.map((app) => (
                                <tr key={app._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{app.profile_snapshot.name.first} {app.profile_snapshot.name.last}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{app.profile_snapshot.branch}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{app.profile_snapshot.ug_cgpa || app.profile_snapshot.ug_percentage}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <a href={app.profile_snapshot.resume_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium">
                                            View
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <StatusChip status={app.status} />
                                    </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <select
                                            className="form-select text-xs rounded-md border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                                            value={app.status}
                                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                        >
                                            <option>Applied</option>
                                            <option>Shortlisted</option>
                                            <option>Rejected</option>
                                            <option>Offer</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-slate-500 py-8">No applications have been received for this job yet.</p>
            )}
        </div>
    );
}

export default CoordApplicants;
