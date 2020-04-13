import isTaskPrivate from 'parabol-client/lib/utils/isTaskPrivate'
import Task from '../database/types/Task'

const filterTasksByMeeting = (tasks: Task[], meetingId: string, viewerId: string) => {
  return tasks.filter((task) => {
    if (task.meetingId !== meetingId) return false
    if (isTaskPrivate(task.tags) && task.userId !== viewerId) return false
    return true
  })
}

export default filterTasksByMeeting
