export interface IExperienceHeader {
  label: string;
  title: string;
  subtitle: string;
}

export interface IExperienceItem {
  company: string;
  role: string;
  period: string;
  location?: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  current?: boolean;
}
