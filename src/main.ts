import { deepExtends } from './deep-extends/deep-extends';

export function resolveJSONs(...jsons: any[]): any {
  return jsons.reduce((pv, cv) => {
    return deepExtends(pv, cv);
  });
}
