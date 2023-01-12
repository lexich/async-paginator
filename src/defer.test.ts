import { Defer } from './defer';

describe('defer', () => {
  it('resolve', async () => {
    const defer = new Defer<number>();
    defer.resolve(42);
    expect(await defer.promise).toBe(42);
  });

  it('reject', async () => {
    const defer = new Defer<number>();
    const err = new Error('error');
    defer.reject(err);
    expect(await defer.promise.catch(err => err)).toBe(err);
  });
});
