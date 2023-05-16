/**
 * A custom error class for handling errors that occur during asynchronous pagination.
 *
 * @class
 * @extends Error
 * @template T - The type of data being paginated.
 */
export class PaginationAsyncError<T> extends Error {
  constructor(
    public readonly error: unknown,       // The error that was thrown
    public index: number,                 // The index where the error occurred
    public retry: () => Promise<T>        // A function that can be used to retry the operation
  ) {
    super('PaginationError');
    Object.setPrototypeOf(this, PaginationAsyncError.prototype);
  }
}
