export class FriendResponseDto {
  id!: string;
  name!: string;
  username!: string;
  image: string | null = null;
  isOnSameEvent!: boolean;
  friendshipState?: string | null = null;
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
  friendshipState?: string | null = null;
  totalEventsCount!: number;
  commonEvents: any[] = [];
}
