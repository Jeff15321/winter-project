import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Whiteboard from '../../components/Whiteboard';
import Sidebar from '../../components/Sidebar';
import { NodeTemplate, nodeTemplates, Project } from '../../types/NodeType';
import { openWhiteBoard, newProject, fetchAllProjects } from '../../services/api';
import { useProject } from '../../contexts/ProjectContext';
import { useUser } from '@/src/contexts/UserContext';
import Signup from '@/src/components/Signup';
import Login from '@/src/components/Login';
import Home from '@/src/components/Home';
import NewProjectModal from '@/src/components/NewProjectModal';


const WhiteboardPage: React.FC = () => {
    const router = useRouter();
    const { project_id } = router.query;
    const { project, setProject } = useProject();
    const { user, setUser } = useUser();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [isMenuMode, setIsMenuMode] = useState(false);
    const [currentSection, setCurrentSection] = useState<'home' | 'nodes' | 'settings' | 'code' | 'data' | 'docs' | 'account'>('nodes');

    useEffect(() => {
        if (localStorage.getItem('user')) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            setUser(user);
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (user && project_id) {
            setProject(null);
            openWhiteBoard(user.id, project_id as string)
                .then(projectData => {
                    if (projectData) {
                        setProject(projectData);
                    } else {
                        console.error('Project not found');
                        // router.push('/error');
                    }
                });
        }
    }, [user, project_id]);

    const handleLogin = async (user: object) => {
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
    
    return (
        <div className="w-full h-screen bg-gray-100 whiteboard">
            <Sidebar 
                nodeTemplates={nodeTemplates} 
                isHome={false}
                isMenuMode={isMenuMode}
                setIsMenuMode={setIsMenuMode}
                currentSection={currentSection}
                setCurrentSection={setCurrentSection}
            />
            <Whiteboard 
                nodeTemplates={nodeTemplates}
                onExecute={(nodes, connections) => console.log('Executing:', { nodes, connections })}
                setCurrentView={() => {}}
            />
        </div>
    );
};

export default WhiteboardPage;