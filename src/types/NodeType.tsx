import { ReactNode } from 'react';
import { BaseNode } from '../components/BaseNode';

export interface Project {
    id: string;
    name: string;
    is_public: boolean;
    collaborators: Array<{ email: string; id: string }>;
    created_at: string;
    nodes: Node[];
    connections: Connection[];
}

export interface Position {
    x: number;
    y: number;
    z: number;
}

export interface Port {
    id: string;
    type: 'input' | 'output';
    name: string;
    dataType: string;
    label: string;
}

export interface Node {
    id: string;
    type: string;
    position: Position;
    inputs: Port[];
    outputs: Port[];
    data: Array<NodeData>;
    title: string;
}

export interface Connection {
    id: string;
    sourceNodeId: string;
    sourcePortId: string;
    targetNodeId: string;
    targetPortId: string;
    z: number;
}

export interface NodeData {
    name: string;   
    dataType: string;
    value: string;
}

export interface NodeTemplate {
    type: string;
    title: string;
    inputs: Array<Omit<Port, 'id' | 'type'>>;
    outputs: Array<Omit<Port, 'id' | 'type'>>;
    data: Array<NodeData>;
    component: React.ComponentType<NodeComponentProps>;
}

export interface NodeComponentProps {
    node: Node;
    onPortConnect: (nodeId: string, portId: string, portType: 'input' | 'output', position: Position) => void;
    isSelected: boolean;
    onClick: () => void;
    handleDelete: () => void;
} 

export const nodeTemplates: NodeTemplate[] = [
    {
        type: 'inputManager',
        title: 'Input Manager',
        inputs: [
            { name: 'input text', dataType: 'text', label: 'Input Text' }
        ],
        outputs: [
            { name: 'output', dataType: 'text', label: 'Output' },
            { name: 'output number', dataType: 'text', label: 'Output Number' }
        ],
        data: [
            { name: 'text', dataType: 'text', value: '' },
            { name: 'csv file', dataType: 'file', value: '' }
        ],
        component: BaseNode
    },
    {
        type: 'textProcessor',
        title: 'Text Processor',
        inputs: [{ name: 'input', dataType: 'text', label: 'Input Text' }],
        outputs: [{ name: 'output', dataType: 'text', label: 'Processed Text' }],
        data: [
            { name: 'text', dataType: 'text', value: '' },
        ],
        component: BaseNode
    },
    {
        type: 'dataClassifier',
        title: 'Data Classifier',
        inputs: [{ name: 'data', dataType: 'data', label: 'Input Data' }],
        outputs: [{ name: 'classes', dataType: 'array', label: 'Classifications' }],
        data: [
            { name: 'classes', dataType: 'text', value: '' }
        ],
        component: BaseNode
    }
];
    
