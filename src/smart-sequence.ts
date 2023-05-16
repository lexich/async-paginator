/**
 * The ISmartSequence interface defines the shape of objects that can be used in the SmartSequence class.
 *
 * @interface
 * @template T - The type of elements in the collection
 */
export interface ISmartSequence<T> {
  /**
   * An iterable collection of elements to iterate over.
   * This property is optional and defaults to an empty array.
   *
   * @type {Iterable<T>}
   * @memberof ISmartSequence
   * @default []
   */
  collection?: Iterable<T>;

  /**
   * A function that merges an array of type T into a single element of type T
   * This property is optional and is not set by default.
   *
   * @param {T[]} list - The input array of elements
   * @returns {T} - A merged element of type T
   * @memberof ISmartSequence
   */
  merge?(list: T[]): T[];
}

/**
 * The SmartSequence class implements the Iterable interface and provides
 * advanced iteration capabilities for collections
 *
 * @class
 * @implements {Iterable<T>}
 * @template T - The type of elements in the collection
 */
export class SmartSequence<T> implements Iterable<T> {
  /**
   * A private method that merges an array of type T into a single element of type T
   *
   * @private
   * @readonly
   * @type {((list: T[]) => T[] | undefined)}
   * @memberof SmartSequence
   */
  private readonly merge?: (list: T[]) => T[];

  /**
   * An iterable collection of elements to iterate over.
   * This property is required and defaults to an empty array.
   *
   * @private
   * @readonly
   * @type {Iterable<T>}
   * @memberof SmartSequence
   * @default []
   */
  private readonly collection: Iterable<T>;

  /**
   * Creates an instance of SmartSequence.
   *
   * @param {ISmartSequence<T>} [opts] - An optional object that may define a collection and merge function
   * @memberof SmartSequence
   */
  constructor(opts?: ISmartSequence<T>) {
    this.merge = opts?.merge;
    this.collection = opts?.collection ?? [];
  }

  /**
   * Returns an iterator for the SmartSequence object.
   *
   * @returns {{next(): IteratorResult<T, unknown>;}} - The iterator object which has a `next()` method for retrieving elements.
   * @memberof SmartSequence
   */
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

  /**
   * A private method that returns an iterator object based on the options provided
   *
   * @private
   * @param {(undefined | number | Iterator<T, unknown, undefined>)} meta - An optional value representing metadata for the iterator sequence
   * @returns {[Iterator<T, unknown, undefined>, Iterator<T, unknown, undefined> | number]} - A tuple containing an iterator object and optional metadata
   * @memberof SmartSequence
   */
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
