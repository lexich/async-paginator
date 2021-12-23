import { paginator } from './paginator';
import { PaginationAsyncError } from './errors';

describe('paginator', () => {
  const LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const transform = (num: number) => Promise.resolve(num);

  it('default', async () => {
    const p = paginator(LIST.values(), transform);
    const result: Array<number | PaginationAsyncError<number>> = [];
    for await (const item of p) {
      result.push(item);
    }
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('errors', async () => {
    const p = paginator(LIST.values(), (num: number) =>
      num % 2 === 0 ? Promise.resolve(num) : Promise.reject(new Error('test'))
    );
    const result: Array<number | PaginationAsyncError<number>> = [];
    for await (const item of p) {
      if (!(item instanceof PaginationAsyncError)) {
        result.push(item);
      }
    }
    expect(result).toEqual([2, 4, 6, 8, 10]);
  });

  it('default with offset', async () => {
    const p = paginator(LIST, transform, { offset: 2 });
    const result: Array<number | PaginationAsyncError<number>> = [];
    for await (const item of p) {
      result.push(item);
    }
    expect(result).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('chunks = 2', async () => {
    const p = paginator(LIST, transform, {
      chunks: 2,
    });
    const result: Array<number | PaginationAsyncError<number>> = [];
    for await (const item of p) {
      result.push(item);
    }
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('size = 3 with array', async () => {
    const p = paginator(LIST, transform, { size: 3 });
    const result: Array<number | PaginationAsyncError<number>> = [];
    for await (const item of p) {
      result.push(item);
    }
    expect(result).toEqual([1, 2, 3]);
  });

  it('size = 3 with iterator', async () => {
    const p = paginator(LIST.values(), transform, {
      size: 3,
    });
    const result: Array<number | PaginationAsyncError<number>> = [];
    for await (const item of p) {
      result.push(item);
    }
    expect(result).toEqual([1, 2, 3]);
  });

  it('offset=1 limit=5 chunks=2 with iterator', async () => {
    const p = paginator(LIST.values(), transform, {
      chunks: 2,
      offset: 1,
      limit: 5,
    });
    const result: Array<number | PaginationAsyncError<number>> = [];
    for await (const item of p) {
      result.push(item);
    }
    expect(result).toEqual([2, 3, 4, 5, 6]);
  });
});
