import { Defer } from './defer';
import { SmartSequence } from './smart-sequence';

export interface IAsyncStreamerOptions<T> {
  merge?(list: T[]): T[];
}

export class AsyncStreamer<T> {
  private defer?: ReturnType<typeof AsyncStreamer.promiseFlow>;
  private readonly collection: SmartSequence<T>;
  private readonly data: T[];

  constructor(opts?: IAsyncStreamerOptions<T>) {
    this.defer = AsyncStreamer.promiseFlow();
    this.data = [];
    this.collection = new SmartSequence<T>({
      collection: this.data,
      merge: opts?.merge,
    });
  }

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

  [Symbol.asyncIterator]() {
    const iterator = this.collection[Symbol.iterator]();

    const next = async (): Promise<IteratorResult<T>> => {
      // fast throw error
      if (this.defer && this.defer.isRejected()) {
        await this.defer.getPromise();
      }

      const result = iterator.next();

      if (result.done && this.defer) {
        await this.defer.getPromise();

        // check collection
        return next();
      }

      return result;
    };

    return { next };
  }

  close() {
    if (!this.defer) {
      return false;
    }

    this.defer.resolve(false);
    this.defer = undefined;

    return true;
  }

  resolve(data: T) {
    if (!this.defer) {
      return false;
    }

    this.data.push(data);
    this.defer.resolve(true);

    return true;
  }

  reject(err: Error) {
    if (!this.defer) {
      return false;
    }

    this.defer.reject(err);

    return true;
  }
}
