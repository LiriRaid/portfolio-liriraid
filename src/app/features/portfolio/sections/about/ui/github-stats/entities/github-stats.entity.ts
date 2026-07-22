export interface GithubUserResponse {
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

export interface GithubRepoResponse {
  name: string;
  fork: boolean;
  private: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  html_url: string;
  updated_at: string;
  license: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
}

export interface GithubLanguageStat {
  name: string;
  count: number;
  percentage: number;
}

export interface GithubStats {
  publicRepos: number;
  totalStars: number;
  totalForks: number;
  followers: number;
  primaryLanguage: string;
  languages: GithubLanguageStat[];
  lastUpdatedAt: string | null;
  profileUrl: string;
  cachedAt: number;
}
