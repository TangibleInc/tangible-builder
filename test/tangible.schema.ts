import { Something } from './import.schema'

/**
 * @title Configuration
 * @description
 * Description?
 *
 * Long.
 */
export interface Config {
  /**
   * @title The path
   * @description
   * More here
   */
  path?: string
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