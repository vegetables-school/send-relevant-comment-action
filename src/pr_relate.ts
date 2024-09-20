import { Context } from '@actions/github/lib/context'
import { GitHub } from '@actions/github/lib/utils'
import { mergeDeduplicatedArr, parsePrOwnRepoRelate } from './utils'
import * as core from '@actions/core'

type Octokit = InstanceType<typeof GitHub>
type PrRelate = number[]

/**
 * 可能包含的函数
 * pulls.get()
 * pulls.listCommentsForReview()
 * pulls.listCommits()
 * pulls.listReviewComments()
 * pulls.listReviews()
 * issue.listComments()
 */

/**
 *  task: 获取 pull request 相关联的信息
 * 1. 获取 pull request 的详细信息 (title, body, labels, milestone, assignees, requested_reviewers, requested_teams) - pulls.get()
//  * 2. 获取 pull request 的 Lists comments for a specific pull request review. - pulls.listCommentsForReview()    需要配合 pulls.listReviews()
 * 3. 获取 pull request 的所有 commit 信息 (commenter, commit message) - pulls.listCommits()
 * 4. 获取 pull request 的所有 review comment 信息 (reviewers, body) - pulls.listReviewComments()
 * 4. 获取 pull request 的所有 comment 信息 (commenter, body) - issue.listComments()
 */
export async function getPrRelate(
  octokit: Octokit,
  context: Context
): Promise<PrRelate> {
  let prRelate: PrRelate = [context.issue.number]

  // 当[创建][编辑] pull request 时，获取 pull request 的详细信息
  const { data: pullRequest } = await octokit.rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number
  })
  core.info(`pullRequest: ${JSON.stringify(pullRequest)}`)
  mergeDeduplicatedArr(prRelate, parsePrOwnRepoRelate(pullRequest.title))
  mergeDeduplicatedArr(prRelate, parsePrOwnRepoRelate(pullRequest?.body))

  //  获取 pull request 的所有 commit 信息
  const { data: listCommits } = await octokit.rest.pulls.listCommits({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number
  })
  core.info(`listCommits: ${JSON.stringify(listCommits)}`)
  listCommits.forEach(commit =>
    mergeDeduplicatedArr(prRelate, parsePrOwnRepoRelate(commit.commit.message))
  )

  //  获取 pull request 的所有 review comment 信息
  const { data: listReviewComments } =
    await octokit.rest.pulls.listReviewComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.issue.number
    })
  core.info(`listReviewComments: ${JSON.stringify(listReviewComments)}`)
  listReviewComments.forEach(reviewComment =>
    mergeDeduplicatedArr(prRelate, parsePrOwnRepoRelate(reviewComment.body))
  )

  //   获取 pull request 的所有 comment 信息
  const { data: listComments } = await octokit.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number
  })
  core.info(`listComments: ${JSON.stringify(listComments)}`)
  listComments.forEach(comment =>
    mergeDeduplicatedArr(prRelate, parsePrOwnRepoRelate(comment?.body))
  )

  return prRelate
}
