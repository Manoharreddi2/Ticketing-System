export type Role = 'USER' | 'SUPPORT_AGENT' | 'ADMIN';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  creator: User;
  assignee: User | null;
  rating: number | null;
  commentCount: number;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
}

export interface TicketDetail extends Ticket {
  ratingFeedback: string | null;
  comments: Comment[];
  attachments: Attachment[];
  history: TicketHistory[];
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: number;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  uploader: User;
  createdAt: string;
}

export interface TicketHistory {
  id: number;
  fieldChanged: string;
  oldValue: string | null;
  newValue: string;
  changedBy: User;
  createdAt: string;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  totalUsers: number;
  totalAgents: number;
  ticketsByPriority: Record<string, number>;
  ticketsByAgent: Record<string, number>;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string>;
  timestamp: string;
}
