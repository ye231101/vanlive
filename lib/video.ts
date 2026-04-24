import { VideoUnit } from '@/types';

export interface VideoItem {
  id: string;
  username: string;
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  bookmarks: number;
  created_at: string;
  updated_at: string;
}

export interface VideoListResponse {
  code: number;
  message: string;
  data: {
    videos: VideoItem[];
  };
}

export interface VideoResponse {
  code: number;
  message: string;
  data: {
    video: VideoItem;
  };
}

export function mapVideoItem(r: VideoItem): VideoUnit {
  return {
    id: r.id,
    username: r.username,
    url: '/viewpro/' + r.url,
    thumbnail: '/viewpro/' + r.thumbnail,
    title: r.title,
    description: r.description,
    tags: r.tags,
    views: r.views,
    likes: r.likes,
    comments: r.comments,
    bookmarks: r.bookmarks,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
