import React, { useState, useRef, useEffect } from 'react';
import { NodeTemplate, Node, Position, Connection as ConnectionType } from '../types/NodeType';
import { ConnectionArrow } from './ConnectionArrow';
import { useConnections } from '../contexts/ConnectionContext';
import { useGlobalZIndex } from '../contexts/GlobalZIndexContext';
import { useBoardSize } from '../contexts/BoardSizeContext';
import { executePipeline, uploadWhiteBoard } from '../services/api';
import { useProject } from '../contexts/ProjectContext';
import ErrorPanel, { Error } from './ErrorPanel';

import Home from './Home';
import { useUser } from '../contexts/UserContext';
import { X } from 'lucide-react';

interface WhiteboardProps {
    nodeTemplates: NodeTemplate[];
    onExecute: (nodes: Node[], connections: ConnectionType[]) => void;
    setCurrentView: (view: 'home' | 'whiteboard') => void;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ 
    nodeTemplates, 
    onExecute, 
    setCurrentView 
}) => {
    const { boardSize } = useBoardSize();
    const { project, setProject } = useProject();
    const { user } = useUser();
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [dragConnectionInfo, setDragConnectionInfo] = useState<{
        sourceNodeId: string;
        sourcePortId: string;
        sourceType: 'input' | 'output';
    } | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [cursorPosition, setCursorPosition] = useState<Position>({ x: 0, y: 0, z: 0 });
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const { GlobalZIndex, setGlobalZIndex } = useGlobalZIndex();        
    const [executionResult, setExecutionResult] = useState<string>('');
    
    //bottom right buttons
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'success' | 'error' | ''>('');

    // Add new state for errors
    const [errors, setErrors] = useState<Error[]>([]);

    // Add state for error panel visibility
    const [isErrorPanelVisible, setIsErrorPanelVisible] = useState(true);

    useEffect(() => {

        if (!project) return;
        // Get all z values from nodes and connections
        const allZValues = [
            ...project.nodes.map(node => node.position.z),
            ...project.connections.map(conn => conn.z)
        ];

        // Find the highest z value, default to 1 if no values found
        const highestZ = allZValues.length > 0 
            ? Math.max(...allZValues) 
            : 1;

        // Set global z-index to highest value
        setGlobalZIndex(highestZ);
    }, [project]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                setCursorPosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    z: 0
                });
            }
        };  

        const handleMouseUp = (e: MouseEvent) => {
            setTimeout(() => setDragConnectionInfo(null), 100);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragPosition]); // Added dependencies for the zoom calculation

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            const whiteboard = document.getElementById('view_window');
            if (!whiteboard) return;
            
            const bounds = whiteboard.getBoundingClientRect();
            const isOverWhiteboard = (
                e.clientX >= bounds.left &&
                e.clientX <= bounds.right &&
                e.clientY >= bounds.top &&
                e.clientY <= bounds.bottom
            );

            if (isOverWhiteboard) {
                e.preventDefault();
                
                let newX = dragPosition.x;
                let newY = dragPosition.y;
                
                if (e.shiftKey) {
                    newX = dragPosition.x - e.deltaY;
                } else {
                    newY = dragPosition.y - e.deltaY;
                }

                // Add padding to bounds (200px on each side)
                const PADDING = 200;
                const minX = -(boardSize.width - bounds.width + 192 + PADDING);
                const maxX = PADDING;
                const minY = -(boardSize.height - bounds.height + PADDING);
                const maxY = PADDING;

                // Clamp the values
                newX = Math.min(Math.max(newX, minX), maxX);
                newY = Math.min(Math.max(newY, minY), maxY);

                setDragPosition({
                    x: newX,
                    y: newY
                });
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [dragPosition, boardSize]); // Add dependencies

    const handlePortConnect = (nodeId: string, portId: string, portType: 'input' | 'output', position: Position) => {
        if (!project) return;
        
        if (!dragConnectionInfo) {
            setDragConnectionInfo({ 
                sourceNodeId: nodeId, 
                sourcePortId: portId, 
                sourceType: portType 
            });
            return;
        }

        if (portType === dragConnectionInfo.sourceType || nodeId === dragConnectionInfo.sourceNodeId) {
            setDragConnectionInfo(null);
            return;
        }
        if (project.connections.some(conn => {
            return (
                conn.sourcePortId === dragConnectionInfo.sourcePortId 
                && conn.sourceNodeId === dragConnectionInfo.sourceNodeId
                && conn.targetPortId === portId 
                && conn.targetNodeId === nodeId
            );
        })) {
            setDragConnectionInfo(null);
            return;
        }

        const [sourceId, targetId] = portType === 'input' 
            ? [dragConnectionInfo.sourcePortId, portId]
            : [portId, dragConnectionInfo.sourcePortId];

        const [sourceNodeId, targetNodeId] = portType === 'input'
            ? [dragConnectionInfo.sourceNodeId, nodeId]
            : [nodeId, dragConnectionInfo.sourceNodeId];
        
        setProject(prev => prev ? {
            ...prev,
            connections: [...prev.connections, {
                id: `conn-${Date.now()}`,
                sourceNodeId,
                sourcePortId: sourceId,
                targetNodeId,
                targetPortId: targetId,
                z: GlobalZIndex + 1
            }]
        } : null);
      
        setDragConnectionInfo(null);
    };

    const updateNodePosition = (nodeId: string, newPosition: Position) => {
        setProject(prev => prev ? {
            ...prev,
            nodes: prev.nodes.map((node: Node) => 
                node.id === nodeId 
                    ? { ...node, position: newPosition }
                    : node
            )
        } : null);
    };

    const getPortPosition = (el: HTMLElement): Position => {
        const rect = el.getBoundingClientRect();
        const canvas = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
        return {
            x: rect.left - canvas.left + rect.width / 2,
            y: rect.top - canvas.top + rect.height / 2,
            z: 0
        };
    };

    const handleDeleteNode = (nodeId: string) => {
        setProject(prev => prev ? {
            ...prev,
            nodes: prev.nodes.filter(n => n.id !== nodeId),
            connections: prev.connections.filter(
                c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
            )
        } : null);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === canvasRef.current) {
            setIsDragging(true);
            dragStart.current = {
                x: e.clientX - dragPosition.x,
                y: e.clientY - dragPosition.y
            };
            
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setDragPosition({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleExecute = async () => {
        try {
            const result = await executePipeline(project?.nodes || [], project?.connections || []);
            setExecutionResult(
                `Nodes: ${result.counts.nodes}, Connections: ${result.counts.connections}`
            );
        } catch (error) {
            console.error('Pipeline execution failed:', error);
            setExecutionResult('Execution failed');
        }
    };

    // Test function to add errors (you can remove this later)
    const addTestError = () => {
        setErrors(prev => [...prev, {
            id: Date.now().toString(),
            message: `Test error ${prev.length + 1}`,
            timestamp: Date.now()
        }]);
    };

    const handleSaveProject = async () => {
        if (!project || !user) return;

        setIsSaving(true);
        setSaveStatus('');

        try {
            const response = await uploadWhiteBoard(user.id, project);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(''), 2000);
        } catch (error) {
            console.error('Failed to save project:', error);
            setSaveStatus('error');
            setErrors(prev => [...prev, {
                id: Date.now().toString(),
                message: 'Failed to save project',
                timestamp: Date.now()
            }]);
            setTimeout(() => setSaveStatus(''), 2000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full h-full bg-gray-100 whiteboard">
            <div id="view_window" className="fixed w-full h-full overflow-hidden">
                <div 
                    ref={canvasRef}
                    className="relative"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={() => setSelectedNodeId(null)}
                    style={{
                        transform: `translate(${dragPosition.x}px, ${dragPosition.y}px)`,
                        width: `${boardSize.width}px`,
                        left: "192px",
                        height: `${boardSize.height}px`,
                        cursor: isDragging ? 'grabbing' : 'grab',
                        transformOrigin: '0 0',
                        backgroundColor: 'white',
                        backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}
                >
                    {project?.connections.map(conn => {
                        const sourceNode = project?.nodes.find(n => n.id === conn.sourceNodeId);
                        const targetNode = project?.nodes.find(n => n.id === conn.targetNodeId);
                        if (!sourceNode || !targetNode) return null;

                        const sourcePort = sourceNode.outputs.find(p => p.id === conn.sourcePortId);
                        const targetPort = targetNode.inputs.find(p => p.id === conn.targetPortId);
                        if (!sourcePort || !targetPort) return null;

                        const sourceEl = document.querySelector(`[data-port-id="${conn.sourcePortId}"][data-port-type="output"]`);
                        const targetEl = document.querySelector(`[data-port-id="${conn.targetPortId}"][data-port-type="input"]`);
                        if (!sourceEl || !targetEl) return null;

                        const sourcePos = getPortPosition(sourceEl as HTMLElement);
                        const targetPos = getPortPosition(targetEl as HTMLElement);

                        return (
                            <ConnectionArrow
                                key={conn.id}
                                id={conn.id}
                                ZIndexValue={conn.z}
                                start={sourcePos}
                                end={targetPos}
                                onDelete={() => {
                                    setProject(prev => prev ? {
                                        ...prev,
                                        connections: prev.connections.filter(c => c.id !== conn.id)
                                    } : null);
                                }}
                                onAddNode={() => {
                                    console.log('Add node between connection:', conn);
                                }}
                                startColor="#22c55e"
                                endColor="#3b82f6"
                            />
                        );
                    })}

                    {dragConnectionInfo && (
                        <ConnectionArrow
                            key="temp-connection"
                            id="-1"
                            ZIndexValue={0}
                            start={(() => {
                                const sourceEl = document.querySelector(
                                    `[data-port-id="${dragConnectionInfo.sourcePortId}"][data-port-type="${dragConnectionInfo.sourceType}"]`
                                );
                                return sourceEl ? getPortPosition(sourceEl as HTMLElement) : { x: 0, y: 0, z: 0 };
                            })()}
                            end={cursorPosition}
                            isTemp={true}
                            startColor="#22c55e"
                            endColor="#3b82f6"
                        />
                    )}

                    {project?.nodes.map(node => {
                        const Template = nodeTemplates.find(t => t.type === node.type)?.component;
                        return Template ? (
                            <Template
                                key={node.id}
                                node={node}
                                onPortConnect={handlePortConnect}
                                isSelected={selectedNodeId === node.id}
                                onClick={() => setSelectedNodeId(node.id)}
                                handleDelete={() => handleDeleteNode(node.id)}
                            />
                        ) : null;
                    })}
                </div>

                <div className={`absolute right-4 flex flex-col gap-2 z-[60] transition-all duration-200
                    ${isErrorPanelVisible ? 'bottom-52' : 'bottom-4'}`}>
                    {executionResult && (
                        <div className="bg-white px-4 py-2 rounded-lg shadow text-gray-700">
                            {executionResult}
                        </div>
                    )}
                    <button
                        className={`w-32 px-6 py-2.5 font-medium rounded-lg shadow-md transition-all duration-200 ${
                            isSaving 
                                ? 'bg-gray-400 cursor-not-allowed'
                                : saveStatus === 'success'
                                ? 'bg-green-500 hover:bg-green-600'
                                : saveStatus === 'error'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                        onClick={handleSaveProject}
                        disabled={isSaving}
                    >
                        <span className="text-white">
                            {isSaving ? 'Saving...' :
                             saveStatus === 'success' ? 'Saved!' :
                             saveStatus === 'error' ? 'Failed!' :
                             'Save'}
                        </span>
                    </button>
                    <button
                        className="w-32 px-6 py-2.5 bg-green-500 text-white font-medium rounded-lg shadow-md hover:bg-green-600 transition-colors duration-200"
                        onClick={handleExecute}
                    >
                        Execute
                    </button>
                </div>
            </div>

            {/* Add this button temporarily to test errors */}
            <button
                className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded"
                onClick={addTestError}
            >
                Add Test Error
            </button>

            <ErrorPanel 
                errors={errors}
                onClearAll={() => setErrors([])}
                onDismiss={(id) => setErrors(prev => prev.filter(e => e.id !== id))}
                isVisible={isErrorPanelVisible}
                setIsVisible={setIsErrorPanelVisible}
            />
        </div>
    );
};

export default Whiteboard;