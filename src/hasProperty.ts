/**
 * Determines whether a given object has a specified property name.
 *
 * @function
 * @template TValue - The type of the property's value.
 * @template TName - The type of the property's name.
 * @param { {} | Record<TName, TValue> } data - The object to check for the property.
 * @param {TName} name - The name of the property to check for.
 * @returns {boolean} Whether the object has the specified property, and its value is not undefined.
 */
export function hasProperty<TValue, TName extends string>(
  data: {} | Record<TName, TValue>,
  name: TName
): data is Record<TName, Exclude<TValue, undefined>> {
  return name in (data as Record<string, unknown>);
}
