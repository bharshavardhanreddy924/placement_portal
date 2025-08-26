export default function StatusChip({ status }) {
    const statusStyles = {
        Applied: 'bg-blue-100 text-blue-800',
        Shortlisted: 'bg-yellow-100 text-yellow-800',
        Rejected: 'bg-red-100 text-red-800',
        Offer: 'bg-green-100 text-green-800',
    };

    return (
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
}