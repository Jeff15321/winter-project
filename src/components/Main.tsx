import React, { useEffect, useState } from 'react';
import { NodeTemplate } from '../types/NodeType';
import { BaseNode } from '../components/BaseNode';
import Whiteboard from '../components/Whiteboard';
import Sidebar from '../components/Sidebar';
import Home from '../components/Home';
import Login from '../components/Login';
import Signup from './Signup';
import { useUser } from '../contexts/UserContext';
import { Project } from '../types/NodeType';
import NewProjectModal from './NewProjectModal';
import { newProject } from '../services/api';
import { fetchAllProjects } from '../services/api';
import { nodeTemplates } from '../types/NodeType';


const Main: React.FC = () => {
    //user varaibles
    const { user, setUser } = useUser();

    //authentication varaibles
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSignup, setIsSignup] = useState(false);

    //sidebar varaibles
    const [isMenuMode, setIsMenuMode] = useState(true);
    const [currentSection, setCurrentSection] = useState<'home' | 'nodes' | 'settings' | 'code' | 'data' | 'docs' | 'account'>('home');
    
    //home varaibles
    const [currentView, setCurrentView] = useState<'home' | 'whiteboard'>('home');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [homeProjects, setHomeProjects] = useState<Project[]>([]);

    useEffect(() => {
        if (localStorage.getItem('user')) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(user);
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = async (user: object) => {
        // Add your authentication logic here
        // For now, just simulate a successful login
        
        setIsAuthenticated(true);
    };

    const handleSignup = (userData: { email: string; id: string }) => {
        setIsAuthenticated(true);
    };

    if (!isAuthenticated) {
        return isSignup ? (
            <Signup onSignup={handleSignup} />
        ) : (
            <Login 
                onLogin={handleLogin} 
                onSignupClick={() => setIsSignup(true)}
            />
        );
    }

    const handleCreateProject = async (projectName: string, collaborators: any[], isPublic: boolean) => {
        try {
            const response = await newProject(user?.id || '', projectName, collaborators, isPublic);
            if (user) {
                const updatedProjects = await fetchAllProjects(user.id);
                setHomeProjects(updatedProjects);
            }
            setIsModalOpen(false);
            console.log(response);
            return response;
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    };
    
    return (
        <div className="w-full h-screen bg-gray-100 whiteboard">
            <Sidebar 
                nodeTemplates={nodeTemplates} 
                isHome={true}
                isMenuMode={isMenuMode}
                setIsMenuMode={setIsMenuMode}
                currentSection={currentSection}
                setCurrentSection={setCurrentSection}
            />

            <Home 
                setIsModalOpen={setIsModalOpen}
                projects={homeProjects}
                setProjects={setHomeProjects}
            />

            <NewProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreateProject={handleCreateProject}
            />
    </div>
    );
};

export default Main;