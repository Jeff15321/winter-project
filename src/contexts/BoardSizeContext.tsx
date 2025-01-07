import { createContext, useContext, useState, ReactNode } from 'react';
import { Connection } from '../types/NodeType';

interface BoardSizeContextType {
    boardSize: {width: number, height: number};
    setBoardSize: (value: {width: number, height: number} | ((prev: {width: number, height: number}) => {width: number, height: number})) => void;
}

export const BoardSizeContext = createContext<BoardSizeContextType>({
    boardSize: {width: 3000, height: 1500},
    setBoardSize: () => {}
});

export const BoardSizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [boardSize, setBoardSize] = useState<{width: number, height: number}>({width: 2000, height: 1000});

    return (
        <BoardSizeContext.Provider value={{ boardSize, setBoardSize }}>
            {children}
        </BoardSizeContext.Provider>
    );
};

export const useBoardSize = () => useContext(BoardSizeContext); 