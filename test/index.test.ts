import * as utils from '../src/utils'
import { Config } from '../src/config'

const config: Config = {
  labels: ['fix', 'chore'],
  labelMapping: {
    'feat': ['feature'],
    'fix(ui)': ['fix', 'ui']
  }
}

describe('Extract Utils Tests', () => {
  test('test label extraction from list', async (done) => {
    done(expect(utils.extractLabels('chore: Update README', config)).toEqual(['chore']))
    done(expect(utils.extractLabels('fix: Extract labels correctly', config)).toEqual(['fix']))
  })

  test('test label extraction from map', async (done) => {
    done(expect(utils.extractLabels('feat: Add links support', config)).toEqual(['feature']))
    done(expect(utils.extractLabels('fix(ui): Render buttons correctly', config)).toEqual(['fix', 'ui']))
  })

  test('test current label extraction', async (done) => {
    const labels = [{ name: 'fix' }, { name: 'ui' }]
    done(expect(utils.extractCurrentLabels(labels)).toEqual(['fix', 'ui']))
  })
})

describe('Set Operation Tests', () => {
  test('calculate resultant labels', async (done) => {
    const newLabels = ['feat']
    const currentLabels = ['fix', 'ui', 'approved']
    const oldLabels = ['fix', 'ui']

    done(expect(utils.calculateResultantLabels(newLabels, currentLabels, oldLabels)).toEqual(['feat', 'approved']))
  })

  test('calculate resultant labels 2', async (done) => {
    const newLabels = ['fix']
    const currentLabels = ['fix', 'ui', 'approved']
    const oldLabels = ['fix', 'ui']

    done(expect(utils.calculateResultantLabels(newLabels, currentLabels, oldLabels)).toEqual(['fix', 'approved']))
  })

  test('test resultant labels on PR', async (done) => {
    const pullRequest = {
      pull_request: {
        title: 'fix: Handle mixed intent type',
        labels: [{ name: 'fix' }, { name: 'ui' }, { name: 'approved' }]
      },
      changes: {
        title: {
          from: 'fix(ui): Make text larger'
        }
      }
    }

    done(expect(utils.extractLabelsFromPR(pullRequest, config)).toEqual(['fix', 'approved']))
  })

  test('test resultant labels on PR 2', async (done) => {
    const pullRequest = {
      pull_request: {
        title: 'fix(ui): Handle mixed intent type',
        labels: [{ name: 'feature' }, { name: 'approved' }]
      },
      changes: {
        title: {
          from: 'feat: Make text larger'
        }
      }
    }

    done(expect(utils.extractLabelsFromPR(pullRequest, config)).toEqual(['fix', 'ui', 'approved']))
  })

  test('test resultant labels on PR 3', async (done) => {
    const pullRequest = {
      pull_request: {
        title: 'feat: Handle mixed intent type',
        labels: [{ name: 'fix' }, { name: 'approved' }]
      },
      changes: {
        title: {
          from: 'fix: Make text larger'
        }
      }
    }

    done(expect(utils.extractLabelsFromPR(pullRequest, config)).toEqual(['feature', 'approved']))
  })

  test('test resultant labels on PR edge case', async (done) => {
    const pullRequest = {
      pull_request: {
        title: 'fix: Handle mixed intent type',
        labels: [{ name: 'fix' }, { name: 'ui' }, { name: 'approved' }]
      },
      changes: {
        title: {
          from: 'fix: Make text larger'
        }
      }
    }

    done(expect(utils.extractLabelsFromPR(pullRequest, config)).toEqual(['fix', 'ui', 'approved']))
  })

  test('test resultant labels on PR created', async (done) => {
    const pullRequest = {
      pull_request: {
        title: 'fix(ui): Handle mixed intent type',
        labels: []
      }
    }

    done(expect(utils.extractLabelsFromPR(pullRequest, config)).toEqual(['fix', 'ui']))
  })

  test('test resultant labels on PR no change', async (done) => {
    const pullRequest = {
      pull_request: {
        title: 'fix(ui): Handle mixed intent type',
        labels: [{ name: 'fix' }, { name: 'approved' }]
      }
    }

    const expected = ['fix', 'ui', 'approved']
    expect(utils.extractLabelsFromPR(pullRequest, config)).toEqual(expected)
    done(expect(utils.shouldUpdateLabels(pullRequest, expected)).toBe(true))
  })

  test('test no label extraction', async (done) => {
    const pullRequest = {
      pull_request: {
        title: 'build(deps): Handle mixed intent type',
        labels: []
      }
    }

    expect(utils.extractLabelsFromPR(pullRequest, config)).toEqual([])
    done(expect(utils.shouldUpdateLabels(pullRequest, [])).toBe(false))
  })
})
