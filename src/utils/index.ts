import * as core from '@actions/core'

/**
 * @description 解析pr commit、review、comment内包含本repo的issue或者pr的编号(如#1)
 * @param {string} content body，title
 * @returns {number[]} 匹配到的issue或者pr的编号
 */
export const parsePrOwnRepoRelate = (content?: string | null) => {
  const regex = /#(\d+)/g
  core.info(`content: ${content}`)
  const matches = content?.match(regex)
  core.info(Array.isArray(matches)?.toString())
  core.info(`match: ${matches}`)
  const result = matches
    ? matches.map(match => parseInt(match.replace('#', '')))
    : []
  core.info(`parsePrOwnRepoRelate: ${result}`)
  return result
}

/**
 * @description 俩数组合并去重
 * @param {number[]} arr1
 * @param {number[]} arr2
 */

export const mergeDeduplicatedArr = (arr1: number[], arr2: number[]) => {
  core.info(`arr1: ${arr1}`)
  core.info(`arr2: ${arr2}`)
  core.info(`arrs: ${[...arr1, ...arr2]}`)
  core.info(`newSet: ${new Set([...arr1, ...arr2])}`)
  core.info(`mergeDeduplicatedArr: ${Array.from(new Set([...arr1, ...arr2]))}`)
  return Array.from(new Set([...arr1, ...arr2]))
}
