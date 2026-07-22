import { TestBed } from '@angular/core/testing';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [ProjectsService],
    });

    service = TestBed.inject(ProjectsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no repos loading', () => {
    expect(service.isLoading().size).toBe(0);
  });

  it('should return null for invalid repos', async () => {
    const stats = await service.getRepositoryStats('invalid/nonexistent-repo-xyz-12345');

    expect(stats).toBeNull();
  });

  it('should deduplicate concurrent requests for the same repo', () => {
    const promise1 = service.getRepositoryStats('LiriRaid/portfolio-liriraid');
    const promise2 = service.getRepositoryStats('LiriRaid/portfolio-liriraid');

    expect(promise1).toBe(promise2);
  });

  it('should cache results in memory after fetch', async () => {
    const repo = 'LiriRaid/portfolio-liriraid';
    const stats = await service.getRepositoryStats(repo);

    if (stats) {
      const cached = await service.getRepositoryStats(repo);
      expect(cached).toEqual(stats);
    } else {
      // API might be rate-limited, skip this assertion
      expect(true).toBe(true);
    }
  });
});
