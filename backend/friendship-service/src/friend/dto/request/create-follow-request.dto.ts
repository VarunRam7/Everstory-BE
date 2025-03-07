import { FollowRequestStatus } from '../../../common/enum/follow-request-status.enum';

export class UserInfoDTO {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  isPrivate: boolean;

  constructor(
    id: string,
    firstName: string,
    lastName: string,
    profilePhoto: string,
    isPrivate: boolean,
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.profilePhoto = profilePhoto;
    this.isPrivate = isPrivate;
  }
}

export class CreateFollowRequestDTO {
  private requestBy: UserInfoDTO;
  private requestTo: UserInfoDTO;
  private requestToken: string;
  private status: FollowRequestStatus;
  private isExpired: boolean;

  constructor(
    requestBy: UserInfoDTO,
    requestTo: UserInfoDTO,
    requestToken: string,
    status: FollowRequestStatus,
    isExpired: boolean,
  ) {
    this.requestBy = requestBy;
    this.requestTo = requestTo;
    this.requestToken = requestToken;
    this.status = status;
    this.isExpired = isExpired;
  }

  public getRequestBy(): UserInfoDTO {
    return this.requestBy;
  }

  public setRequestBy(requestBy: UserInfoDTO): void {
    this.requestBy = requestBy;
  }

  public getRequestTo(): UserInfoDTO {
    return this.requestTo;
  }

  public setRequestTo(requestTo: UserInfoDTO): void {
    this.requestTo = requestTo;
  }

  public getRequestToken(): string {
    return this.requestToken;
  }

  public setRequestToken(requestToken: string): void {
    this.requestToken = requestToken;
  }

  public getStatus(): FollowRequestStatus {
    return this.status;
  }

  public setStatus(status: FollowRequestStatus): void {
    this.status = status;
  }

  public isIsExpired(): boolean {
    return this.isExpired;
  }

  public setIsExpired(isExpired: boolean): void {
    this.isExpired = isExpired;
  }
}
