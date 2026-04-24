'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Heart, UserPlus, Share2, MoreHorizontal, ExternalLink, LayoutGrid } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/lib/api';
import { formatCount } from '@/lib/utils';
import profile from '@/data/profile';
import { mapVideoItem, type VideoListResponse } from '@/lib/video';
import type { VideoUnit } from '@/types';

async function fetchVideos(): Promise<{ videos: VideoUnit[] }> {
  const res = (await api.get('video')) as VideoListResponse;
  const { videos } = res.data;
  return {
    videos: videos.map(mapVideoItem),
  };
}

type Tab = 'videos' | 'liked';
type SortMode = 'latest' | 'popular' | 'oldest';

export default function AcademyPage() {
  const searchParams = useSearchParams();
  const queryRaw = searchParams.get('q') ?? '';
  const queryTrimmed = queryRaw.trim();
  const queryLower = queryTrimmed.toLowerCase();

  const [activeTab, setActiveTab] = useState<Tab>('videos');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [videos, setVideos] = useState<VideoUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    fetchVideos()
      .then((res) => {
        if (ignore) return;
        setVideos(res.videos);
      })
      .catch((err: Error) => {
        if (ignore) return;
        setError(err.message || 'Failed to load videos');
        setVideos([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const sortedVideos = useMemo(() => {
    const list = [...videos];
    const byCreated = (a: VideoUnit, b: VideoUnit) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    switch (sortMode) {
      case 'popular':
        list.sort((a, b) => b.views - a.views);
        break;
      case 'oldest':
        list.sort(byCreated);
        break;
      default:
        list.sort((a, b) => byCreated(b, a));
        break;
    }
    if (!queryLower) return list;
    return list.filter((v) => {
      const hay = `${v.title} ${v.description} ${v.username}`.toLowerCase();
      return hay.includes(queryLower);
    });
  }, [sortMode, queryLower, videos]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-3 pt-6 pb-10 sm:px-4 sm:pt-8 sm:pb-12">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
          <div className="relative shrink-0">
            <div
              className="relative h-32 w-32 rounded-full p-1 sm:h-36 sm:w-36 md:h-40 md:w-40"
              style={{
                background: 'linear-gradient(135deg, #25f4ee, #fe2c55, #25f4ee)',
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src={profile.avatar}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 128px, (max-width: 768px) 144px, 160px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="w-full min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-col items-center gap-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-4 sm:gap-y-1">
              <h1 className="text-2xl leading-tight font-bold text-black sm:text-3xl">{profile.fullName}</h1>
              <h2 className="text-sm text-gray-600 sm:text-base">@{profile.username}</h2>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start">
              <div>
                <span className="font-bold text-black">{profile.following}</span>{' '}
                <span className="text-sm text-gray-500">Following</span>
              </div>
              <div>
                <span className="font-bold text-black">{profile.followers}</span>{' '}
                <span className="text-sm text-gray-500">Followers</span>
              </div>
              <div>
                <span className="font-bold text-black">{profile.likes}</span>{' '}
                <span className="text-sm text-gray-500">Likes</span>
              </div>
            </div>

            <div className="mt-4 flex w-full max-w-md flex-wrap items-center justify-center gap-2 sm:max-w-none sm:justify-start">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary border-primary hover:bg-primary/80 h-10 min-w-26 flex-1 rounded-md border px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors sm:flex-initial sm:px-8 sm:py-2"
              >
                Follow
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 min-w-26 flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-black transition-colors hover:bg-gray-50 sm:flex-initial sm:px-8 sm:py-2"
              >
                Message
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 min-w-10 items-center justify-center rounded-md border border-gray-300 transition-colors hover:bg-gray-50"
                aria-label="Add friend"
              >
                <UserPlus className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: profile.fullName,
                      url: '#',
                    });
                  } else {
                    window.open('#', '_blank');
                  }
                }}
                className="flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-md border border-gray-300 transition-colors hover:bg-gray-50"
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-md border border-gray-300 transition-colors hover:bg-gray-50"
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm text-pretty text-black">{profile.bio}</p>
            <Link
              href={profile.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex cursor-pointer items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {profile.website}
            </Link>
          </div>
        </div>

        <div className="mt-6 mb-4 flex min-h-12 flex-col gap-3 border-b border-gray-200 pb-3 sm:mt-8 sm:flex-row sm:items-stretch sm:justify-between sm:gap-0 sm:pb-0">
          <div className="flex h-full min-h-12 w-full sm:w-auto sm:shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('videos')}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors sm:flex-initial sm:px-8 sm:py-2 ${
                activeTab === 'videos'
                  ? 'border-b-2 border-black text-black sm:border-b-2'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="h-4 w-4 shrink-0" />
              Videos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('liked')}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors sm:flex-initial sm:px-8 sm:py-2 ${
                activeTab === 'liked'
                  ? 'border-b-2 border-black text-black sm:border-b-2'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Heart className="h-4 w-4 shrink-0" />
              Liked
            </button>
          </div>

          <div className="flex h-10 w-full shrink-0 items-stretch rounded-md bg-gray-200 p-1 sm:h-10 sm:w-auto sm:items-center">
            {(['latest', 'popular', 'oldest'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSortMode(mode)}
                className={`h-full flex-1 cursor-pointer px-2 text-xs font-medium capitalize transition-colors sm:flex-initial sm:px-2 sm:text-sm ${
                  sortMode === mode
                    ? 'rounded-md bg-white font-semibold text-black shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'videos' && queryTrimmed ? (
          <div className="mb-4 flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-4">
            <p className="min-w-0 text-gray-700">
              Results for <span className="font-semibold text-black">{queryTrimmed}</span>
              <span className="ml-2 text-gray-500">
                ({sortedVideos.length} {sortedVideos.length === 1 ? 'video' : 'videos'})
              </span>
            </p>
            <Link
              href="/academy"
              className="text-primary shrink-0 self-start font-semibold hover:underline sm:self-auto"
            >
              Clear search
            </Link>
          </div>
        ) : null}

        {error ? <p className="text-destructive py-4 text-center text-sm">{error}</p> : null}

        {activeTab === 'videos' ? (
          loading ? (
            <div className="flex justify-center py-20">
              <Spinner className="text-muted-foreground size-8" />
            </div>
          ) : sortedVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
              <p className="text-lg font-semibold text-gray-600">
                {queryTrimmed ? 'No videos match your search' : 'No videos yet'}
              </p>
              <p className="mt-1 max-w-md text-sm text-gray-400">
                {queryTrimmed
                  ? 'Try different keywords or browse all academy videos.'
                  : 'Check back soon for new academy content.'}
              </p>
              {queryTrimmed ? (
                <Link href="/academy" className="text-primary mt-4 text-sm font-semibold hover:underline">
                  View all videos
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {sortedVideos.map((video) => (
                <Link
                  key={video.id}
                  href={`/academy/${video.id}`}
                  className="group relative aspect-9/16 overflow-hidden rounded-md sm:rounded-lg"
                >
                  <Image
                    src={video.thumbnail}
                    alt={video.title || ''}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                    className="object-cover"
                  />

                  <div className="absolute bottom-1.5 left-1.5 z-1 flex items-center gap-0.5 sm:bottom-2 sm:left-2 sm:gap-1">
                    <Play className="h-2.5 w-2.5 shrink-0 fill-white text-white sm:h-3 sm:w-3" />
                    <span className="text-[10px] font-semibold text-white sm:text-xs">{formatCount(video.views)}</span>
                  </div>

                  <div className="absolute inset-0 z-1 bg-black/0 transition-colors active:bg-black/15 sm:bg-black/10 sm:opacity-0 sm:group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Heart className="mb-4 h-16 w-16 stroke-1" />
            <p className="text-lg font-semibold text-gray-500">No liked videos yet</p>
            <p className="mt-1 text-sm text-gray-400">Videos liked by {profile.username} will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
