interface IUser extends IDocument {
    displayName: string;
    username: string;
    email: string;
    isVerified: boolean;
    password: string;
    bio?: string;
    location?: string;
    website?: string;
    avatar?: string;
    cover?: string;
    following: IObjectId[];
    followers?: IUser[]
    birthDay?: {
      day: number;
      month: number;
      year: number;
    }
    createdAt: Date;
    updatedAt: Date;
  }