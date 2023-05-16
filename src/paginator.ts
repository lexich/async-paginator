import { PaginationAsyncError } from './errors';
import { paginatorUnordered } from './paginatorUnordered';
import { IPaginatorParams } from './types';

/**
 * Returns an async iterator that paginates over the given iterable data, transforms each value with the provided `transform` function, and returns pagination errors (if any) in place of their corresponding transformed values.
 *
 * @function
 * @template T - The type of items in the iterable data.
 * @template O - The type of the transformed items.
 * @param {Iterable<T> | T[]} iterableData - The iterable data to be paginated.
 * @param {(item: T) => Promise<O>} transform - The transformation function applied to each item.
 * @param {IPaginatorParams} options - The optional pagination parameters.
 * @returns {AsyncIterable<O | PaginationAsyncError<O>>} Async iterable of transformed items or pagination errors.
 */
export function paginator<T, O>(
  iterableData: Iterable<T> | T[],
  transform: (item: T) => Promise<O>,
  options: IPaginatorParams = {}
): AsyncIterable<O | PaginationAsyncError<O>> {
  const paginate = paginatorUnordered(iterableData, transform, options);

  return {
    [Symbol.asyncIterator](): AsyncIterator<O | PaginationAsyncError<O>> {
      const iter = paginate[Symbol.asyncIterator]();
      let index = 0;
      const container = new Map<number, O | PaginationAsyncError<O>>();
      let isDone = false;
      const next = async (): Promise<
        IteratorResult<O | PaginationAsyncError<O>>
      > => {
        if (isDone) {
          return { done: true, value: undefined };
        }
        for (;;) {
          if (container.has(index)) {
            const result = container.get(index)!;
            container.delete(index);
            // increment counter on next step we need get next index
            index++;
            return { done: false, value: result };
          }
          // doesn't throw errors
          const ret = await iter.next();
          if (ret.done) {
            isDone = true;
            return ret;
          }
          const value =
            ret.value instanceof PaginationAsyncError
              ? ret.value
              : ret.value.data;
          container.set(ret.value.index, value);
          // add to container of results and try to return value
        }
      };
      return { next };
    },
  };
}
