import { Exclude } from 'class-transformer';

export class UserEntity {
  id!: string;
  email!: string;
  name?: string | null;
  avatarUrl?: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  @Exclude()
  supabaseId!: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}