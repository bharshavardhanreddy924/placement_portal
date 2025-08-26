import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';

function ExperienceCard({ experience, onEdit, onDelete }) {
    return (
        <div className="border border-slate-200 rounded-lg p-4 mb-4 bg-white">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-lg text-slate-800">{experience.title}</h4>
                    <p className="text-primary-600 font-semibold">{experience.company}</p>
                    <p className="text-sm text-slate-500 mt-1">
                        {new Date(experience.start_date).toLocaleDateString()} - {experience.is_current ? 'Present' : new Date(experience.end_date).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={onEdit} className="text-sm text-primary-600 hover:text-primary-800 font-medium">Edit</button>
                    <button onClick={onDelete} className="text-sm text-red-600 hover:text-red-800 font-medium">Delete</button>
                </div>
            </div>
            {experience.summary && <p className="mt-2 text-slate-600">{experience.summary}</p>}
        </div>
    );
}

function Profile() {
    const { user, loading, refetchUser } = useAuth();
    const [formData, setFormData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showExpModal, setShowExpModal] = useState(false);
    const [editingExperience, setEditingExperience] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({ ...user });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.put('/me', formData);
            toast.success('Profile updated successfully!');
            refetchUser();
        } catch (error) {
            toast.error('Failed to update profile.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveExperience = async (expData) => {
        const promise = editingExperience?._id
            ? api.put(`/me/experience/${editingExperience._id}`, expData)
            : api.post('/me/experience', expData);

        toast.promise(promise, {
            loading: 'Saving experience...',
            success: 'Experience saved successfully!',
            error: 'Failed to save experience.'
        });

        try {
            await promise;
            refetchUser();
            setShowExpModal(false);
            setEditingExperience(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteExperience = async (expId) => {
        if (window.confirm('Are you sure you want to delete this experience?')) {
            const promise = api.delete(`/me/experience/${expId}`);
            toast.promise(promise, {
                loading: 'Deleting experience...',
                success: 'Experience deleted.',
                error: 'Failed to delete experience.'
            });

            try {
                await promise;
                refetchUser();
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (loading || !formData) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    return (
        <>
            <form onSubmit={handleSaveProfile} className="space-y-8">
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name.first" value={formData.name.first} onChange={(e) => handleNestedChange('name', 'first', e.target.value)} placeholder="First Name" className="form-input" />
                        <input name="name.last" value={formData.name.last} onChange={(e) => handleNestedChange('name', 'last', e.target.value)} placeholder="Last Name" className="form-input" />
                        <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" className="form-input" />
                        <input name="dob" type="date" value={formData.dob} onChange={handleInputChange} placeholder="Date of Birth" className="form-input" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Academics & Skills</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="ug_cgpa" type="number" step="0.01" value={formData.ug_cgpa} onChange={handleInputChange} placeholder="UG CGPA" className="form-input" />
                        <input name="ug_percentage" type="number" step="0.01" value={formData.ug_percentage} onChange={handleInputChange} placeholder="UG Percentage" className="form-input" />
                         <input name="resume_url" value={formData.resume_url} onChange={handleInputChange} placeholder="Resume URL (Required to apply)" className="form-input md:col-span-2" />
                         <input name="skills" value={formData.skills.join(', ')} onChange={(e) => setFormData(prev => ({...prev, skills: e.target.value.split(',').map(s => s.trim())}))} placeholder="Skills (comma-separated)" className="form-input md:col-span-2" />
                    </div>
                </div>
                
                <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-primary-300 transition duration-300">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Experience</h2>
                    <button onClick={() => { setEditingExperience(null); setShowExpModal(true); }} className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-md hover:bg-primary-700 transition duration-300">
                        Add Experience
                    </button>
                </div>
                {formData.experience?.length > 0 ? (
                    formData.experience.map(exp => (
                        <ExperienceCard 
                            key={exp._id}
                            experience={exp} 
                            onEdit={() => { setEditingExperience(exp); setShowExpModal(true); }}
                            onDelete={() => handleDeleteExperience(exp._id)}
                        />
                    ))
                ) : (
                    <p className="text-slate-500 text-center py-4">No experience added yet.</p>
                )}
            </div>

            {showExpModal && (
                <ExperienceModal 
                    experience={editingExperience}
                    onClose={() => setShowExpModal(false)}
                    onSave={handleSaveExperience}
                />
            )}
        </>
    );
}

function ExperienceModal({ experience, onClose, onSave }) {
    const [expData, setExpData] = useState(experience || {
        type: 'Internship', company: '', title: '', start_date: '', end_date: '', is_current: false, summary: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setExpData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(expData);
    };

    return (
        <Modal title={experience ? "Edit Experience" : "Add Experience"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="title" value={expData.title} onChange={handleChange} placeholder="Title / Role" className="form-input w-full" required />
                <input name="company" value={expData.company} onChange={handleChange} placeholder="Company / Organization" className="form-input w-full" required />
                <textarea name="summary" value={expData.summary} onChange={handleChange} placeholder="Brief summary..." className="form-input w-full min-h-24"></textarea>
                <div className="grid grid-cols-2 gap-4">
                    <input name="start_date" type="date" value={expData.start_date} onChange={handleChange} className="form-input" required />
                    <input name="end_date" type="date" value={expData.end_date} onChange={handleChange} className="form-input" disabled={expData.is_current} />
                </div>
                <label className="flex items-center space-x-2">
                    <input type="checkbox" name="is_current" checked={expData.is_current} onChange={handleChange} className="form-checkbox" />
                    <span>I am currently working here</span>
                </label>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700">Save</button>
                </div>
            </form>
        </Modal>
    );
}

export default Profile;