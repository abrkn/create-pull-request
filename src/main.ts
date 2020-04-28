/* eslint-disable no-console */
import * as core from '@actions/core'
import * as github from '@actions/github'

function getBooleanInput(name: string): boolean | undefined {
  const value = core.getInput(name)

  if (value === undefined || value.length === 0) {
    return undefined
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  throw new Error(`Input ${name} must be true or false. Received "${value}"`)
}

async function run(): Promise<void> {
  try {
    const octokit = new github.GitHub(core.getInput('token'))

    const payload = {
      base: core.getInput('base') || 'master',
      body: core.getInput('body') || undefined,
      draft: getBooleanInput('draft') || undefined,
      // eslint-disable-next-line @typescript-eslint/camelcase
      maintainer_can_modify: getBooleanInput('maintainer_can_modify'),
      head: core.getInput('head'),
      owner: core.getInput('owner') || github.context.actor,
      repo: core.getInput('repo') || github.context.repo.repo,
      title: core.getInput('title') || github.context.ref
    }

    console.log('payload', payload)

    const response = await octokit.pulls.create(payload)

    if (response.status !== 201) {
      throw new Error(`Unexpected response status, ${response.status}`)
    }

    const outputNames: (keyof typeof response.data)[] = ['html_url', 'number']

    for (const outputName of outputNames) {
      core.setOutput(outputName, response.data[outputName].toString())
    }
  } catch (error) {
    console.error(error.stack)
    core.setFailed(error.message)
  }
}

run()
