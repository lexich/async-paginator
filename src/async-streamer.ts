import { Defer } from './defer';
import { SmartSequence } from './smart-sequence';

/**
 * An interface for providing options when creating an AsyncStreamer instance.
 *
 * @interface
 * @template T - The type of data that the streamer will handle.
 */
export interface IAsyncStreamerOptions<T> {
  /**
   * A function that can be used to merge an array of values when iterating through the stream.
   *
   * @memberof IAsyncStreamerOptions
   */
  merge?(list: T[]): T[];
}

/**
 * A class that provides a way to iterate through a collection of data asynchronously.
 *
 * @class
 * @template T - The type of data that the streamer will handle.
 */
export class AsyncStreamer<T> {
  private defer?: ReturnType<typeof AsyncStreamer.promiseFlow>;
  private readonly collection: SmartSequence<T>;
  private readonly data: T[];

  constructor(opts?: IAsyncStreamerOptions<T>) {
    // Create a new promise flow and initialize the data and collection properties
    this.defer = AsyncStreamer.promiseFlow();
    this.data = [];
    this.collection = new SmartSequence<T>({
      collection: this.data,
      merge: opts?.merge,
    });
  }

  /**
   * A static method for creating a new Defer instance.
   *
   * @static
   * @returns {Defer<boolean>}
   * @memberof AsyncStreamer
   */
  static promiseFlow() {
    let defer = new Defer<boolean>();
    let isRejected = false;

    return {
      isRejected() {
        return isRejected;
      },
      resolve(d: boolean) {
        if (isRejected) {
          return false;
        }

        defer.resolve(d);
        defer = new Defer<boolean>();

        return true;
      },
      reject(err: Error) {
        if (isRejected) {
          return false;
        }

        isRejected = true;
        defer.reject(err);

        return true;
      },
      getPromise() {
        return defer.promise;
      },
    };
  }

  /**
   * A method that returns an async iterator object for iterating through the collection.
   *
   * @returns {AsyncIterableIterator<T>}
   * @memberof AsyncStreamer
   */
  [Symbol.asyncIterator]() {
    const iterator = this.collection[Symbol.iterator]();

    const next = async (): Promise<IteratorResult<T>> => {
      // Wait for any previous errors to resolve before continuing
      if (this.defer && this.defer.isRejected()) {
        await this.defer.getPromise();
      }

      // Get the next item from the collection
      const result = iterator.next();

      // If we've reached the end of the collection, wait for any additional items to be added before continuing
      if (result.done && this.defer) {
        await this.defer.getPromise();

        // Check the collection again
        return next();
      }

      // Return the current value
      return result;
    };

    return { next };
  }

  /**
   * A method for closing the streamer and resolving the promise.
   *
   * @returns {boolean}
   * @memberof AsyncStreamer
   */
  close() {
    if (!this.defer) {
      return false;
    }

    this.defer.resolve(false);
    this.defer = undefined;

    return true;
  }

  /**
   * A method for adding a new item to the collection and resolving the promise.
   *
   * @param {T} data - The data to add to the collection
   * @returns {boolean}
   * @memberof AsyncStreamer
   */
  resolve(data: T) {
    if (!this.defer) {
      return false;
    }

    this.data.push(data);
    this.defer.resolve(true);

    return true;
  }

  /**
   * A method for rejecting the promise with an error.
   *
   * @param {Error} err - The error to use for rejecting the promise
   * @returns {boolean}
   * @memberof AsyncStreamer
   */
  reject(err: Error) {
    if (!this.defer) {
      return false;
    }

    this.defer.reject(err);

    return true;
  }
}
