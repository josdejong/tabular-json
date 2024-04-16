export type GenericObject<T> = Record<string, T>

export type ValueGetter<T> = (item: T) => unknown

export interface Field<T> {
  name: string
  getValue: ValueGetter<T>
}
