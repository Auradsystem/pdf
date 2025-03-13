export interface User {
  id: string;
  email: string;
}

export interface Project {
  id: number;
  created_at: string;
  name: string;
  user_id: string;
}

export interface PDFFile {
  id: number;
  created_at: string;
  name: string;
  projet_id: number;
  storage_path: string;
}

export interface Annotation {
  id: number;
  file_id: number;
  page_number: number;
  position_x: number;
  position_y: number;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
