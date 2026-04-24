'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Play,
  Lock,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/lib/api';
import { formatCount } from '@/lib/utils';
import profile from '@/data/profile';
import { mapVideoItem, type VideoListResponse } from '@/lib/video';
import type { VideoUnit } from '@/types';

const shareTargets = [
  {
    name: 'WhatsApp',
    icon: '/images/social/whatsapp.png',
    url: (u: string) => `https://wa.me/?text=${encodeURIComponent(u)}`,
  },
  {
    name: 'Facebook',
    icon: '/images/social/facebook.png',
    url: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
  {
    name: 'X',
    icon: '/images/social/twitter.png',
    url: (u: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}`,
  },
  {
    name: 'LinkedIn',
    icon: '/images/social/linkedin.png',
    url: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
  },
  {
    name: 'Telegram',
    icon: '/images/social/telegram.png',
    url: (u: string) => `https://t.me/share/url?url=${encodeURIComponent(u)}`,
  },
  {
    name: 'Email',
    icon: '/images/social/email.png',
    url: (u: string) => `mailto:?subject=Check this out&body=${encodeURIComponent(u)}`,
  },
];

async function fetchVideos(): Promise<{ videos: VideoUnit[] }> {
  const res = (await api.get('video')) as VideoListResponse;
  const { videos } = res.data;
  return {
    videos: videos.map(mapVideoItem),
  };
}

export default function AcademyVideoPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [videos, setVideos] = useState<VideoUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentIndex = videos.findIndex((v) => v.id === videoId);
  const video = currentIndex >= 0 ? videos[currentIndex] : undefined;

  const [siteOrigin, setSiteOrigin] = useState('');
  useEffect(() => {
    setSiteOrigin(window.location.origin);
  }, []);

  const pageUrl = video && siteOrigin ? `${siteOrigin}/academy/${video.id}` : '';
  const academyPath = video ? `/academy/${video.id}` : '';

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'comments' | 'creator'>('comments');

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

  useEffect(() => {
    if (video) {
      setLiked(false);
      setBookmarked(false);
      setLikeCount(video.likes);
      setBookmarkCount(video.bookmarks);
      setCopied(false);
      setSidebarTab('comments');
    }
  }, [video]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      router.push(`/academy/${videos[currentIndex - 1].id}`);
    }
  }, [currentIndex, router, videos]);

  const goToNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      router.push(`/academy/${videos[currentIndex + 1].id}`);
    }
  }, [currentIndex, router, videos]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el.isContentEditable)) {
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrev();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      }
      if (e.key === 'Escape') {
        router.push('/academy');
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goToPrev, goToNext, router]);

  const toggleLike = () => {
    setLiked((p) => !p);
    setLikeCount((p) => (liked ? p - 1 : p + 1));
  };

  const toggleBookmark = () => {
    setBookmarked((p) => !p);
    setBookmarkCount((p) => (bookmarked ? p - 1 : p + 1));
  };

  const copyLink = async () => {
    if (!video) return;
    const toCopy = `${window.location.origin}/academy/${video.id}`;
    try {
      await navigator.clipboard.writeText(toCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = toCopy;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!loading && !video) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center text-gray-500 sm:min-h-[60vh]">
        <p className="text-base font-semibold sm:text-lg">{error ?? 'Video not found'}</p>
        <Link href="/academy" className="text-primary mt-3 min-h-11 text-sm font-semibold hover:underline">
          Back to Academy
        </Link>
      </div>
    );
  }

  const showLoadingShell = loading && !video;

  if (!showLoadingShell && !video) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-116px)] flex-col md:h-[calc(100vh-80px)] md:min-h-0 md:flex-row md:overflow-hidden">
      <div className="relative flex max-h-none min-h-[calc(100vh-116px)] w-full flex-1 shrink-0 flex-col items-center justify-center overflow-hidden bg-neutral-900 px-0 pt-0 pb-0 md:min-h-0">
        <Link
          href="/academy"
          className="absolute top-3 left-3 z-20 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:top-4 md:left-4 md:size-auto md:p-2"
          aria-label="Close"
        >
          <X className="h-6 w-6 cursor-pointer" />
        </Link>

        <div className="absolute top-1/2 right-4 z-10 hidden -translate-y-1/2 flex-col gap-3 md:flex">
          <button
            type="button"
            onClick={goToPrev}
            disabled={showLoadingShell || currentIndex === 0}
            className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 disabled:opacity-30"
            aria-label="Previous video"
          >
            <ChevronUp className="h-5 w-5 cursor-pointer" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            disabled={showLoadingShell || currentIndex === videos.length - 1}
            className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 disabled:opacity-30"
            aria-label="Next video"
          >
            <ChevronDown className="h-5 w-5 cursor-pointer" />
          </button>
        </div>

        <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center md:mt-0 md:py-0">
          <div className="relative mx-auto aspect-9/16 max-h-[calc(100vh-12rem)] w-full max-w-[min(100%,380px)] shrink-0 bg-black md:h-full md:max-h-full md:w-auto md:max-w-full">
            {!showLoadingShell ? (
              <>
                <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center rounded-lg p-3 sm:rounded-xl sm:p-4">
                  <p className="mb-3 line-clamp-3 text-center text-xs font-medium text-white/80 sm:mb-4 sm:text-sm">
                    {video!.title}
                  </p>
                  <a
                    href={video!.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-white/30 sm:px-5 sm:text-sm"
                  >
                    Watch Video
                  </a>
                </div>
                <video
                  key={video!.id}
                  src={video!.url}
                  poster={video!.thumbnail}
                  controls
                  playsInline
                  preload="metadata"
                  className="relative z-10 h-full w-full rounded-lg object-contain sm:rounded-xl"
                  aria-label={video!.title}
                />
              </>
            ) : (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-black/60 sm:rounded-xl"
                aria-busy="true"
                aria-label="Loading video"
              >
                <Spinner className="size-10 text-white/90" />
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-10 md:hidden">
            <button
              type="button"
              onClick={goToPrev}
              disabled={showLoadingShell || currentIndex === 0}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors active:bg-white/20 disabled:opacity-30"
              aria-label="Previous video"
            >
              <ChevronLeft className="h-6 w-6 cursor-pointer" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              disabled={showLoadingShell || currentIndex === videos.length - 1}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors active:bg-white/20 disabled:opacity-30"
              aria-label="Next video"
            >
              <ChevronRight className="h-6 w-6 cursor-pointer" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col border-t border-gray-200 bg-white md:w-[400px] md:max-w-[400px] md:flex-none md:shrink-0 md:border-t-0 md:border-l">
        {showLoadingShell ? (
          <>
            <div className="flex min-h-0 flex-1 flex-col md:overflow-hidden">
              <div className="border-b border-gray-100 px-3 py-3 sm:p-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="bg-muted h-10 w-10 shrink-0 animate-pulse rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="bg-muted h-4 w-32 max-w-full animate-pulse rounded" />
                    <div className="bg-muted h-3 w-24 animate-pulse rounded" />
                  </div>
                  <div className="bg-muted h-10 w-18 shrink-0 animate-pulse rounded-md" />
                </div>
              </div>
              <div className="border-b border-gray-100 px-3 py-3 sm:p-4">
                <div className="bg-muted mb-2 h-6 w-4/5 max-w-full animate-pulse rounded" />
                <div className="bg-muted h-4 w-full animate-pulse rounded" />
                <div className="bg-muted mt-2 h-4 w-[90%] animate-pulse rounded" />
              </div>
              <div className="border-b border-gray-100 px-3 py-3 sm:p-4">
                <div className="flex gap-6">
                  <div className="bg-muted h-14 w-10 animate-pulse rounded-md" />
                  <div className="bg-muted h-14 w-10 animate-pulse rounded-md" />
                  <div className="bg-muted h-14 w-10 animate-pulse rounded-md" />
                  <div className="bg-muted h-14 w-10 animate-pulse rounded-md" />
                </div>
              </div>
            </div>
            <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
              <div className="bg-muted h-11 w-full animate-pulse rounded-lg" />
            </div>
          </>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col md:overflow-hidden">
              <div className="border-b border-gray-100 px-3 py-3 sm:p-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <a
                    href={video!.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-white"
                  >
                    <Image
                      src={profile.avatar}
                      alt={profile.username}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </a>
                  <div className="min-w-0 flex-1 basis-[min(100%,12rem)]">
                    <Link href={academyPath} className="text-sm font-semibold text-black hover:underline">
                      @{video!.username || profile.username}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {video!.createdAt ? new Date(video!.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                  <a
                    href={video!.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary hover:bg-primary/80 flex min-h-10 shrink-0 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors sm:py-1.5"
                  >
                    Follow
                  </a>
                </div>
              </div>

              {(video!.title || video!.description) && (
                <div className="border-b border-gray-100 px-3 py-3 sm:p-4">
                  <p className="text-lg leading-relaxed font-bold text-pretty text-gray-800">{video!.title}</p>
                  <p className="text-sm leading-relaxed text-pretty text-gray-800">{video!.description}</p>
                </div>
              )}

              <div className="border-b border-gray-100 px-3 py-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start justify-between gap-2 sm:justify-start sm:gap-3">
                    <button
                      type="button"
                      onClick={toggleLike}
                      className="flex touch-manipulation flex-col items-center"
                    >
                      <span
                        className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full sm:h-9 sm:w-9 ${liked ? 'bg-red-500/10' : 'bg-gray-100'}`}
                      >
                        <Heart
                          className={`h-[18px] w-[18px] ${liked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
                        />
                      </span>
                      <span className="mt-1 text-xs text-gray-500">{likeCount}</span>
                    </button>

                    <a
                      href={video!.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex touch-manipulation flex-col items-center"
                    >
                      <span className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 sm:h-9 sm:w-9">
                        <MessageCircle className="h-[18px] w-[18px] text-gray-700" />
                      </span>
                      <span className="mt-1 text-xs text-gray-500">{video!.comments}</span>
                    </a>

                    <button
                      type="button"
                      onClick={toggleBookmark}
                      className="flex touch-manipulation flex-col items-center"
                    >
                      <span
                        className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full sm:h-9 sm:w-9 ${bookmarked ? 'bg-amber-50' : 'bg-gray-100'}`}
                      >
                        <Bookmark
                          className={`h-[18px] w-[18px] ${bookmarked ? 'fill-amber-500 text-amber-500' : 'text-gray-700'}`}
                        />
                      </span>
                      <span className="mt-1 text-xs text-gray-500">{bookmarkCount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: video!.title,
                            url: `${window.location.origin}/academy/${video!.id}`,
                          });
                        }
                      }}
                      className="flex touch-manipulation flex-col items-center"
                    >
                      <span className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 sm:h-9 sm:w-9">
                        <Share2 className="h-[18px] w-[18px] text-gray-700" />
                      </span>
                    </button>
                  </div>
                </div>

                <div className="-mx-1 mt-4 flex items-center gap-2 overflow-x-auto overflow-y-hidden px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {shareTargets.map((s) => (
                    <a
                      key={s.name}
                      href={pageUrl ? s.url(pageUrl) : '#'}
                      aria-disabled={!pageUrl}
                      onClick={!pageUrl ? (e) => e.preventDefault() : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Share on ${s.name}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-gray-200/80 transition-opacity active:opacity-80 sm:h-8 sm:w-8"
                    >
                      <Image src={s.icon} alt="" width={36} height={36} className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>

                <div className="mt-3 flex min-w-0 items-center gap-2 overflow-hidden rounded-lg bg-gray-100 p-2.5">
                  <p className="min-w-0 flex-1 truncate text-xs text-gray-600">{pageUrl || academyPath}</p>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="shrink-0 cursor-pointer touch-manipulation text-xs font-semibold text-gray-700 transition-colors hover:text-black"
                  >
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
              </div>

              <div className="flex flex-col px-3 py-3 sm:p-4 md:min-h-0 md:flex-1">
                <div className="mb-3 flex shrink-0 border-b border-gray-200 sm:mb-4">
                  <button
                    type="button"
                    onClick={() => setSidebarTab('comments')}
                    className={`min-h-11 flex-1 cursor-pointer px-1 pb-2.5 text-center text-[11px] leading-tight font-semibold transition-colors sm:min-h-0 sm:px-2 sm:text-sm ${
                      sidebarTab === 'comments'
                        ? 'border-b-2 border-black text-black'
                        : 'border-b-2 border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Comments ({video!.comments})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarTab('creator')}
                    className={`min-h-11 flex-1 cursor-pointer px-1 pb-2.5 text-center text-[11px] leading-tight font-semibold transition-colors sm:min-h-0 sm:px-2 sm:text-sm ${
                      sidebarTab === 'creator'
                        ? 'border-b-2 border-black text-black'
                        : 'border-b-2 border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <span className="sm:hidden">More videos</span>
                    <span className="hidden sm:inline">Creator videos</span>
                  </button>
                </div>

                {sidebarTab === 'comments' ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 md:min-h-0 md:flex-1">
                    <MessageCircle className="mb-3 h-14 w-14 stroke-1" />
                    <p className="text-sm font-semibold text-gray-500">Start the conversation</p>
                  </div>
                ) : (
                  <div className="max-h-[min(52vh,21rem)] min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-contain pr-0.5 [-ms-overflow-style:auto] [scrollbar-width:thin] md:max-h-none md:flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-track]:bg-transparent">
                    <div className="grid grid-cols-3 gap-2 sm:gap-1.5">
                      {videos
                        .filter((v) => v.id !== video!.id)
                        .slice(0, 9)
                        .map((v) => (
                          <Link
                            key={v.id}
                            href={`/academy/${v.id}`}
                            className="group relative aspect-9/16 touch-manipulation overflow-hidden rounded-md active:opacity-90 sm:rounded"
                          >
                            <Image src={v.thumbnail} alt="" fill sizes="120px" className="object-cover" />
                            <div className="absolute inset-0 z-1 flex items-center justify-center bg-black/20 p-1">
                              <p className="line-clamp-3 text-center text-[9px] leading-tight font-semibold text-white drop-shadow-sm">
                                {v.title}
                              </p>
                            </div>
                            <div className="absolute bottom-1 left-1 z-1 flex items-center gap-0.5">
                              <Play className="h-2 w-2 fill-white text-white drop-shadow-sm" />
                              <span className="text-[10px] font-semibold text-white drop-shadow-sm">
                                {formatCount(v.views)}
                              </span>
                            </div>
                            <div className="absolute inset-0 z-1 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
              <a
                href={video!.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary/80 active:bg-primary/90 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-colors"
              >
                <Lock className="h-4 w-4" />
                Log in to comment
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
