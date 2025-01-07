import React, { useState } from 'react';
import { NodeTemplate, Node } from '../types/NodeType';
import { Menu, X, Settings, Code, Database, FileText, Home, User } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { useConnections } from '../contexts/ConnectionContext';
import { useUser } from '../contexts/UserContext';
import { useRouter } from 'next/router';
import { useGlobalZIndex } from '../contexts/GlobalZIndexContext';
interface SidebarProps {
    nodeTemplates: NodeTemplate[];
    isHome: boolean;
    isMenuMode: boolean;
    setIsMenuMode: (isMenuMode: boolean) => void;
    currentSection: 'home' | 'nodes' | 'settings' | 'code' | 'data' | 'docs' | 'account';
    setCurrentSection: (section: 'home' | 'nodes' | 'settings' | 'code' | 'data' | 'docs' | 'account') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ nodeTemplates, isHome, isMenuMode, setIsMenuMode, currentSection, setCurrentSection }) => {
    const { project, setProject } = useProject();
    const { connections, setConnections } = useConnections();
    const { user } = useUser();
    const router = useRouter();

    const { GlobalZIndex, setGlobalZIndex } = useGlobalZIndex();

    const handleAddNode = (template: NodeTemplate) => {
        const newNode: Node = {
            id: `node-${Date.now()}`,
            type: template.type,
            position: { x: 200, y: 100, z: GlobalZIndex },
            inputs: template.inputs.map(input => ({
                id: `${input.name}-${Date.now()}`,
                type: 'input' as const,
                name: input.name,
                dataType: input.dataType,
                label: input.label
            })),
            outputs: template.outputs.map(output => ({
                id: `${output.name}-${Date.now()}`,
                type: 'output' as const,
                name: output.name,
                dataType: output.dataType,
                label: output.label
            })),
            title: template.title,
            data: template.data
        };        
        setProject(prev => prev ? {
            ...prev,
            nodes: [...prev.nodes, newNode]
        } : null);
        
        setGlobalZIndex(GlobalZIndex + 1);
    };

    const renderContent = () => {
        switch (currentSection) {
            // case 'home':
            //     return (
            //         <div className="space-y-4">
            //             <h3 className="font-medium">Welcome Back!</h3>
            //             <div className="space-y-2">
            //                 <div className="bg-blue-50 p-4 rounded-lg">
            //                     <h4 className="font-medium text-blue-700">Recent Projects</h4>
            //                     <div className="mt-2 space-y-2">
            //                         <div className="text-sm text-blue-600">Project 1</div>
            //                         <div className="text-sm text-blue-600">Project 2</div>
            //                     </div>
            //                 </div>
            //                 <button className="w-full p-2 bg-blue-500 text-white rounded">
            //                     New Project
            //                 </button>
            //             </div>
            //         </div>
            //     );
            case 'account':
                return (
                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                                <User size={40} className="text-gray-500" />
                            </div>
                            <h3 className="font-medium">{user?.email || 'Not logged in'}</h3>
                        </div>
                        <div className="space-y-2 pt-4">
                            <button className="w-full p-2 text-left hover:bg-gray-100 rounded">
                                Profile Settings
                            </button>
                            <button className="w-full p-2 text-left hover:bg-gray-100 rounded">
                                Preferences
                            </button>
                            <button className="w-full p-2 text-left text-red-600 hover:bg-red-50 rounded">
                                Sign Out
                            </button>
                        </div>
                    </div>
                );
            case 'nodes':
                return (
                    <div className="space-y-2">
                        {nodeTemplates.map(template => (
                            <button
                                key={template.type}
                                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                                         transition-colors duration-200 flex items-center gap-2"
                                onClick={() => handleAddNode(template)}
                            >
                                {template.title}
                            </button>
                        ))}
                    </div>
                );
            case 'settings':
                return (
                    <div className="space-y-4">
                        <h3 className="font-medium">Settings</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span>Dark Mode</span>
                                <button className="p-2 bg-gray-100 rounded">Toggle</button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Grid Size</span>
                                <input type="number" className="w-20 p-1 border rounded" />
                            </div>
                        </div>
                    </div>
                );
            case 'code':
                return (
                    <div className="space-y-4">
                        <h3 className="font-medium">Generated Code</h3>
                        <pre className="bg-gray-100 p-2 rounded text-sm">
                            {`// Your code here\nfunction example() {\n  return true;\n}`}
                        </pre>
                    </div>
                );
            case 'data':
                return (
                    <div className="space-y-4">
                        <h3 className="font-medium">Data Management</h3>
                        <div className="space-y-2">
                            <button className="w-full p-2 bg-green-500 text-white rounded">
                                Import Data
                            </button>
                            <button className="w-full p-2 bg-blue-500 text-white rounded">
                                Export Data
                            </button>
                        </div>
                    </div>
                );
            case 'docs':
                return (
                    <div className="space-y-4">
                        <h3 className="font-medium">Documentation</h3>
                        <div className="space-y-2 text-sm">
                            <p>Learn how to use the node editor...</p>
                            <a href="#" className="text-blue-500 hover:underline">View Full Docs</a>
                        </div>
                    </div>
                );
      
        }
    };

    return (
        <div className="fixed left-0 top-0 w-48 h-full bg-white shadow-lg z-50 sidebar flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
                <span className="font-semibold text-gray-700">
                    {isMenuMode ? 'Menu' : currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
                </span>
                <button 
                    onClick={() => setIsMenuMode(!isMenuMode)}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    {isMenuMode ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                {isMenuMode ? (
                    <div className="p-2 space-y-1">
                        <button 
                            onClick={() => { 
                                router.push('/');
                            }}
                            className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                            <Home size={18} /> Home
                        </button>
                        {!isHome && <button 
                            onClick={() => { 
                                setCurrentSection('nodes'); 
                                setIsMenuMode(false);
                            }}
                            className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                            <Database size={18} /> White Board
                        </button>}
                        <button 
                            onClick={() => { setCurrentSection('settings'); setIsMenuMode(false); }}
                            className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                            <Settings size={18} /> Settings
                        </button>
                        <button 
                            onClick={() => { setCurrentSection('code'); setIsMenuMode(false); }}
                            className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                            <Code size={18} /> Code
                        </button>
                        <button 
                            onClick={() => { setCurrentSection('data'); setIsMenuMode(false); }}
                            className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                            <Database size={18} /> Data
                        </button>
                        <button 
                            onClick={() => { setCurrentSection('docs'); setIsMenuMode(false); }}
                            className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                            <FileText size={18} /> Docs
                        </button>
                        <button 
                            onClick={() => { setCurrentSection('account'); setIsMenuMode(false); }}
                            className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2"
                        >
                            <User size={18} /> Account
                        </button>
                    </div>
                ) : (
                    <div className="p-4">
                        {renderContent()}
                    </div>
                )}
            </div>

            {!isMenuMode && currentSection === 'nodes' && (
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gray-50 border-t">
                    <div className="text-sm text-gray-500">
                        Drag nodes here to delete
                    </div>
                </div>
            )}

            {currentSection !== 'nodes' && (
                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                        <User className="w-6 h-6 text-gray-500" />
                            <div className="text-sm text-gray-600 truncate">
                                {user?.email || 'Not logged in'}
                            </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 

export default Sidebar;