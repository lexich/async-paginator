/**
 * Returns an iterator for a given list, with optional offset and limit parameters.
 *
 * @function
 * @template T - The type of data being iterated over.
 * @param {Iterable<T> | T[]} list - The list to iterate over.
 * @param {number} [offset=0] - The starting index for the iterator.
 * @param {number} [limit] - The maximum number of items to include in the iteration.
 * @returns {Iterator<T>} An iterator for the list.
 */
export function getIterator<T>(
  list: Iterable<T> | T[],
  offset = 0,
  limit?: number
): Iterator<T> {
  if (Array.isArray(list)) {
    const slice = list.slice(offset, limit);
    return slice[Symbol.iterator]();
  } else {
    const iterator = list[Symbol.iterator]();
    while (offset) {
      const { done } = iterator.next();
      if (done) {
        offset = 0;
      }
      offset--;
    }
    if (limit && limit > 0) {
      const wrapIterator: Iterator<T> = {
        next() {
          if (limit) {
            limit--;
            return iterator.next();
          } else {
            return {
              done: true,
              value: undefined,
            };
          }
        },
      };
      return wrapIterator;
    }

    return iterator;
  }
}
