import templatesJson from '@/experiment/assets/experiment-templates.json';

export type ExperimentTemplate = {
  id: string;
  name: string;
  defaultTitle: string;
  objective: string;
  observations: string;
};

export const EXPERIMENT_TEMPLATES: ExperimentTemplate[] = templatesJson as ExperimentTemplate[];
