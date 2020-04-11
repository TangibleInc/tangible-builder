import { Something } from './import.schema'
export * from './import.schema'

/**
 * Configuration
 *
 * Description?
 *
 * @var this that other
 * @see that
 * @see another
 */
export interface Config {
  /**
   * The path
   *
   * More here
   */
  path?: string

  /**
   * Function
   *
   * @args Arguments
   * @args More agruments
   * @return Return type
   */
  fn: (args: any[]) => any[]

  type?: string
  tsconfig?: string
  expose: "all" | "none" | "export"
  topRef: boolean
  jsDoc: "none" | "extended" | "basic"
  sortProps?: boolean
  strictTuples?: boolean
  skipTypeCheck?: Something
  encodeRefs?: boolean
  extraTags?: string[]
}

export interface Another {
  [index: number]: any
}
