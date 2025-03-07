import { User } from '../../schema/user.schema';
import { UserMinimalDTO } from './user-minimal.dto';

export class UserDetailedDTO extends UserMinimalDTO {
  private totalPosts: number;
  private posts: any[];
  private isFollowing: boolean;
  private isRequested: boolean;
  private followersCount: number;
  private followingCount: number;

  constructor(
    user: User,
    totalPosts?: number,
    posts?: any[],
    isFollowing?: boolean,
    isRequested?: boolean,
    followersCount?: number,
    followingCount?: number,
  ) {
    super(user);
    this.totalPosts = totalPosts ?? 0;
    if (!user.isPrivate || (user.isPrivate && isFollowing)) {
      this.posts = posts ?? [];
    }
    this.isFollowing = isFollowing ?? false;
    this.isRequested = isRequested ?? false;
    this.followersCount = followersCount ?? 0;
    this.followingCount = followingCount ?? 0;
  }

  public getTotalPosts(): number {
    return this.totalPosts;
  }

  public setTotalPosts(totalPosts: number): void {
    this.totalPosts = totalPosts;
  }

  public getPosts(): any[] {
    return this.posts;
  }

  public setPosts(posts: any[]): void {
    this.posts = posts;
  }

  public isIsFollowing(): boolean {
    return this.isFollowing;
  }

  public setIsFollowing(isFollowing: boolean): void {
    this.isFollowing = isFollowing;
  }

  public isIsRequested(): boolean {
    return this.isRequested;
  }

  public setIsRequested(isRequested: boolean): void {
    this.isRequested = isRequested;
  }

  public getFollowersCount(): number {
    return this.followersCount;
  }

  public setFollowersCount(followersCount: number): void {
    this.followersCount = followersCount;
  }

  public getFollowingCount(): number {
    return this.followingCount;
  }

  public setFollowingCount(followingCount: number): void {
    this.followingCount = followingCount;
  }
}
