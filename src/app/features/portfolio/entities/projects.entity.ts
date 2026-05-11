export interface IProjectsHeader {
  label: string;
  title: string;
  subtitle: string;
}

export interface IProjectsEmptyState {
  searchTitle: string;
  filtersTitle: string;
  description: string;
}

export interface IProjectGithubStats {
  stars: number;
  forks: number;
  visibility: 'public' | 'private' | string;
  license: string | null;
}

export type IGithubRepositoryStats = IProjectGithubStats;

export interface IProject {
  title: string;
  description: string;
  tags: string[];
  repo: string;
  githubUrl: string;
  liveUrl: string | null;
  featured?: boolean;
  screenshots?: string[];
  githubStats?: IProjectGithubStats;
}

export interface IProjectTechnologyCategory {
  label: string;
  icon: string;
  technologies: string[];
}

export interface IGithubRepositoryResponse {
  stargazers_count: number;
  forks_count: number;
  visibility: 'public' | 'private';
  license: {
    spdx_id: string | null;
    name: string | null;
  } | null;
}
