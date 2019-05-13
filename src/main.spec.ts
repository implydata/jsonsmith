import { resolveJSONs } from './main';


describe('main', () => {
  describe('basic', () => {
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

      expect(resolveJSONs(obj1, obj2)).toEqual({
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

      expect(resolveJSONs(obj1, obj2, obj3)).toEqual({
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

      expect(resolveJSONs(obj1, obj2, obj3, obj4)).toEqual({
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
  });

  describe('arrays', () => {
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

      expect(resolveJSONs(one, two, three)).toEqual({
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
      expect(resolveJSONs(one, two)).toEqual({
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

      expect(resolveJSONs(one, two, { 'albums.0.name': 'rising down' })).toEqual({
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
});
