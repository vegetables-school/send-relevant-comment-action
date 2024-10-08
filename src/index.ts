import * as core from '@actions/core'
import * as github from '@actions/github'
import { getPrRelate } from './pr_relate'

/**
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token')
    if (!token) {
      core.setFailed('GitHub token not found, please provide github-token')
    }
    const octokit = github.getOctokit(token)
    const context = github.context

    const getCustomCommentInput = core.getInput('custom-comment')
    const customCommentBody =
      getCustomCommentInput ||
      `This is a comment related to #${context.issue.number}`

    const prRelateArr = await getPrRelate(octokit, context)

    prRelateArr.forEach(async issueNumber => {
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

run()
