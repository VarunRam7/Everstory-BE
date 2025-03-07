import { Injectable, Logger } from '@nestjs/common';

import { RelationshipRepository } from './relationship.repository';

@Injectable()
export class RelationshipService {
  private readonly logger = new Logger(RelationshipService.name);

  constructor(
    private readonly relationshipRepository: RelationshipRepository,
  ) {}

  async createRelationship(followedBy: string, followed: string) {
    const relationship = await this.relationshipRepository
      .createRelationship(followedBy, followed)
      .catch((error) => {
        this.logger.error(
          `Error while attempting to create relationship between ${followedBy} and ${followed} | Error : ${error}`,
        );
        throw error;
      });
    this.logger.log(
      `user :: ${followedBy} started following user :: ${followed}`,
    );
    return relationship;
  }

  async unfollowUser(followedBy: string, followed: string) {
    try {
      const result = await this.relationshipRepository.removeRelationship(followedBy, followed);
      if (!result) {
        this.logger.warn(`No existing relationship found between ${followedBy} and ${followed}`);
        return null;
      }

      this.logger.log(`user :: ${followedBy} unfollowed user :: ${followed}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error while attempting to remove relationship between ${followedBy} and ${followed} | Error : ${error}`
      );
      throw error;
    }
  }


  async isFollowing(followedBy: string, followed: string): Promise<boolean> {
    try {
      const relationship = await this.relationshipRepository.findRelationship(
        followedBy,
        followed,
      );
      return !!relationship;
    } catch (error) {
      this.logger.error(
        `Error while checking if ${followedBy} is following ${followed} | Error: ${error}`,
      );
      throw error;
    }
  }

  async getUserFollowerFollowingCount(userId: string) {

    const { followers, following } =
      await this.relationshipRepository.getFollowersAndFollowingCount(userId);

    this.logger.log(
      `User ${userId} has ${followers} followers and is following ${following} users`,
    );
    return { followers, following };
  }
}
