export interface Faculty {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  photo_url?: string;
  faculty_id: number;
}

export interface Score {
  id: number;
  student_id: number;
  faculty_id: number;
  date: string;
  attendance: string;
  topic_name?: string;
  personality: number;
  formals: number;
  cleanliness: number;
  socks: number;
  shoes: number;
  attentive: number;
  interactive: number;
  communication: number;
  confidence: number;
  technical_knowledge: number;
  total_score: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  faculty: Faculty;
}