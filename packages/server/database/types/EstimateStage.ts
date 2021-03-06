import {DISCUSS} from 'parabol-client/utils/constants'
import EstimateUserScore from './EstimateUserScore'
import GenericMeetingStage from './GenericMeetingStage'

interface Input {
  service: string
  serviceTaskId: string
  sortOrder: number
  durations: number[] | undefined
  dimensionId: string
  scores?: EstimateUserScore[]
  finalScore?: number
}

export default class EstimateStage extends GenericMeetingStage {
  service: string
  serviceTaskId: string
  sortOrder: number
  dimensionId: string
  finalScore?: number
  scores: EstimateUserScore[]
  isVoting: boolean
  constructor(input: Input) {
    super(DISCUSS, input.durations)
    const {service, serviceTaskId, sortOrder, dimensionId, scores} = input
    this.service = service
    this.serviceTaskId = serviceTaskId
    this.sortOrder = sortOrder
    this.dimensionId = dimensionId
    this.scores = scores || []
    this.isNavigable = true
    this.isNavigableByFacilitator = true
    this.isVoting = true
  }
}
