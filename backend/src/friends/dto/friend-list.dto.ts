// src/friends/dto/friend-list.dto.ts

export class FriendResponseDto {
  id!: string;
  name!: string;
  username!: string;
  image: string | null = null;
  isOnSameEvent!: boolean;
}

export class FriendsGroupedDto {
  onSameEvent: FriendResponseDto[] = [];
  otherFriends: FriendResponseDto[] = [];
}

export class FriendProfileDto {
  id!: string;
  name!: string;
  username!: string;
  image: string | null = null;
  totalEventsCount!: number;
  commonEvents: any[] = [];
}
