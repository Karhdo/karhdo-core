export const pickEntities = <T = any>(entities: T | T[]): T[] => {
  return entities instanceof Array ? entities : [entities];
};
