export interface ISmartSequence<T> {
  collection?: Iterable<T>;
  merge?(list: T[]): T[];
}
export class SmartSequence<T> implements Iterable<T> {
  private readonly merge?: (list: T[]) => T[];
  private readonly collection: Iterable<T>;
  constructor(opts?: ISmartSequence<T>) {
    this.merge = opts?.merge;
    this.collection = opts?.collection ?? [];
  }

  [Symbol.iterator](): Iterator<T, unknown, undefined> {
    let [iterator, meta] = this.smartIterator(undefined);

    const next = (): IteratorResult<T, unknown> => {
      const result = iterator.next();

      if (!result.done) {
        return result;
      }

      // update iterator and meta for iteration
      [iterator, meta] = this.smartIterator(meta);

      // if this iterator is done, this means that we finished
      return iterator.next();
    };

    return {
      next,
    };
  }

  private smartIterator(
    meta: undefined | number | Iterator<T, unknown, undefined>
  ): readonly [
    Iterator<T, unknown, undefined>,
    Iterator<T, unknown, undefined> | number
  ] {
    // after first call meta can't be undefined by design

    if (!this.merge) {
      if (typeof meta === 'number') {
        throw Error('invalid meta value');
      }

      // meta is original iterator
      const iterator = meta ?? this.collection[Symbol.iterator]();

      return [iterator, iterator] as const;
    }

    if (Array.isArray(this.collection)) {
      if (meta !== undefined && typeof meta !== 'number') {
        throw Error('invalid meta value');
      }

      const list =
        meta === undefined
          ? this.collection
          : this.collection.slice(meta as number);

      return [
        this.merge(list)[Symbol.iterator](),
        this.collection.length,
      ] as const;
    }

    if (typeof meta === 'number') {
      throw Error('invalid meta value');
    }

    const list: T[] = [];
    const iterator = meta ?? this.collection[Symbol.iterator]();
    do {
      const { done, value } = iterator.next();

      if (done) {
        break;
      }

      list.push(value as T);
      // eslint-disable-next-line no-constant-condition
    } while (true);

    return [this.merge(list)[Symbol.iterator](), iterator] as const;
  }
}
