export type Nullable<T> = {
  readonly [K in keyof T]: T[K] | null;
};
