import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, Plus, Globe, Lock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { fetchAllUsers } from '../services/api';
import router from 'next/router';

interface Collaborator {
    email: string;
    id: string;
}

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateProject: (projectName: string, collaborators: Collaborator[], isPublic: boolean) => Promise<{ project_id: string }>;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreateProject }) => {
    const [projectName, setProjectName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [allUsers, setAllUsers] = useState<Collaborator[]>([]);
    const [selectedCollaborators, setSelectedCollaborators] = useState<Collaborator[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const { user } = useUser();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const inputRef = useRef<HTMLDivElement>(null);
    const [isPublic, setIsPublic] = useState(false);

    // Fetch all users when modal opens
    useEffect(() => {

        if (isOpen) {
            fetchAllUsers().then(users => setAllUsers(users));
        }
    }, [isOpen]);

    // Filter suggestions based on search input
    const suggestions = useMemo(() => {
        if (searchEmail.length < 2) return [];
        
        return allUsers.filter(u => 
            u.id !== user?.id && // Exclude current user
            !selectedCollaborators.some(c => c.id === u.id) && // Exclude selected collaborators
            u.email.toLowerCase().includes(searchEmail.toLowerCase()) // Filter by search term
        );
    }, [searchEmail, allUsers, user, selectedCollaborators]);

    // Handle clicks outside the input and dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAddCollaborator = (collaborator: Collaborator) => {
        setSelectedCollaborators(prev => [...prev, collaborator]);
        setSearchEmail('');
    };

    const handleRemoveCollaborator = (id: string) => {
        setSelectedCollaborators(prev => prev.filter(c => c.id !== id));
    };

    const handleSubmit = async () => {
        if (!projectName.trim()) return;

        setIsLoading(true);
        let response: { project_id: string } | undefined;
        try {
            response = await onCreateProject(projectName, selectedCollaborators, isPublic);
        } catch (error) {
            console.error("Failed to create project:", error);
            // Handle the error appropriately, e.g., show a notification to the user
        } finally {
            setIsLoading(false);
            if (response && response.project_id) {
                router.push(`/whiteboard/${response.project_id}`);
            }
        }
    };

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setProjectName('');
            setSearchEmail('');
            setSelectedCollaborators([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-[90%] max-w-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Create New Project</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Project Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Name
                        </label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter project name"
                        />
                    </div>

                    {/* Visibility Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Visibility
                        </label>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsPublic(false)}
                                className={`flex items-center px-4 py-2 rounded-md border ${
                                    !isPublic 
                                        ? 'bg-gray-100 border-gray-300 text-gray-900' 
                                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <Lock size={16} className="mr-2" />
                                Private
                            </button>
                            <button
                                onClick={() => setIsPublic(true)}
                                className={`flex items-center px-4 py-2 rounded-md border ${
                                    isPublic 
                                        ? 'bg-gray-100 border-gray-300 text-gray-900' 
                                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <Globe size={16} className="mr-2" />
                                Public
                            </button>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            {isPublic 
                                ? 'Anyone can view this project' 
                                : 'Only you and collaborators can access this project'}
                        </p>
                    </div>

                    {/* Collaborators Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Add Collaborators
                        </label>
                        <div ref={inputRef} className="relative w-full">
                            <input
                                type="email"
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                onFocus={() => setIsDropdownOpen(true)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search by email"
                            />
                            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />

                            {/* Suggestions Dropdown */}
                            {isDropdownOpen && suggestions.length > 0 && (
                                <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-[200px] overflow-y-auto z-10">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={suggestion.id}
                                            onClick={() => handleAddCollaborator(suggestion)}
                                            className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between
                                                ${index !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
                                        >
                                            <span className="truncate max-w-[calc(100%-2rem)]">{suggestion.email}</span>
                                            <Plus size={16} className="text-gray-500 flex-shrink-0 ml-2" />
                                        </button>
                                    ))}
                                    {suggestions.length > 5 && (
                                        <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border-t border-gray-100">
                                            Scroll for more suggestions
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected Collaborators */}
                        <div className="mt-2 space-y-2 w-full">
                            {selectedCollaborators.map(collaborator => (
                                <div
                                    key={collaborator.id}
                                    className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md"
                                >
                                    <span className="text-sm truncate max-w-[calc(100%-2rem)]">{collaborator.email}</span>
                                    <button
                                        onClick={() => handleRemoveCollaborator(collaborator.id)}
                                        className="text-gray-500 hover:text-red-500 flex-shrink-0"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Create Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !projectName.trim()}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium 
                            ${isLoading || !projectName.trim() 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                        {isLoading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewProjectModal; 