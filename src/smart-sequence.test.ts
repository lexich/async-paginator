import { SmartSequence } from './smart-sequence';

describe('smart-sequence', () => {
  it('without merge', () => {
    const list = [1, 2];
    const push = (v: number) => list.push(v);
    const sequence = new SmartSequence({ collection: list });
    const iterator = sequence[Symbol.iterator]();
    expect(iterator.next().value).toBe(1);
    expect(iterator.next().value).toBe(2);
    push(3);
    expect(iterator.next().value).toBe(3);
    expect(iterator.next().value).toBe(undefined);
    push(4);
    expect(iterator.next().value).toBe(undefined);
  });

  it('with merge & array', () => {
    const list = ['a', 'b'];
    const push = (v: string) => list.push(v);
    const sequence = new SmartSequence({
      collection: list,
      merge: list => (list.length ? [list.join('')] : []),
    });
    const iterator = sequence[Symbol.iterator]();
    expect(iterator.next().value).toBe('ab');
    push('c');
    push('d');
    expect(iterator.next().value).toBe('cd');
    expect(iterator.next().value).toBe(undefined);
  });

  it('with merge & iterator', () => {
    const list = ['a', 'b'];
    const push = (v: string) => list.push(v);
    const inputIterator = new SmartSequence({
      collection: list,
      merge: list => (list.length ? [list.join('')] : []),
    });

    const sequence = new SmartSequence({
      collection: inputIterator,
    });
    const iterator = sequence[Symbol.iterator]();
    expect(iterator.next().value).toBe('ab');

    push('c');
    push('d');
    expect(iterator.next().value).toBe('cd');
    expect(iterator.next().value).toBe(undefined);
  });
});
