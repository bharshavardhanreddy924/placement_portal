import React from 'react';

function Spinner() {
    return (
        <div 
            className="w-8 h-8 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin" 
            role="status"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}

export default Spinner;