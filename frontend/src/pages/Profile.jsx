// src/pages/Profile.jsx

import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaGraduationCap, FaSchool, FaPercentage, FaLink, FaGithub, FaLinkedin } from 'react-icons/fa';

function Profile() {
    const { user, setUser } = useAuth();
    const [profileData, setProfileData] = useState(user);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setProfileData(user);
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'first' || name === 'last') {
            setProfileData(prev => ({ ...prev, name: { ...prev.name, [name]: value } }));
        } else if (name === 'github' || name === 'linkedin') {
            // Handle nested links object
            setProfileData(prev => ({ ...prev, links: { ...prev.links, [name]: value } }));
        } else {
            setProfileData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/me', profileData);
            setUser(res.data);
            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to update profile.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to render fields for either viewing or editing
    const renderField = (label, name, value, icon, type = 'text') => (
        <div>
            <label className="block text-sm font-medium text-gray-600 flex items-center mb-1">
                {icon}
                <span className="ml-2">{label}</span>
            </label>
            {isEditing ? (
                <input
                    type={type}
                    name={name}
                    value={value || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            ) : (
                <p className="text-gray-800 text-lg min-h-[2.5rem] flex items-center">{value || 'Not set'}</p>
            )}
        </div>
    );

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition mt-4 sm:mt-0"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            <form onSubmit={handleSave}>
                {/* Personal Details Section */}
                <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderField("First Name", "first", profileData.name?.first, <FaUser />)}
                        {renderField("Last Name", "last", profileData.name?.last, <FaUser />)}
                        {renderField("Email", "email", profileData.email, <FaEnvelope />)}
                        {renderField("Phone", "phone", profileData.phone, <FaPhone />)}
                        {renderField("Date of Birth", "dob", profileData.dob, <FaBirthdayCake />, 'date')}
                    </div>
                </div>

                {/* Academic Details Section */}
                <div className="border-t pt-6 mt-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Academic Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {renderField("Degree", "degree", profileData.degree, <FaGraduationCap />)}
                        {renderField("Branch", "branch", profileData.branch, <FaGraduationCap />)}
                        {renderField("College", "college", profileData.college, <FaSchool />)}
                        {renderField("UG CGPA", "ug_cgpa", profileData.ug_cgpa, <FaPercentage />, 'number')}
                        {renderField("12th Percentage", "twelfth_percentage", profileData.twelfth_percentage, <FaPercentage />, 'number')}
                        {renderField("10th Percentage", "tenth_percentage", profileData.tenth_percentage, <FaPercentage />, 'number')}
                    </div>
                </div>

                {/* Professional Details Section */}
                <div className="border-t pt-6 mt-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Professional Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {renderField("Resume URL", "resume_url", profileData.resume_url, <FaLink />)}
                        {renderField("GitHub URL", "github", profileData.links?.github, <FaGithub />)}
                        {renderField("LinkedIn URL", "linkedin", profileData.links?.linkedin, <FaLinkedin />)}
                    </div>
                </div>


                {isEditing && (
                    <div className="mt-8 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => { setIsEditing(false); setProfileData(user); }}
                            className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition disabled:bg-green-300"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default Profile;