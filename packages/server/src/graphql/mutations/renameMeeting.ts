import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/lib/types/constEnums'
import linkify from 'parabol-client/lib/utils/linkify'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import RenameMeetingPayload from '../types/RenameMeetingPayload'

const renameMeeting = {
  type: GraphQLNonNull(RenameMeetingPayload),
  description: `Rename a meeting`,
  args: {
    name: {
      type: GraphQLNonNull(GraphQLString),
      description: 'the new meeting name'
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the meeting with the new name'
    }
  },
  resolve: async (
    _source,
    {name, meetingId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) {
      return {error: {message: 'Meeting not found'}}
    }
    const {facilitatorUserId, teamId} = meeting
    const viewerId = getUserId(authToken)
    if (viewerId !== facilitatorUserId) {
      return {error: {message: 'Only the facilitator can change the meeting name'}}
    }

    // VALIDATION
    if (name.length < 2 || name.length > 50) {
      return {error: {message: 'Invalid meeting name'}}
    }

    const links = linkify.match(name)
    if (links) {
      return standardError(new Error('Name cannot be a hyperlink'), {userId: viewerId})
    }

    // RESOLUTION
    meeting.name = name
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({
        name
      })
      .run()

    const data = {meetingId}
    publish(SubscriptionChannel.TEAM, teamId, 'RenameMeetingSuccess', data, subOptions)

    return data
  }
}

export default renameMeeting
