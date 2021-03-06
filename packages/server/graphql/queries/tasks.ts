import {GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull} from 'graphql'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {DataLoaderWorker, GQLContext} from '../graphql'
import GraphQLISO8601Type from '../types/GraphQLISO8601Type'
import {TaskConnection} from '../types/Task'
import connectionFromTasks from './helpers/connectionFromTasks'

const getValidTeamIds = (teamIds: null | string[], tms: string[]) => {
  // the following comments can be removed pending #4070
  // const viewerTeamMembers = await dataLoader.get('teamMembersByUserId').load(viewerId)
  // const viewerTeamIds = viewerTeamMembers.map(({teamId}) => teamId)
  if (!teamIds) return tms
  // filter the teamIds array to only teams the user has a team member for
  return teamIds.filter((teamId) => tms.includes(teamId))
}

const getValidUserIds = async (
  userIds: null | string[],
  viewerId: string,
  validTeamIds: string[],
  dataLoader: DataLoaderWorker
) => {
  if (!userIds) return null
  if (userIds.length === 1 && userIds[0] === viewerId) return userIds
  // NOTE: this will filter out ex-teammembers. if that's a problem, we should use a different dataloader
  const teamMembersByUserIds = await dataLoader.get('teamMembersByUserId').loadMany(userIds)
  const teamMembersOnValidTeams = teamMembersByUserIds
    .flat()
    .filter((teamMember) => validTeamIds.includes(teamMember.teamId))
  const teamMemberUserIds = new Set(teamMembersOnValidTeams.map(({userId}) => userId))
  return userIds.filter((userId) => teamMemberUserIds.has(userId))
}

export default {
  type: new GraphQLNonNull(TaskConnection),
  args: {
    first: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'the number of tasks to return'
    },
    after: {
      type: GraphQLISO8601Type,
      description: 'the datetime cursor'
    },
    userIds: {
      type: GraphQLList(GraphQLID),
      description:
        'a list of user Ids that you want tasks for. if null, will return tasks for all possible team members. An id is null if it is not assigned to anyone.'
    },
    teamIds: {
      type: GraphQLList(GraphQLNonNull(GraphQLID)),
      description:
        'a list of team Ids that you want tasks for. if null, will return tasks for all possible active teams'
    },
    archived: {
      type: GraphQLBoolean,
      description: 'true to only return archived tasks; false to return active tasks',
      defaultValue: false
    },
    includeUnassigned: {
      type: GraphQLBoolean,
      description: 'if true, include unassigned tasks. If false, only return assigned tasks',
      defaultValue: false
    }
  },
  async resolve(
    _source,
    {first, after, userIds, teamIds, archived, includeUnassigned},
    {authToken, dataLoader}: GQLContext
  ) {
    // AUTH
    const viewerId = getUserId(authToken)

    // VALIDATE
    if (teamIds?.length > 100 || userIds?.length > 100) {
      const err = new Error('Task filter is too broad')
      standardError(err, {
        userId: viewerId,
        tags: {userIds, teamIds}
      })
      return connectionFromTasks([], 0, err)
    }
    // common queries
    // - give me all the tasks for a particular team (users: all, team: abc)
    // - give me all the tasks for a particular user (users: 123, team: all)
    // - give me all the tasks for a number of teams (users: all, team: [abc, def])
    // - give me all the tasks for a number of users (users: [123, 456], team: all)
    // - give me all the tasks for a set of users & teams (users: [123, 456], team: [abc, def])
    // - give me all the tasks for all the users on all the teams (users: all, team: all)

    // if archived is true & no userId filter is provided, it should include tasks for ex-team members
    // under no condition should it show tasks for archived teams

    const validTeamIds = getValidTeamIds(teamIds, authToken.tms)
    const validUserIds = await getValidUserIds(userIds, viewerId, validTeamIds, dataLoader)

    // RESOLUTION
    const tasks = await dataLoader.get('userTasks').load({
      first,
      after,
      userIds: validUserIds,
      teamIds: validTeamIds,
      archived,
      includeUnassigned
    })

    const filteredTasks = tasks.filter((task) => {
      if (isTaskPrivate(task.tags) && task.userId !== viewerId) return false
      return true
    })
    return connectionFromTasks(filteredTasks, first)
  }
}
