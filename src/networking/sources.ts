import content from './content.json';
export const sources = content.sources
  .filter((s) => s.usable)
  .map((s) => ({
    ...s,
    kind: 'Primary documentation',
    detail: `Official reference retrieved ${s.retrieved}. Version-specific behavior must be checked against your installed SDK.`,
  }));
export const accessLimitations = content.sources.filter((s) => !s.usable);
export const sourceById = (id: string) => sources.find((s) => s.id === id)!;
