import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import JobCard from '../components/JobCard';

export default function JobsList() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ q: '', tech: '', location: '' });

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const response = await api.get('/jobs', { params: filters });
                setJobs(response.data);
            } catch (error) {
                console.error("Failed to fetch jobs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const techOptions = useMemo(() => {
        const allTechs = jobs.flatMap(job => job.tech_stack);
        return [...new Set(allTechs)].sort();
    }, [jobs]);


    return (
        <div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        name="q"
                        value={filters.q}
                        onChange={handleFilterChange}
                        placeholder="Search by title or company..."
                        className="form-input w-full"
                    />
                    <input
                        type="text"
                        name="location"
                        value={filters.location}
                        onChange={handleFilterChange}
                        placeholder="Filter by location..."
                        className="form-input w-full"
                    />
                     <select name="tech" value={filters.tech} onChange={handleFilterChange} className="form-select w-full">
                        <option value="">Filter by tech...</option>
                        {techOptions.map(tech => <option key={tech} value={tech}>{tech}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                            <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                            <div className="flex gap-2 mb-6">
                                <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
                                <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                            </div>
                            <div className="flex justify-between items-center">
                               <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                               <div className="h-10 w-28 bg-slate-200 rounded-md"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map(job => (
                        <JobCard key={job._id} job={job} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-slate-700">No jobs found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your filters or check back later.</p>
                </div>
            )}
        </div>
    );
}