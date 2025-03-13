export interface User {
  id: string;
  email: string;
}

export interface Project {
  id: number | string;
  created_at: string;
  name: string;
  user_id: string;
  description?: string;
}

export interface PDFFile {
  id: number | string;
  created_at: string;
  name: string;
  projet_id: number | string;
  project_id?: number | string; // Alternative spelling
  storage_path: string;
  file_path?: string; // Alternative property name
}

export interface Annotation {
  id: number | string;
  file_id: number | string;
  page_number: number;
  position_x: number;
  position_y: number;
  created_at: string;
  annotation_type?: 'camera' | 'note' | 'highlight' | string;
  content?: {
    text?: string;
    [key: string]: any;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
