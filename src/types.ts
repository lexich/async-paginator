import type { PaginationAsyncError } from './errors';

export interface IPaginatorBaseParams {
  chunks?: number;
  offset?: number;
  mode?: 'chunks' | 'infinite';
}
export type IPaginatorParams = IPaginatorBaseParams &
  ({ limit?: number } | { size?: number });

export type IPaginationResult<T> =
  | { data: T; index: number }
  | PaginationAsyncError<T>;

export interface Pointer<T> {
  data: T;
  index: number;
}

export interface PointerWithRemove<T> extends Pointer<T> {
  remove(): void;
}
