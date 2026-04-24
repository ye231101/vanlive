export interface Profile {
  id: string;
  avatar: string;
  fullName: string;
  username: string;
  following: number;
  followers: number;
  likes: number;
  bio: string;
  website: string;
  websiteUrl: string;
}

const profile: Profile = {
  id: '1',
  avatar: '/viewpro/public/avatars/volkmar.jpg',
  fullName: 'Turbo',
  username: 'dealershiplive',
  following: 109,
  followers: 11,
  likes: 42,
  bio: 'video ai for dealerships',
  website: 'viewpro.com',
  websiteUrl: 'https://viewpro.com',
};

export default profile;
