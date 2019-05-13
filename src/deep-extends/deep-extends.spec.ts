import { deepExtends } from './deep-extends';

describe('deepExtends', () => {
  it('should throw with bad args', () => {
    expect(() => (deepExtends as any)()).toThrowError('Invalid arguments: [] must provide a list of json values.');
    expect(() => (deepExtends as any)('someString')).toThrowError('Invalid arguments: [someString] must provide a list of json values.');
  });

  it('should work with just one', () => {
    const one = { rising: 'down' };
    expect(deepExtends(one)).toEqual({ rising: 'down' });
  });

  it('should ignore undefined', () => {
    const one = { rising: 'down' };
    const two = undefined;
    expect(deepExtends(one, two)).toEqual({ rising: 'down' });
  });

  it('should ignore null', () => {
    const one = { rising: 'down' };
    const two = null;
    expect(deepExtends(one, two)).toEqual({ rising: 'down' });
  });

  it('can deepExtends on 1 level', function () {
    const one = { home: 'grown!' };
    const two = { wake: 'up!' };
    expect(deepExtends(one, two)).toEqual({
      home: 'grown!',
      wake: 'up!'
    });
  });

  it('can do nested deepExtends', () => {
    const one = { member: { name: 'Captain Kirk Douglas' } };
    const two = { member: { role: 'guitar' } };
    expect(deepExtends(one, two)).toEqual({
      member: { name: 'Captain Kirk Douglas', role: 'guitar' }
    });
  });

  it('does not mutate objects', () => {
    const one = { doe: ['a', 'deer'] };
    const two = { a: ['female', 'deer'] };
    const three = { ray: 'a drop of golden sun' };
    const d = deepExtends({}, one, two, three);

    expect(one).toEqual({ doe: ['a', 'deer'] });
    expect(two).toEqual({ a: ['female', 'deer'] });
    expect(three).toEqual({ ray: 'a drop of golden sun' });
  });

  it('kitchen sink', () => {
    const obj1 = {
      money: 1,
      bag: 2,
      nice: {
        a: 1,
        b: [],
        c: { an: 123, ice: 321, bag: 1 }
      },
      swag: {
        diamond: ['collar'],
      },
      pockets: { ice: 3 },
      f: ['bag']
    };

    const obj2 = {
      bag: 3,
      nice: null,
      pockets: { need: 1, an: 2 }
    };

    expect(deepExtends(obj1, obj2)).toEqual({
      money: 1,
      bag: 3,
      nice: null,
      swag: {
        'diamond': ['collar']
      },
      pockets: { need: 1, an: 2, ice: 3 },
      f: ['bag']
    });
  });

  it('works with arrays', () => {
    expect(deepExtends({ numbers: [1, 2, 3] }, { numbers: [2, 3] })).toEqual({ numbers: [2, 3] });
  });
});
