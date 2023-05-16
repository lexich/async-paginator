import { paginatorUnordered } from './paginatorUnordered';
import { PaginationAsyncError } from './errors';

describe('paginatorUnordered', () => {
  it('test', async () => {
    const resolve = (data: number, delay = 0) =>
      delay
        ? new Promise<number>((resolve) =>
            setTimeout(() => resolve(data), delay)
          )
        : Promise.resolve(data);
    const p = paginatorUnordered(
      [1, 2, 3],
      (num) => {
        if (num === 1) {
          return resolve(num, 10);
        }
        if (num === 3) {
          return resolve(num, 2);
        }
        return resolve(num);
      },
      {
        chunks: 3,
      }
    );
    const result: Array<number | PaginationAsyncError<number>> = [];
    const ordered: Array<number | PaginationAsyncError<number>> = [];
    for await (const item of p) {
      if (!(item instanceof PaginationAsyncError)) {
        result.push(item.data);
        ordered[item.index] = item.data;
      }
    }
    expect(ordered).toEqual([1, 2, 3]);
    expect(result).toEqual([2, 3, 1]);
  });

  it('test1', async () => {
    const sleep = (delay: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, delay));

    const paginate = paginatorUnordered(
      [1, 2, 3, 4, 5, 6, 7, 8],
      async (num) => {
        if (num % 2 === 0) {
          await sleep(10); // timeout 10ms
        }
        return num * 10;
      },
      {
        offset: 1,
        chunks: 2,
        mode: 'chunks',
      }
    );

    const result: number[] = [];

    for await (const item of paginate) {
      if (!(item instanceof PaginationAsyncError)) {
        result.push(item.data);
      }
    }

    expect(result).toEqual([30, 20, 50, 40, 70, 60, 80]);
  });
});
