export class PaginationAsyncError<T> extends Error {
  constructor(
    public readonly error: unknown,
    public index: number,
    public retry: () => Promise<T>
  ) {
    super('PaginationError');
    Object.setPrototypeOf(this, PaginationAsyncError.prototype);
  }
}
