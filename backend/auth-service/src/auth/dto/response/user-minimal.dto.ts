import { User } from '../../schema/user.schema';

export class UserMinimalDTO {
  private id: string;
  private firstName: string;
  private lastName: string;
  private profilePhoto: string;
  private isPrivate: boolean;

  constructor(user?: User) {
    this.id = user?._id ?? '';
    this.firstName = user?.firstName ?? '';
    this.lastName = user?.lastName ?? '';
    this.profilePhoto = user?.profilePhoto ?? '';
    this.isPrivate = user?.isPrivate ?? true;
  }

  public getId(): string {
    return this.id;
  }

  public setId(id: string): void {
    this.id = id;
  }

  public getFirstName(): string {
    return this.firstName;
  }

  public setFirstName(firstName: string): void {
    this.firstName = firstName;
  }

  public getLastName(): string {
    return this.lastName;
  }

  public setLastName(lastName: string): void {
    this.lastName = lastName;
  }

  public getProfilePhoto(): string {
    return this.profilePhoto;
  }

  public setProfilePhoto(profilePhoto: string): void {
    this.profilePhoto = profilePhoto;
  }

  public isIsPrivate(): boolean {
    return this.isPrivate;
  }

  public setIsPrivate(isPrivate: boolean): void {
    this.isPrivate = isPrivate;
  }
}
