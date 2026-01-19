export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  salary?: string;
  postedDate?: string;
  applied: boolean;
  appliedDate?: string;
}

export interface ApplicationResult {
  jobId: string;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface ProxyConfig {
  server: string;
  username?: string;
  password?: string;
}
