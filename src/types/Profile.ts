/**
 * プロフィールのinterface
 * @package types
 */
/*types */
import { ImageType } from './Image';

/**
 * ProfileType
 */
export interface ProfileType {
  contents: {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    name: string;
    englishName: string;
    position: string;
    introduction: string;
    userImage: ImageType;
    articleImage: ImageType;
    description: string;
    contents: string;
    twitter: string;
    github: string;
    facebook: string;
  };
  limit: number;
  offset: number;
  totalCount: number;
}

export interface rootProfileType {
  profile: ProfileType;
}
