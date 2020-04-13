import {GraphQLObjectType} from 'graphql'
import {GROUP, REFLECT, VOTE} from 'parabol-client/lib/utils/constants'
import GroupPhaseCompletePayload from './GroupPhaseCompletePayload'
import VotePhaseCompletePayload from './VotePhaseCompletePayload'
import ReflectPhaseCompletePayload from './ReflectPhaseCompletePayload'
import {GQLContext} from '../graphql'

const PhaseCompletePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'PhaseCompletePayload',
  fields: () => ({
    [REFLECT]: {
      type: ReflectPhaseCompletePayload,
      description: 'payload provided if the retro reflect phase was completed',
      resolve: (source) => source[REFLECT]
    },
    [GROUP]: {
      type: GroupPhaseCompletePayload,
      description: 'payload provided if the retro grouping phase was completed',
      resolve: (source) => source[GROUP]
    },
    [VOTE]: {
      type: VotePhaseCompletePayload,
      description: 'payload provided if the retro voting phase was completed',
      resolve: (source) => source[VOTE]
    }
  })
})

export default PhaseCompletePayload
