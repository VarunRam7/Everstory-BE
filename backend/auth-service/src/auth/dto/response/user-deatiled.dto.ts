import { User } from '../../schema/user.schema';
import { UserMinimalDTO } from './user-minimal.dto';

export class UserDetailedDTO extends UserMinimalDTO {
  private totalPosts: number;
  private posts: any[];

  constructor(user: User, totalPosts?: number, posts?: any[]) {
    super(user);
    this.totalPosts = totalPosts ?? 0;
    if (!user.isPrivate) {
      this.posts = posts ?? [];
    }
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
}
