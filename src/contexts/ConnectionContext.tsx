import { createContext, useContext, useState, ReactNode } from 'react';
import { Connection } from '../types/NodeType';

interface ConnectionContextType {
    connections: Connection[];
    setConnections: (value: Connection[] | ((prev: Connection[]) => Connection[])) => void;
}

export const ConnectionContext = createContext<ConnectionContextType>({
    connections: [],
    setConnections: () => {}
});

export const ConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [connections, setConnections] = useState<Connection[]>([]);

    return (
        <ConnectionContext.Provider value={{ connections, setConnections }}>
            {children}
        </ConnectionContext.Provider>
    );
};

export const useConnections = () => useContext(ConnectionContext); 