export function hasProperty<TValue, TName extends string>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: {} | Record<TName, TValue>,
  name: TName
): data is Record<TName, Exclude<TValue, undefined>> {
  return name in (data as Record<string, unknown>);
}
