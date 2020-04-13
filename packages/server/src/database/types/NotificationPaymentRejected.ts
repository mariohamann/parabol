import Notification from './Notification'
import {NotificationEnum} from 'parabol-client/lib/types/graphql'

interface Input {
  orgId: string
  last4: string
  brand: string
  userId: string
}

export default class NotificationPaymentRejected extends Notification {
  orgId: string
  last4: string
  brand: string

  constructor(input: Input) {
    const {orgId, last4, brand, userId} = input
    super({userId, type: NotificationEnum.PAYMENT_REJECTED})
    this.orgId = orgId
    this.last4 = last4
    this.brand = brand
  }
}
