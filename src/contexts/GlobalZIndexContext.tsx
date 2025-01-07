import { createContext, useState, useContext } from 'react'

interface GlobalZIndexContextType {
    GlobalZIndex: number;
    setGlobalZIndex: (zIndex: number) => void;
}

const GlobalZIndexContext = createContext<GlobalZIndexContextType>({
    GlobalZIndex: 1,
    setGlobalZIndex: () => {}
})

export const GlobalZIndexProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [GlobalZIndex, setGlobalZIndex] = useState(1);
    return <GlobalZIndexContext.Provider value={{ GlobalZIndex, setGlobalZIndex }}>{children}</GlobalZIndexContext.Provider>;
};

export const useGlobalZIndex = () => {
    const context = useContext(GlobalZIndexContext);
    if (!context) {
        throw new Error('useGlobalZIndex must be used within a GlobalZIndexProvider');
    }
    return context;
};
