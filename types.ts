export interface Project {
  id: string;
  year: number;
  term: string;
  organization: string;
  title: string;
  url: string;
  mentors: string[];
  mentee: string;
  rawLine: string;
}

export interface FilterState {
  search: string;
  year: string;
  term: string;
  organization: string;
}

export interface OrganizationStats {
  name: string;
  count: number;
}

export interface YearStats {
  year: number;
  count: number;
}
