export interface Object {
  this: number
}

export interface Something {
  that: Object
  [key: string]: any
}