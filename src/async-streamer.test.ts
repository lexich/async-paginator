import { AsyncStreamer } from './async-streamer';

describe('async-streamer', () => {
  it('success', async () => {
    const streamer = new AsyncStreamer<number>();

    streamer.resolve(1);
    streamer.resolve(2);
    streamer.resolve(3);
    streamer.close();

    const result: Array<number | Error> = [];

    // eslint-disable-next-line no-restricted-syntax
    for await (const data of streamer) {
      result.push(data);
    }

    expect(result).toEqual([1, 2, 3]);
  });

  it('success and after close', async () => {
    const streamer = new AsyncStreamer<number>();

    streamer.resolve(1);
    streamer.resolve(2);
    streamer.resolve(3);
    streamer.close();
    streamer.resolve(5);

    const result: Array<number | Error> = [];

    // eslint-disable-next-line no-restricted-syntax
    for await (const data of streamer) {
      result.push(data);
    }

    expect(result).toEqual([1, 2, 3]);
  });

  it('error flow', async () => {
    const streamer = new AsyncStreamer<number>();

    const err = new Error('test');
    streamer.resolve(1);
    streamer.resolve(2);
    streamer.reject(err);
    streamer.resolve(3);

    const result: Array<number | Error> = [];

    try {
      // eslint-disable-next-line no-restricted-syntax
      for await (const data of streamer) {
        result.push(data);
      }
    } catch (err) {
      result.push(err);
    }

    expect(result.length).toBe(1);

    expect((result[0] as Error).message).toBe('test');
  });
});
