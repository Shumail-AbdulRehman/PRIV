import { uncertainCategory } from './localCategoryPolicy';
export type { LocalCategoryResult } from './localCategoryPolicy';
export async function inspectLocalCategory(_uri: string, expected: string) {
  return uncertainCategory(expected, 'NATIVE_BUILD_REQUIRED');
}
