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
