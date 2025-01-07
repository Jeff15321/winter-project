import React, { useState } from 'react';
import { NodeTemplate } from '../types/NodeType';
import { BaseNode } from '../components/BaseNode';
import Main from '../components/Main';

const nodeTemplates: NodeTemplate[] = [
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

const HomePage: React.FC = () => {
    
    return (
        <Main />
    );
};

export default HomePage;