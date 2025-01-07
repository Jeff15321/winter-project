// Example of data structure to send to backend

interface NodePipelineData {
    // Unique identifier for this pipeline run
    pipelineId: string;
    
    // All nodes in the pipeline with their configurations
    nodes: {
        [nodeId: string]: {
            id: string;
            type: string;
            data: Record<string, any>;  // Node-specific configuration
            position: { x: number; y: number };  // Optional, for visualization
        }
    };
    
    // Connections between nodes
    connections: {
        [connectionId: string]: {
            sourceNodeId: string;
            sourcePortId: string;
            targetNodeId: string;
            targetPortId: string;
        }
    };
}

// Example payload
const examplePayload = {
    "pipelineId": "training-run-123",
    "nodes": {
        "node1": {
            "id": "node1",
            "type": "DataLoader",
            "data": {
                "datasetPath": "/path/to/dataset",
                "batchSize": 32,
                "shuffle": true
            },
            "position": { "x": 100, "y": 100 }
        },
        "node2": {
            "id": "node2",
            "type": "ImageAugmentation",
            "data": {
                "rotation": 15,
                "flip": true,
                "brightness": 0.2
            },
            "position": { "x": 300, "y": 100 }
        },
        "node3": {
            "id": "node3",
            "type": "ModelTraining",
            "data": {
                "modelType": "resnet50",
                "learningRate": 0.001,
                "epochs": 10,
                "optimizerConfig": {
                    "type": "adam",
                    "beta1": 0.9,
                    "beta2": 0.999
                }
            },
            "position": { "x": 500, "y": 100 }
        }
    },
    "connections": {
        "conn1": {
            "sourceNodeId": "node1",
            "sourcePortId": "output",
            "targetNodeId": "node2",
            "targetPortId": "input"
        },
        "conn2": {
            "sourceNodeId": "node2",
            "sourcePortId": "output",
            "targetNodeId": "node3",
            "targetPortId": "input"
        }
    }
}

// Example API call structure
async function sendPipelineToBackend(pipelineData: NodePipelineData) {
    const response = await fetch('/api/pipeline/execute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pipelineData)
    });
    
    return await response.json();
}

// Example backend response structure
interface PipelineResponse {
    status: 'success' | 'error';
    pipelineId: string;
    executionId: string;
    results?: {
        [nodeId: string]: {
            status: 'completed' | 'failed' | 'running';
            output?: any;
            error?: string;
            metrics?: Record<string, number>;
            timestamp: string;
        }
    };
    error?: string;
}

// Example response
const exampleResponse = {
    "status": "success",
    "pipelineId": "training-run-123",
    "executionId": "exec-456",
    "results": {
        "node1": {
            "status": "completed",
            "output": {
                "samplesLoaded": 10000,
                "datasetStats": {
                    "classes": 5,
                    "meanPixelValue": 0.4567
                }
            },
            "timestamp": "2024-12-21T10:30:00Z"
        },
        "node2": {
            "status": "completed",
            "output": {
                "augmentedSamples": 10000,
                "transformationsApplied": ["rotation", "flip", "brightness"]
            },
            "timestamp": "2024-12-21T10:35:00Z"
        },
        "node3": {
            "status": "running",
            "metrics": {
                "currentEpoch": 3,
                "trainLoss": 0.342,
                "validationAccuracy": 0.89
            },
            "timestamp": "2024-12-21T10:40:00Z"
        }
    }
}

//Q
//How often will you respond
//