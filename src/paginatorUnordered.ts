import { getIterator } from './getIterator';
import { hasProperty } from './hasProperty';
import { PaginationAsyncError } from './errors';
import {
  IPaginatorParams,
  IPaginationResult,
  Pointer,
  PointerWithRemove,
} from './types';

class PaginationAsyncErrorInternal<T, O> extends PaginationAsyncError<
  Pointer<O>
> {
  constructor(error: unknown, index: number, public task: Task<T, O>) {
    super(error, index, () =>
      task.exec().then(({ data, index }) => ({ data, index }))
    );
    Object.setPrototypeOf(this, PaginationAsyncErrorInternal.prototype);
  }
}

class Task<T, O> {
  constructor(
    public readonly index: number,
    private readonly value: T,
    private readonly transform: (item: T) => Promise<O>,
    private readonly list: Set<Promise<PointerWithRemove<O>>>
  ) {}

  remove: () => {};

  exec(): Promise<PointerWithRemove<O>> {
    const ret = this.transform(this.value).then(
      (data) => {
        const result: PointerWithRemove<O> = {
          data,
          index: this.index,
          remove: () => this.remove(),
        };
        return result;
      },
      (err) => {
        throw new PaginationAsyncErrorInternal(err, this.index, this);
      }
    );
    this.remove = () => this.list.delete(ret);
    return ret;
  }
}

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
export function paginatorUnordered<T, O>(
  iterableData: Iterable<T> | T[],
  transform: (item: T) => Promise<O>,
  options: IPaginatorParams = {}
): AsyncIterable<IPaginationResult<O>> {
  const { chunks = 1, offset = 0, mode = 'chunks', ...props } = options;
  const limit = hasProperty(props, 'limit')
    ? props.limit
    : hasProperty(props, 'size')
    ? props.size + offset
    : undefined;
  if (chunks <= 0) {
    throw new Error(`Invalid chunks=${chunks}`);
  }
  if (offset < 0) {
    throw new Error(`Invalid offset=${offset}`);
  }
  return {
    [Symbol.asyncIterator](): AsyncIterator<IPaginationResult<O>> {
      const iterator = getIterator(iterableData, offset, limit);
      let globalArrayIndex = 0;
      const inProgressList = new Set<Promise<PointerWithRemove<O>>>();

      function addNextTask() {
        const ret = iterator.next();
        if (!ret.done) {
          const task = new Task(
            globalArrayIndex,
            ret.value,
            transform,
            inProgressList
          );
          globalArrayIndex++;
          inProgressList.add(task.exec());
        }
      }

      const next = async (): Promise<IteratorResult<IPaginationResult<O>>> => {
        switch (mode) {
          case 'infinite': {
            for (let i = 0; i < chunks - inProgressList.size; i++) {
              addNextTask();
            }
            break;
          }

          case 'chunks':
          default: {
            if (!inProgressList.size) {
              for (let i = 0; i < chunks; i++) {
                addNextTask();
              }
            }
            break;
          }
        }

        if (!inProgressList.size) {
          return { done: true, value: undefined };
        }

        try {
          const result = await Promise.race(inProgressList);
          result.remove();
          return {
            done: false,
            value: { data: result.data, index: result.index },
          };
        } catch (err) {
          if (err instanceof PaginationAsyncErrorInternal) {
            err.task.remove();
            const value = new PaginationAsyncError<O>(
              err.error,
              err.index,
              () => err.task.exec()
            );
            return { done: false, value };
          }
          // Should never happens
          return {
            done: false,
            value: new PaginationAsyncError(err, -1, () =>
              Promise.reject(new Error('internal errror'))
            ),
          };
        }
      };
      return { next };
    },
  };
}
