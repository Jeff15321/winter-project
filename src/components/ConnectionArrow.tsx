import React, { useEffect, useState } from 'react';
import { Position } from '../types/NodeType';

interface ConnectionArrowProps {
    id: string;
    start: Position;
    end: Position;
    ZIndexValue: number;
    isTemp?: boolean;
    startColor: string;
    endColor: string;
    onDelete?: () => void;
    onAddNode?: () => void;
}

export const ConnectionArrow: React.FC<ConnectionArrowProps> = ({ id, start, end, ZIndexValue, isTemp, startColor, endColor, onDelete, onAddNode }) => {
    const [showMenu, setShowMenu] = useState(false);
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const rightOrient = start.x < end.x;
    const startControl = rightOrient ? start.x + 100 : start.x - 100;
    const endControl = rightOrient ? end.x - 100 : end.x + 100;

    useEffect(() => {
        let _ = rightOrient; // used to re render the arrowhead
    }, [rightOrient]);


    useEffect(() => {
        if (showMenu) {
            document.addEventListener('click', (e) => {
                if (e.target !== document.querySelector('.context-menu')) {
                    setShowMenu(false);
                }
            });
        }
    }, [showMenu]);

    return (
        <svg 
            id={id}
            className="absolute inset-0 w-full h-full" 
            style={{ zIndex: id === "-1" ? 9999 : ZIndexValue, pointerEvents: 'none', userSelect: 'none' }}
        >
            <defs>
                <linearGradient 
                    id={`gradient-${start.x}-${start.y}`} 
                    gradientUnits="userSpaceOnUse"
                    x1={start.x} y1={start.y} 
                    x2={end.x} y2={end.y}
                >
                    <stop offset="0%" stopColor={startColor} />
                    <stop offset="100%" stopColor={endColor} />
                </linearGradient>
                <marker
                    id="arrowhead"
                    markerWidth="4"
                    markerHeight="3"
                    refX="3"
                    refY="1.5"
                    orient={rightOrient ? "0" : "180"}
                >
                    <polygon points="0 0, 4 1.5, 0 3" fill={endColor} />
                </marker>
            </defs>

            {/* Shadow path */}
            <path
                d={`M ${start.x} ${start.y} C ${startControl} ${start.y}, ${endControl} ${end.y}, ${end.x} ${end.y}`}
                stroke="#0F172A"
                strokeWidth="6"
                fill="none"
                strokeOpacity="0.1"
                strokeLinecap="round"
                transform="translate(1, 1)"
            />

            {/* Main path */}
            <path
                d={`M ${start.x} ${start.y} C ${startControl} ${start.y}, ${endControl} ${end.y}, ${end.x} ${end.y}`}
                stroke={isTemp ? "#94A3B8" : `url(#gradient-${start.x}-${start.y})`}
                strokeWidth="5"
                fill="none"
                strokeDasharray={isTemp ? "5,5" : "none"}
                strokeLinecap="round"
                markerEnd="url(#arrowhead)"
            />
            
            {!isTemp && (
                <>
                    <circle
                        cx={midX}
                        cy={midY}
                        r="6"
                        fill={endColor}
                        style={{ pointerEvents: 'all', cursor: 'pointer' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                    />

                    {showMenu && (
                        <foreignObject
                            x={midX - 50}
                            y={midY + 10}
                            width="100"
                            height="80"
                            style={{ pointerEvents: 'all',
                                position: 'fixed',
                                zIndex: 99999
                            }}
                        >
                            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2">
                                <button
                                    className="w-full mb-2 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete?.();
                                        setShowMenu(false);
                                    }}
                                >
                                    Delete
                                </button>
                                <button
                                    className="w-full px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddNode?.();
                                        setShowMenu(false);
                                    }}
                                >
                                    Add Node
                                </button>
                            </div>
                        </foreignObject>
                    )}
                </>
            )}
        </svg>
    );
};