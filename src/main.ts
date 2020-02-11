import * as core from '@actions/core'
import * as github from '@actions/github'

const wip = 'WIP'
const inReview = '[z] in review'
const inOther = '[z] in other'

async function run(): Promise<void> {
  try {
    core.debug('Starting')

    const token = core.getInput('repo-token', {required: true})

    const prNumber = getPrNumber()
    if (!prNumber) {
      core.debug('Could not get pull request number from context, exiting')
      return
    }

    const client = new github.GitHub(token)

    const labels = await getPrLabels(client, prNumber)

    if (labels.includes(wip)) {
      await addLabel(client, prNumber, 'test')
    } else {
      await addLabel(client, prNumber, 'test')
    }

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

const getPrNumber = (): number | undefined => {
  const pullRequest = github.context.payload.pull_request
  return pullRequest?.number
}

const getPrLabels = async (client: github.GitHub, prNumber: number) => {
  return (
    await client.issues.listLabelsOnIssue({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: prNumber
    })
  ).data
}

const addLabel = async (
  client: github.GitHub,
  prNumber: number,
  label: string
) => {
  await client.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prNumber,
    labels: [label]
  })
}

run()
