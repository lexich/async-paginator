import { PaginationAsyncError } from './errors';
import { paginatorUnordered } from './paginatorUnordered';
import { IPaginatorParams } from './types';

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
