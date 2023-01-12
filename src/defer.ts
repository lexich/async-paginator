export class Defer<T> {
  public readonly resolve!: (data: T) => void;
  public readonly reject!: (err: Error) => void;

  public readonly promise = new Promise<T>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).resolve = resolve;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).reject = reject;
  });
}
