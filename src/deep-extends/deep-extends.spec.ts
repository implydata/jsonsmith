import { deepExtends } from './deep-extends';

describe('deepExtends', () => {
  describe('basic', () => {
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

      expect(one).toEqual({ doe: ['a', 'deer'] });
      expect(two).toEqual({ a: ['female', 'deer'] });
      expect(three).toEqual({ ray: 'a drop of golden sun' });
    });

  });

  describe('arrays', () => {
    it('works basic', () => {
      expect(deepExtends({ numbers: [1, 2, 3] }, { numbers: [2, 3] })).toEqual({ numbers: [2, 3] });
    });

    it('works for array notation', () => {
      const one = {
        albums: [{
          name: 'organix',
          release: 1993,
          tracks: [
            {
              name: 'the roots is comin',
              track: 1,
              length: '1:15'
            },
            {
              name: 'pass the popcorn',
              track: 2,
              length: '1:15'
            },
            {
              name: 'the anti circle',
              track: 3,
              length: '3:46'
            },
            {
              name: 'writer\'s block',
              track: 4,
              length: '1:42'
            }
          ]
        }],
        singles: 8
      };

      const two = {
        'albums.0.tracks.2.length': '1:20'
      };

      const three = {
        'albums.0.tracks.3.length': '3:14'
      };

      expect(deepExtends(one, two, three)).toEqual({
        albums: [{
          name: 'organix',
          release: 1993,
          tracks: [
            {
              name: 'the roots is comin',
              track: 1,
              length: '1:15'
            },
            {
              name: 'pass the popcorn',
              track: 2,
              length: '1:15'
            },
            {
              name: 'the anti circle',
              track: 3,
              length: '1:20'
            },
            {
              name: 'writer\'s block',
              track: 4,
              length: '3:14'
            }
          ]
        }],
        singles: 8
      });
    });

    it('works for append', () => {
      const one = {
        albums: [
          {
            name: 'organix'
          },
          {
            name: 'the tipping point'
          }
        ]
      };

      const two = { 'albums.[append]': { name: 'game theory' } };
      expect(deepExtends(one, two)).toEqual({
        albums: [
          {
            name: 'organix'
          },
          {
            name: 'the tipping point'
          },
          {
            name: 'game theory'
          }
        ]
      });

      expect(deepExtends(one, two, { 'albums.0.name': 'rising down' })).toEqual({
        albums: [
          {
            name: 'rising down'
          },
          {
            name: 'the tipping point'
          },
          {
            name: 'game theory'
          }
        ]
      });
    });
  });

  describe('more', () => {
    it('works', () => {
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
        'swag.diamond.0': 'collar',
        'swag.diamond.1': 'teeth',
        pockets: { need: 1, an: 2 }
      };

      expect(deepExtends(obj1, obj2)).toEqual({
        money: 1,
        bag: 3,
        nice: null,
        swag: {
          diamond: ['collar', 'teeth']
        },
        pockets: { need: 1, an: 2, ice: 3 },
        f: ['bag']
      });

      const obj3 = {
        pockets: {
          have: 'an', bag: { contents: 'ice' }
        }
      };

      expect(deepExtends(obj1, obj2, obj3)).toEqual({
        money: 1,
        bag: 3,
        nice: null,
        swag: {
          diamond: ['collar', 'teeth']
        },
        pockets: { need: 1, an: 2, ice: 3, have: 'an', bag: { contents: 'ice' } },
        f: ['bag']
      });

      const obj4 = {
        'pockets.bag.contents' : 'ice-cream'
      };

      expect(deepExtends(obj1, obj2, obj3, obj4)).toEqual({
        money: 1,
        bag: 3,
        nice: null,
        swag: {
          diamond: ['collar', 'teeth']
        },
        pockets: { need: 1, an: 2, ice: 3, have: 'an', bag: { contents: 'ice-cream' } },
        f: ['bag']
      });
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
  });
});
