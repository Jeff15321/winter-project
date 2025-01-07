export interface Project {
    id: string;
    name: string;
    is_public: boolean;
    collaborators: Array<{ email: string; id: string }>;
    created_at: string;
} 