export interface ProjectGithubStats {
  stars: number;
  forks: number;
  visibility: 'public' | 'private' | string;
  license: string | null;
}

export type GithubRepositoryStats = ProjectGithubStats;

export interface Project {
  title: string;
  description: string;
  tags: string[];
  repo: string;
  githubUrl: string;
  liveUrl: string | null;
  featured?: boolean;
  githubStats?: ProjectGithubStats;
}

export interface ProjectTechnologyCategory {
  label: string;
  icon: string;
  technologies: string[];
}

export interface GithubRepositoryResponse {
  stargazers_count: number;
  forks_count: number;
  visibility: 'public' | 'private';
  license: {
    spdx_id: string | null;
    name: string | null;
  } | null;
}
