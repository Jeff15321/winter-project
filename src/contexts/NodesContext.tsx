import { createContext, useContext, useState, ReactNode } from 'react';
import { Node } from '../types/NodeType';

interface NodesContextType {
    nodes: Node[];
    setNodes: (value: Node[] | ((prev: Node[]) => Node[])) => void;
}

export const NodesContext = createContext<NodesContextType>({
    nodes: [],
    setNodes: () => {}
});

export const NodesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [nodes, setNodes] = useState<Node[]>([]);

    return (
        <NodesContext.Provider value={{ nodes, setNodes }}>
            {children}
        </NodesContext.Provider>
    );
};

export const useNodes = () => useContext(NodesContext); 