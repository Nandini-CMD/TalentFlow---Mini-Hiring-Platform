import Dexie, { Table } from 'dexie';

export interface Job {
  id?: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  salary: string;
  status: "active" | "archived";
  applicants: number;
  postedDate: string;
  description?: string;
  requirements?: string[];
  tags?: string[];
  order?: number;
}

export interface Candidate {
  id?: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  stage: "applied" | "screened" | "technical" | "offer" | "hired" | "rejected";
  appliedDate: string;
  location: string;
  avatar?: string;
  resume?: string;
  notes?: CandidateNote[];
  timeline?: CandidateTimelineEvent[];
}

export interface CandidateNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  mentions?: string[];
}

export interface CandidateTimelineEvent {
  id: string;
  type: "stage_change" | "note_added" | "interview_scheduled" | "email_sent";
  description: string;
  timestamp: string;
  author: string;
  metadata?: Record<string, any>;
}

export type QuestionType = 
  | "single-choice"
  | "multi-choice" 
  | "short-text"
  | "long-text"
  | "numeric"
  | "file-upload";

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[]; // for choice questions
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
  conditionalLogic?: {
    dependsOn: string; // question ID
    condition: "equals" | "not_equals" | "contains";
    value: string | string[];
  };
  order: number;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  questions: AssessmentQuestion[];
  order: number;
}

export interface Assessment {
  id?: number;
  title: string;
  description: string;
  sections: AssessmentSection[];
  status: "draft" | "published" | "archived";
  responses: number;
  createdDate: string;
  lastUpdated: string;
  settings?: {
    timeLimit?: number; // minutes
    allowBackNavigation?: boolean;
    randomizeQuestions?: boolean;
    passingScore?: number;
  };
}

export interface AssessmentResponse {
  id?: number;
  assessmentId: number;
  candidateId: number;
  responses: Record<string, any>;
  startedAt: string;
  completedAt?: string;
  score?: number;
  status: "in_progress" | "completed" | "abandoned";
}

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  assessments!: Table<Assessment>;
  responses!: Table<AssessmentResponse>;

  constructor() {
    super('TalentFlowDB');
    
    this.version(1).stores({
      jobs: '++id, title, slug, status, department, postedDate, order',
      candidates: '++id, name, email, position, stage, appliedDate',
      assessments: '++id, title, status, createdDate, lastUpdated',
      responses: '++id, assessmentId, candidateId, status, completedAt'
    });
  }
}

export const db = new TalentFlowDB();