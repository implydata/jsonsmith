import { deepDelete, deepGet, deepSet, makePath, parsePath } from './object-change';

describe('object-change', () => {
  describe('parsePath', () => {
    it('works', () => {
      expect(parsePath('hello.wow.0')).toEqual(['hello', 'wow', '0']);
      expect(parsePath('hello.{wow.moon}.0')).toEqual(['hello', 'wow.moon', '0']);
      expect(parsePath('hello.#.0.[append]')).toEqual(['hello', '#', '0', '[append]']);
    });

  });

  describe('makePath', () => {
    it('works', () => {
      expect(makePath(['hello', 'wow', '0'])).toEqual('hello.wow.0');
      expect(makePath(['hello', 'wow.moon', '0'])).toEqual('hello.{wow.moon}.0');
    });

  });

  describe('deepGet', () => {
    const thing = {
      hello: {
        'consumer.props': 'lol',
        wow: [
          'a',
          { test: 'moon' }
        ]
      },
      zetrix: null as any
    };

    it('works', () => {
      expect(deepGet(thing, 'hello.wow.0')).toEqual('a');
      expect(deepGet(thing, 'hello.wow.4')).toEqual(undefined);
      expect(deepGet(thing, 'hello.{consumer.props}')).toEqual('lol');
    });

  });

  describe('deepSet', () => {
    const thing = {
      hello: {
        wow: [
          'a',
          { test: 'moon' }
        ]
      },
      zetrix: null as any
    };

    it('works to set an existing thing', () => {
      expect(deepSet(thing, 'hello.wow.0', 5)).toEqual({
        hello: {
          wow: [
            5,
            {
              test: 'moon'
            }
          ]
        },
        zetrix: null as any
      });
    });

    it('works to set a non-existing thing', () => {
      expect(deepSet(thing, 'lets.do.this.now', 5)).toEqual({
        hello: {
          wow: [
            'a',
            {
              test: 'moon'
            }
          ]
        },
        lets: {
          do: {
            this: {
              now: 5
            }
          }
        },
        zetrix: null as any
      });
    });

    it('works to set an existing array', () => {
      expect(deepSet(thing, 'hello.wow.[append]', 5)).toEqual({
        hello: {
          wow: [
            'a',
            {
              test: 'moon'
            },
            5
          ]
        },
        zetrix: null as any
      });
    });

  });

  describe('deepDelete', () => {
    const thing = {
      hello: {
        moon: 1,
        wow: [
          'a',
          { test: 'moon' }
        ]
      },
      zetrix: null as any
    };

    it('works to delete an existing thing', () => {
      expect(deepDelete(thing, 'hello.wow')).toEqual({
        hello: { moon: 1 },
        zetrix: null
      });
    });

    it('works is harmless to delete a non-existing thing', () => {
      expect(deepDelete(thing, 'hello.there.lol.why')).toEqual(thing);
    });

    it('removes things completely', () => {
      expect(deepDelete(deepDelete(thing, 'hello.wow'), 'hello.moon')).toEqual({
        zetrix: null
      });
    });

    it('works with arrays', () => {
      expect(JSON.parse(JSON.stringify(deepDelete(thing, 'hello.wow.0')))).toEqual({
        hello: {
          moon: 1,
          wow: [
            {
              test: 'moon'
            }
          ]
        },
        zetrix: null
      });
    });

  });

});
