import _ from 'lodash'

import store from './index'
import { MOCK_STORE, CHANGE_TIMELINE_VIEW, SET_ACTIVE_CONSTRAINT_NAME } from './MutationTypes'
import { sleep } from '../utils/Helper'
import { Time } from '../types/BaseType'

async function prestart () {
  if (store.getters.hasMocked) {
    return
  }

  store.commit(MOCK_STORE)
  await sleep(1000)
}

export async function testWorkflow (candidates) {
  await prestart()
  // const testCandidates = _.range(1, 201).map(generateCandidate)

  const tc1 = await store.dispatch(
    'createConstraint',
    new Time(7, 30)
  )

  store.commit(CHANGE_TIMELINE_VIEW, [25200, 34200])
  store.commit(SET_ACTIVE_CONSTRAINT_NAME, 'Test Constraint #1')

  await store.dispatch(
    'setConstraintNodeLocationSource',
    {
      node: await store.dispatch(
        'insertConstraintNode',
        {
          constraint: tc1,
          timestamp: new Time(8, 0)
        }
      ),
      locationSourceDesc: _.find(
        await store.dispatch('fetchLocationSources'),
        d => d.id === 4
      )
    }
  )

  await store.dispatch('addWishlistCandidate', candidates[0])
  await store.dispatch('addWishlistCandidate', candidates[1])
  await store.dispatch('addWishlistCandidate', candidates[2])
}

export async function testReverse (candidates) {
  await prestart()

  const tc1 = await store.dispatch(
    'createConstraint',
    new Time(8, 30)
  )

  store.commit(CHANGE_TIMELINE_VIEW, [25200, 34200])
  store.commit(SET_ACTIVE_CONSTRAINT_NAME, 'Test Constraint #1')

  await store.dispatch(
    'setConstraintNodeLocationSource',
    {
      node: await store.dispatch(
        'insertConstraintNode',
        {
          constraint: tc1,
          timestamp: new Time(8, 0)
        }
      ),
      locationSourceDesc: _.find(
        await store.dispatch('fetchLocationSources'),
        d => d.id === 4
      )
    }
  )
}

export default function testDisabled () {}
