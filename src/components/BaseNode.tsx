import React, { useState, useRef, useEffect } from 'react';
import { NodeComponentProps, Position } from '../types/NodeType';
import { useGlobalZIndex } from '../contexts/GlobalZIndexContext';
import { useConnections } from '../contexts/ConnectionContext';
import { useBoardSize } from '../contexts/BoardSizeContext';
import { useProject } from '../contexts/ProjectContext';

export const BaseNode: React.FC<NodeComponentProps> = ({ node, onPortConnect, isSelected, onClick, handleDelete }) => {
    const [position, setPosition] = useState(node.position);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef<Position>({ x: 0, y: 0, z: 0 });
    const { GlobalZIndex, setGlobalZIndex } = useGlobalZIndex();
    const { boardSize } = useBoardSize();
    
    const { project, setProject } = useProject();

    const [showContextMenu, setShowContextMenu] = useState<{ x: number; y: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains('port')) return;
        setIsDragging(true);

        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
            z: 0
        };


        setPosition(prev => ({ ...prev, z: 9999 }));

        setProject(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                connections: prev.connections.map(conn => 
                    (conn.sourceNodeId === node.id || conn.targetNodeId === node.id)
                        ? { ...conn, z: 10000 }  // Keep connections just below the node
                        : conn
                )
            };
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const newPosition = {
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y,
            z: 9999
        };

        // Check if cursor is over sidebar
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            const sidebarRect = sidebar.getBoundingClientRect();
            const isOverSidebar = (
                e.clientX >= sidebarRect.left && 
                e.clientX <= sidebarRect.right &&
                e.clientY >= sidebarRect.top && 
                e.clientY <= sidebarRect.bottom
            );
            const element = document.getElementById(node.id.toString());  
            if (!element) return;
            if (isOverSidebar) {
                element.style.opacity = '0.5';
                element.style.border = '2px dashed red';
            } else {
                element.style.opacity = '1';
                element.style.border = 'none';
            }
        }

        if(newPosition.x < 0){
            newPosition.x = 0;
        } else if(newPosition.x + (document.getElementById(node.id)?.offsetWidth || 0) > boardSize.width){
            newPosition.x = boardSize.width - (document.getElementById(node.id)?.offsetWidth || 0);
        }   
        if(newPosition.y < 0){
            newPosition.y = 0;
        } else if(newPosition.y + (document.getElementById(node.id)?.offsetHeight || 0) > boardSize.height){
            newPosition.y = boardSize.height - (document.getElementById(node.id)?.offsetHeight || 0);
        }

        setPosition(newPosition);
        node.position = newPosition;
    };

    const handleMouseUp = (e: MouseEvent) => {
        setPosition(prev => ({ ...prev, z: GlobalZIndex }));

        

        setProject(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                nodes: prev.nodes.map(tmp_node => {
                    if(tmp_node.id === node.id){
                        return {
                            ...tmp_node,
                            position: {
                                ...tmp_node.position,
                                z: GlobalZIndex
                            }
                        }
                    }
                    return tmp_node;
                }),
                connections: prev.connections.map(conn => {
                    if(conn.sourceNodeId === node.id || conn.targetNodeId === node.id){
                        return {
                            ...conn,
                            z: GlobalZIndex + 1
                        }
                    }
                    return conn;
                })
            }
        })

        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            const sidebarRect = sidebar.getBoundingClientRect();
            const isOverSidebar = (
                e.clientX >= sidebarRect.left && 
                e.clientX <= sidebarRect.right &&
                e.clientY >= sidebarRect.top && 
                e.clientY <= sidebarRect.bottom
            );

            if (isOverSidebar) {
                setProject(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        connections: prev.connections.filter(conn => 
                            conn.sourceNodeId !== node.id && conn.targetNodeId !== node.id
                        )
                    }
                })
                handleDelete();
            }
        }
        setIsDragging(false);
    };
    useEffect(() => {
        if (!isDragging) return;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const getPortPosition = (el: HTMLElement): Position => {
        const rect = el.getBoundingClientRect();
        const canvas = el.closest('.ml-48')?.getBoundingClientRect() || { left: 0, top: 0 };
        const nodeRect = el.closest('.node')?.getBoundingClientRect() || rect;
        
        return {
            x: rect.left - canvas.left + rect.width / 2,
            y: rect.top - canvas.top + rect.height / 2,
            z: 0
        };
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const nodeRect = e.currentTarget.getBoundingClientRect();
        
        setShowContextMenu({ 
            x: e.clientX - nodeRect.left,
            y: e.clientY - nodeRect.top
        });
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            // Get the context menu element
            const contextMenu = document.querySelector('.context-menu');
            
            // Check if click target is outside the context menu
            if (showContextMenu && contextMenu && !contextMenu.contains(e.target as Node)) {
                setShowContextMenu(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showContextMenu]);

    return (
        <div
            id={node.id.toString()}
            className={`
                absolute p-6 rounded-xl
                ${isSelected 
                    ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50/30' 
                    : 'ring-1 ring-gray-200 shadow-md hover:shadow-lg'
                }
                bg-white backdrop-blur-sm
                cursor-move
                node-identifier
            `}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                minWidth: '280px',
                userSelect: 'none',
                zIndex: position.z,
                transition: 'background-color 200ms ease-in-out, box-shadow 200ms ease-in-out, border-color 200ms ease-in-out'
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => {
                if ((e.target as HTMLElement).classList.contains('port')) return;
                if (!isDragging) onClick();
            }}
            onContextMenu={handleContextMenu}
        >
            {/* Title Section */}
            <div className="font-semibold text-lg text-gray-700 mb-4 pb-3 border-b border-gray-100">
                {node.title}
            </div>
            
            <div className="flex justify-between gap-6">
                {/* Inputs Column */}
                <div className="space-y-4 w-1/2">
                    {node.inputs.map(port => (
                        <div key={port.id} className="flex items-center group">
                            <div
                                className={`
                                    port w-4 h-4 rounded-full 
                                    bg-gradient-to-br from-blue-400 to-blue-600
                                    ring-4 ring-blue-100 group-hover:ring-blue-200
                                    shadow-sm group-hover:shadow
                                    transition-all duration-200 cursor-crosshair
                                    hover:scale-110
                                `}
                                data-port-id={port.id}
                                data-port-type="input"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    onPortConnect(node.id, port.id, 'input', getPortPosition(e.currentTarget));
                                }}
                                onMouseUp={(e) => {
                                    e.stopPropagation();
                                    onPortConnect(node.id, port.id, 'input', getPortPosition(e.currentTarget));
                                }}
                            />
                            <span className="ml-3 text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                                {port.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Outputs Column */}
                <div className="space-y-4 w-1/2">
                    {node.outputs.map(port => (
                        <div key={port.id} className="flex items-center justify-end group">
                            <span className="mr-3 text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                                {port.name}
                            </span>
                            <div
                                className={`
                                    port w-4 h-4 rounded-full 
                                    bg-gradient-to-br from-green-400 to-green-600
                                    ring-4 ring-green-100 group-hover:ring-green-200
                                    shadow-sm group-hover:shadow
                                    transition-all duration-200 cursor-crosshair
                                    hover:scale-110
                                    ml-auto
                                `}
                                data-port-id={port.id}
                                data-port-type="output"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    onPortConnect(node.id, port.id, 'output', getPortPosition(e.currentTarget));
                                }}
                                onMouseUp={(e) => {
                                    e.stopPropagation();
                                    onPortConnect(node.id, port.id, 'output', getPortPosition(e.currentTarget));
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Section */}
            {node.data.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100 space-y-4">
                    {node.data.map(data => {
                        if (data.dataType === 'text') {
                            return (
                                <div key={data.name} className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-gray-900">
                                        {data.name}
                                    </label>
                                    <textarea
                                        className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none
                                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                                 transition-all duration-200"
                                        rows={3}
                                        placeholder={`Enter ${data.name}...`}
                                        onChange={(e) => {
                                            data.value = e.target.value;
                                        }}
                                    />
                                </div>
                            );
                        }

                        if (data.dataType === 'file') {
                            return (
                                <div key={data.name} className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-gray-900">
                                        {data.name}
                                    </label>
                                    <div 
                                        className={`
                                            border-2 border-dashed border-gray-200 
                                            rounded-lg p-4 text-center
                                            hover:border-blue-500 hover:bg-blue-50/50
                                            transition-all duration-200 cursor-pointer
                                        `}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.add('border-blue-500', 'bg-blue-50/50');
                                        }}
                                        onDragLeave={(e) => {
                                            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/50');
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/50');
                                            const file = e.dataTransfer.files[0];
                                            if (file) {
                                                data.value = file.name;
                                            }
                                        }}
                                        onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.onchange = (e) => {
                                                const file = (e.target as HTMLInputElement).files?.[0];
                                                if (file) {
                                                    data.value = file.name;
                                                }
                                            };
                                            input.click();
                                        }}
                                    >
                                        <div className="text-sm text-gray-500">
                                            {data.value ? (
                                                <span className="text-gray-700">{data.value}</span>
                                            ) : (
                                                <>
                                                    <span>Drop file here or </span>
                                                    <span className="text-blue-500 hover:text-blue-600">browse</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return null;
                    })}
                </div>
            )}

            {showContextMenu && (
                <div 
                    className="absolute bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 context-menu"
                    style={{ 
                        left: showContextMenu.x, 
                        top: showContextMenu.y,
                        zIndex: 9999
                    }}
                >
                    <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600"
                        onClick={() => {
                            handleDelete();
                            setShowContextMenu(null);
                        }}
                    >
                        Delete Node
                    </button>
                    <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => {
                            console.log("Action 1");
                            setShowContextMenu(null);
                        }}
                    >
                        Action 1
                    </button>
                    <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => {
                            console.log("Action 2");
                            setShowContextMenu(null);
                        }}
                    >
                        Action 2
                    </button>
                    <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => {
                            console.log("Action 3");
                            setShowContextMenu(null);
                        }}
                    >
                        Action 3
                    </button>
                </div>
            )}
        </div>
    );
}; 