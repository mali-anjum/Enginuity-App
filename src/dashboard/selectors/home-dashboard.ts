import { createSelector } from '@reduxjs/toolkit';

import type { Experiment } from '@/experiment/state/experimentSlice';
import type { Project } from '@/project/state/projectSlice';
import type { RootState } from '@/store/store';

export type ProjectCardModel = Project & { experimentCount: number };
export type HomeProjectSections = {
  myProjects: ProjectCardModel[];
  sharedProjects: ProjectCardModel[];
};

export type RecentExperimentRow = {
  experiment: Experiment;
  projectTitle: string;
};

/** Projects sorted by last activity with experiment counts for home cards. */
export const selectProjectsWithExperimentCounts = createSelector(
  [(state: RootState) => state.project.projects, (state: RootState) => state.experiment.experiments],
  (projects, experiments): ProjectCardModel[] => {
    const counts = new Map<string, number>();
    for (const e of experiments) {
      counts.set(e.projectId, (counts.get(e.projectId) ?? 0) + 1);
    }
    return [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map((p) => ({ ...p, experimentCount: counts.get(p.id) ?? 0 }));
  },
);

export const selectHomeProjectSections = createSelector(
  [selectProjectsWithExperimentCounts],
  (projects): HomeProjectSections => ({
    myProjects: projects.filter((project) => !project.sharedWithMe),
    sharedProjects: projects.filter((project) => project.sharedWithMe),
  }),
);

/** Last five experiments globally, with project title for the feed. */
export const selectRecentExperimentsForHome = createSelector(
  [(state: RootState) => state.experiment.experiments, (state: RootState) => state.project.projects],
  (experiments, projects): RecentExperimentRow[] => {
    const titleByProject = new Map(projects.map((p) => [p.id, p.title] as const));
    return [...experiments]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map((experiment) => ({
        experiment,
        projectTitle: titleByProject.get(experiment.projectId) ?? 'Unknown project',
      }));
  },
);
