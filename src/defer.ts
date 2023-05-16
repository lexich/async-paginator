/**
 * The Defer class provides an easy way to create a Promise along with its resolve and reject functions.
 *
 * @class
 * @template T - The type of data that the promise will resolve to.
 */
export class Defer<T> {
  /**
   * A read-only property that is a function for resolving the promise with data.
   * This property is initialized in the constructor and cannot be overwritten.
   *
   * @readonly
   * @type {(data: T) => void}
   * @memberof Defer
   */
  public readonly resolve!: (data: T) => void;

  /**
   * A read-only property that is a function for rejecting the promise with an error.
   * This property is initialized in the constructor and cannot be overwritten.
   *
   * @readonly
   * @type {(err: Error) => void}
   * @memberof Defer
   */
  public readonly reject!: (err: Error) => void;

  /**
   * A read-only promise that is associated with the resolve and reject functions.
   *
   * @readonly
   * @type {Promise<T>}
   * @memberof Defer
   */
  public readonly promise = new Promise<T>((resolve, reject) => {
    // Cast to any because resolve and reject are readonly and cannot be assigned directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).resolve = resolve;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).reject = reject;
  });
}
