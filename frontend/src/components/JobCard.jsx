import { Link } from 'react-router-dom';
import { formatDistanceToNow, differenceInHours } from 'date-fns';

export default function JobCard({ job }) {
    const deadline = new Date(job.deadline);
    const isClosingSoon = differenceInHours(deadline, new Date()) < 24;

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-semibold text-slate-800">{job.title}</h3>
                        <p className="text-slate-600">{job.company}</p>
                        <p className="text-sm text-slate-500 mt-1">{job.location} • {job.type}</p>
                    </div>
                    {isClosingSoon && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Closing Soon
                        </span>
                    )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {job.tech_stack.slice(0, 4).map(tech => (
                        <span key={tech} className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">{tech}</span>
                    ))}
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <p className="text-sm text-slate-500">
                        Deadline: {formatDistanceToNow(deadline, { addSuffix: true })}
                    </p>
                    <Link to={`/jobs/${job._id}`} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}