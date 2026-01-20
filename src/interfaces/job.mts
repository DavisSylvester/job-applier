export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  source: string;
  salary?: string;
  postedDate?: string;
  applied: boolean;
  appliedDate?: string;
}
