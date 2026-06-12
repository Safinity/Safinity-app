import { IsOptional, IsString } from 'class-validator';

export class AddFriendFromQrDto {
  @IsOptional()
  @IsString()
  payload?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
