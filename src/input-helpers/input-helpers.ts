export function inlineVars(obj: any, vs: Record<string, string>): any {
  return JSON.parse(JSON.stringify(obj).replace(/%\{[\w\-]+\}%/g, (varName) => {
    varName = varName.substr(2, varName.length - 4);
    let v = vs[varName];
    if (typeof v !== 'string') throw new Error(`could not find variable '${varName}'`);
    v = JSON.stringify(v);
    return v.substr(1, v.length - 2);
  }));
}

export function parseYaml(filepath: string) {

}
