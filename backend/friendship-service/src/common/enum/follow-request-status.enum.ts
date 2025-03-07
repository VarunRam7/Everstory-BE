export enum ResponseEnum {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum FollowRequestStatus {
  PENDING = 'pending',
  ACCEPTED = ResponseEnum.ACCEPTED,
  REJECTED = ResponseEnum.REJECTED,
}
