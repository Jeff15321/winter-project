import { GlobalZIndexProvider } from "../contexts/GlobalZIndexContext";
import "../styles/globals.css";
import { ConnectionProvider } from '../contexts/ConnectionContext';

import type { AppProps } from "next/app";
import { BoardSizeProvider } from "../contexts/BoardSizeContext";
import { NodesProvider } from "../contexts/NodesContext";
import { UserProvider } from "../contexts/UserContext";
import { ProjectProvider } from "../contexts/ProjectContext";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <GlobalZIndexProvider>
        <BoardSizeProvider>
            <UserProvider>  
              <ProjectProvider>
                <Component {...pageProps} /> 
              </ProjectProvider>
            </UserProvider>
        </BoardSizeProvider>
    </GlobalZIndexProvider>
  );
}

