import { createContext, useContext, useState, ReactNode } from 'react';
import { Node, Project } from '../types/NodeType';

interface ProjectContextType {
    project: Project | null;
    setProject: React.Dispatch<React.SetStateAction<Project | null>>;
}

export const ProjectContext = createContext<ProjectContextType>({
    project: null,
    setProject: () => {}
});

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [project, setProject] = useState<Project | null>(null);

    return (
        <ProjectContext.Provider value={{ project, setProject }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => useContext(ProjectContext); 