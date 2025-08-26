import { useState, useEffect } from 'react';
import api from '../api/axios';
import StatusChip from '../components/StatusChip';
import { format } from 'date-fns';

export default function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await api.get('/applications');
                setApplications(response.data);
            } catch (error) {
                console.error("Failed to fetch applications", error);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    if (loading) return <p className="text-center">Loading your applications...</p>;

    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">My Applications</h1>
            {applications.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Applied On</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {applications.map((app) => (
                                <tr key={app._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{app.job?.company}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{app.job?.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{format(new Date(app.created_at), 'PP')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <StatusChip status={app.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-slate-500 py-8">You haven't applied to any jobs yet.</p>
            )}
        </div>
    );
}