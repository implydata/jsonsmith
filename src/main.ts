import { Format, inlineVars, tryParse } from './parsing/parsing';
import { deepExtends } from './deep-extends/deep-extends';
import * as fs from 'fs-extra';

interface Input {
  path: string;
  format: Format;
}

interface Raw {
  raw: any;
}

export interface MainParams {
  inputs?: (string | Input | { raw: any })[];
  varsObj?: Record<string, any>;
  debug?: (s: string) => void;
}

const getPathAndFormat = (input: string | Input | Raw) => {
  if (typeof input === 'string') {
    return { path: input };
  } else if (!(input as Raw).raw) {
    return { path: (input as Input).path, format: (input as Input).format };
  } else {
    return { path: null, format: null };
  }
};

const getFileData = (input: string | Input | Raw, path: string | null) => {
  if (path) {
    try {
      return fs.readFile(path, 'utf-8');
    } catch (e) {
      console.log(`error in read: for ${path}: ${e.message}`);
      return null;
    }
  }

  if ((input as Raw).raw) {
    return (input as Raw).raw;
  }

  return null;
};

export async function main<T>(params: MainParams): Promise<T> {
  const { inputs } = params;
  const debug = params.debug || ((v: string) => {});
  if (!Array.isArray(inputs)) {
    throw new Error(`Please provide a list of inputs either as strings or { path: string, format: 'json' | 'yaml' | 'properties' } objects`);
  }

  let objects: any[] = [];

  await Promise.all(inputs.map(async input => {
    const { path, format } = getPathAndFormat(input);
    const fileData = await getFileData(input, path);

    if (fileData) {
      try {
        const parsed = await tryParse(fileData, format);
        objects = objects.concat(parsed);
        debug(`parsed: ${JSON.stringify(parsed)}`);
      } catch (e) {
        debug(`Could not parse: ${fileData}: ${e.message}, continuing`);
      }
    }
  }));

  if (!objects.length) {
    throw new Error('No objects to work with');
  }

  objects = objects.filter(Boolean);

  if (params.varsObj) {
    objects = objects.map(object => inlineVars(object, params.varsObj as Record<string, string>));
  }

  return deepExtends.apply(this, objects);
}
