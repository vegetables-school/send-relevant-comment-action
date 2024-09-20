import * as core from '@actions/core'
import * as github from '@actions/github'
import { getPrRelate } from './pr_relate'

/**
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const octokit = github.getOctokit(
      process.env['GITHUB_TOKEN'] || core.getInput('github_token')
    )
    const context = github.context

    const getCustomCommentInput = core.getInput('custom_comment')
    const customCommentBody =
      getCustomCommentInput ||
      `This is a comment related to #${context.issue.number}`

    const prRelateArr = await getPrRelate(octokit, context)
    core.info(`Related issues or PRs: ${prRelateArr.join(', ')}`)

    prRelateArr.forEach(async issueNumber => {
      core.info(`Creating comment on issue #${issueNumber}`)
      octokit.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issueNumber,
        body: customCommentBody
      })
    })
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
