'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bus, MessageCircle, Radio, Search, Tag, Truck, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { LandingDealCard } from '@/components/landing-deal-card';
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { api } from '@/lib/api';
import { mapInventoryItem, type InventoryListResponse, type InventoryPagination } from '@/lib/inventory';
import { pad2 } from '@/lib/utils';
import type { InventoryUnit } from '@/types';

const INVENTORY_BODY_FILTER = 'class-b';
const FEATURED_DEALS_COUNT = 10;

function useLiveShowCountdown() {
  const [endAt] = useState(() => Date.now() + (2 * 3600 + 14 * 60 + 22) * 1000);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const remaining = Math.max(0, endAt - now);
  const totalSec = Math.floor(remaining / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h, m, s };
}

async function fetchFeaturedInventories(): Promise<{ inventories: InventoryUnit[]; pagination: InventoryPagination }> {
  const res = (await api.get('inventory', {
    params: {
      currentPage: 1,
      perPage: FEATURED_DEALS_COUNT,
      body: INVENTORY_BODY_FILTER,
    },
  })) as InventoryListResponse;

  const { inventories, pagination } = res.data;
  return {
    inventories: inventories.map(mapInventoryItem),
    pagination,
  };
}

export default function HomePage() {
  const { h, m, s } = useLiveShowCountdown();
  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dealsCarouselApi, setDealsCarouselApi] = useState<CarouselApi>();
  const [canDealsPrev, setCanDealsPrev] = useState(false);
  const [canDealsNext, setCanDealsNext] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    fetchFeaturedInventories()
      .then((res) => {
        if (ignore) return;
        setUnits(res.inventories);
        setTotal(res.pagination.total);
      })
      .catch((err: Error) => {
        if (ignore) return;
        setError(err.message || 'Failed to load inventory');
        setUnits([]);
        setTotal(0);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!dealsCarouselApi) return;
    const sync = () => {
      setCanDealsPrev(dealsCarouselApi.canScrollPrev());
      setCanDealsNext(dealsCarouselApi.canScrollNext());
    };
    sync();
    dealsCarouselApi.on('reInit', sync);
    dealsCarouselApi.on('select', sync);
    return () => {
      dealsCarouselApi.off('reInit', sync);
      dealsCarouselApi.off('select', sync);
    };
  }, [dealsCarouselApi]);

  const openWidget = () => (window as any).ViewProWidget?.open();

  return (
    <div className="pb-20">
      <section className="relative min-h-[calc(100vh-116px)] w-full overflow-hidden md:min-h-[calc(100vh-80px)]">
        <Image
          src="/images/landing_hero.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/80 via-black/45 to-black/15"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-black/20"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-116px)] max-w-7xl flex-col px-4 py-20 md:min-h-[calc(100vh-80px)] md:px-6 md:py-20">
          <div className="flex min-h-0 flex-1 flex-col justify-start md:justify-center">
            <div className="max-w-xl">
              <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md md:text-5xl md:leading-[1.08]">
                <span className="block">Find Your Van.</span>
                <span className="block">
                  Start <span className="text-primary">your life.</span>
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-sm font-medium text-white/95 md:text-lg md:leading-relaxed">
                <span className="block">Browse real vans. See them live.</span>
                <span className="block">Get the best price without the runaround.</span>
              </p>
              <div className="mt-8 flex w-full max-w-md flex-col gap-2">
                <Button
                  type="button"
                  size="lg"
                  className="bg-primary hover:bg-primary/80 h-12 w-full flex-row rounded-xl px-6 text-sm font-bold text-white uppercase shadow-lg sm:px-8"
                  onClick={openWidget}
                >
                  SEE VANS LIVE
                  <Video className="size-5 shrink-0" />
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-xl border-2 border-white/90 bg-transparent px-6 text-sm font-bold text-white uppercase hover:bg-white/10 sm:px-8"
                  asChild
                >
                  <Link href="/inventory">EXPLORE VANS</Link>
                </Button>
                <button
                  type="button"
                  onClick={openWidget}
                  className="mt-3 flex w-full max-w-md items-center gap-2 rounded-full bg-black/80 px-2 py-2 text-left shadow-lg ring-1 ring-white/10 transition hover:bg-black/90 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none sm:gap-3 sm:px-4"
                >
                  <div className="flex items-center gap-1">
                    <span
                      className="size-2 shrink-0 rounded-full bg-green-500 shadow-[0_0_0_2px_rgba(0,0,0,0.35)]"
                      aria-hidden
                    />
                    <div className="flex shrink-0 items-center pr-0.5">
                      {['/viewpro/public/avatars/default.jpg', '/viewpro/public/avatars/volkmar.jpg'].map((src, i) => (
                        <Image
                          key={src}
                          src={src}
                          alt=""
                          width={32}
                          height={32}
                          className={`size-8 rounded-full border-2 border-white object-cover ${i > 0 ? '-ml-4' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug font-bold tracking-tight text-white">LIVE NOW</p>
                    <p className="mt-0.5 text-xs leading-snug font-normal text-white/90">
                      Talk to a real person instantly
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-20 border-t border-black bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
          <div className="flex flex-col divide-y divide-neutral-200 md:flex-row md:items-center md:divide-x-0 md:divide-y-0">
            <div className="flex flex-1 items-center gap-4 py-6 first:pt-0 md:gap-5 md:py-0 md:pr-6">
              <Bus className="text-primary size-9 shrink-0" strokeWidth={1.75} aria-hidden />
              <div className="min-w-0 text-left">
                <p className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums md:text-[1.65rem]">
                  {total.toLocaleString('en-US')}
                </p>
                <p className="text-sm font-normal text-neutral-600">Vans Available</p>
              </div>
            </div>

            <div className="hidden shrink-0 md:flex md:items-center md:justify-center md:self-stretch" aria-hidden>
              <div className="h-14 w-px bg-neutral-200" />
            </div>

            <div className="flex flex-1 items-center gap-4 py-6 md:gap-5 md:px-6 md:py-0">
              <Tag className="text-primary size-9 shrink-0" strokeWidth={1.75} aria-hidden />
              <div className="min-w-0 text-left">
                <p className="text-sm font-normal text-neutral-600">Up to</p>
                <p className="text-2xl font-bold tracking-tight text-neutral-900 tabular-nums md:text-[1.65rem]">
                  $109,000
                </p>
                <p className="text-sm font-normal text-neutral-600">Off MSRP</p>
              </div>
            </div>

            <div className="hidden shrink-0 md:flex md:items-center md:justify-center md:self-stretch" aria-hidden>
              <div className="h-14 w-px bg-neutral-200" />
            </div>

            <div className="flex flex-1 items-center gap-4 py-6 md:gap-5 md:px-6 md:py-0">
              <Video className="text-primary size-9 shrink-0" strokeWidth={1.75} aria-hidden />
              <div className="min-w-0 text-left">
                <p className="text-2xl font-bold tracking-tight text-neutral-900 md:text-[1.65rem]">Live</p>
                <p className="text-sm leading-snug font-normal text-neutral-600">Walkthroughs Now</p>
              </div>
            </div>

            <div className="hidden shrink-0 md:flex md:items-center md:justify-center md:self-stretch" aria-hidden>
              <div className="h-14 w-px bg-neutral-200" />
            </div>

            <div className="flex flex-1 items-center gap-4 py-6 last:pb-0 md:gap-5 md:py-0 md:pl-6">
              <Truck className="text-primary size-9 shrink-0" strokeWidth={1.75} aria-hidden />
              <div className="min-w-0 text-left">
                <p className="text-2xl font-bold tracking-tight text-neutral-900 md:text-[1.65rem]">Nationwide</p>
                <p className="text-sm font-normal text-neutral-600">Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section id="deals" className="mx-auto max-w-7xl px-4 pt-12 md:px-6 md:pt-16">
        <form action="/inventory" method="get" className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2"
            aria-hidden
          />
          <Input
            name="q"
            type="search"
            placeholder="Search vans, brands, or features..."
            className="h-12 rounded-xl border-neutral-200 bg-neutral-100 pl-12 text-base shadow-none md:h-14 md:pl-14"
            autoComplete="off"
          />
        </form>

        <div className="mt-10 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl">
            Today&apos;s Best Van Deals
          </h2>
          <Link
            href="/inventory"
            className="text-primary flex shrink-0 items-center gap-2 text-sm font-bold hover:underline"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>

        {error ? <p className="text-destructive mt-6 text-center text-sm">{error}</p> : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="text-muted-foreground size-8" />
          </div>
        ) : (
          <div className="relative mt-8">
            <Carousel
              opts={{
                align: 'start',
                dragFree: false,
                watchDrag: (_api, evt) => {
                  const raw = evt.target;
                  if (!(raw instanceof Element)) return true;
                  return !raw.closest('[data-nested-embla-viewport]');
                },
              }}
              setApi={setDealsCarouselApi}
              className="w-full"
              key={units.map((u) => u.id).join('|')}
            >
              <CarouselContent className="-ml-3 md:-ml-4">
                {units.map((unit) => (
                  <CarouselItem
                    key={unit.id}
                    className="flex basis-[88%] pl-3 sm:basis-1/2 sm:pl-4 md:basis-[48%] lg:basis-1/3 lg:pl-4"
                  >
                    <LandingDealCard unit={unit} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {!dealsCarouselApi || canDealsPrev ? (
                <CarouselPrevious
                  variant="outline"
                  className="top-1/2 left-0 size-10 -translate-y-1/2 border-neutral-200 bg-white shadow-md hover:bg-neutral-100! hover:text-neutral-900! md:-left-1 [&_svg]:text-neutral-900! [&_svg]:hover:text-neutral-900!"
                />
              ) : null}
              {!dealsCarouselApi || canDealsNext ? (
                <CarouselNext
                  variant="outline"
                  className="top-1/2 right-0 size-10 -translate-y-1/2 border-neutral-200 bg-white shadow-md hover:bg-neutral-100! hover:text-neutral-900! md:-right-1 [&_svg]:text-neutral-900! [&_svg]:hover:text-neutral-900!"
                />
              ) : null}
            </Carousel>
          </div>
        )}

        {!loading && !error && units.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm">No units available right now.</p>
        ) : null}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-neutral-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6 md:py-3.5">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <span className="bg-primary flex size-9 items-center justify-center rounded-lg">
              <Radio className="size-4 text-white" />
            </span>
            <div>
              <p className="text-xs font-bold tracking-wide text-white/70 uppercase">Live van show</p>
              <p className="text-sm font-semibold">
                Next show starts in{' '}
                <span className="tabular-nums">
                  {pad2(h)} : {pad2(m)} : {pad2(s)}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2 md:gap-3">
            <Button
              type="button"
              className="bg-primary hover:bg-primary/80 flex h-10 flex-1 rounded-lg px-4 text-sm font-bold text-white"
              onClick={openWidget}
            >
              <Video className="size-4" />
              Join Live
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex h-10 flex-1 rounded-lg border-white/40 bg-transparent px-4 text-sm font-bold text-white hover:bg-white/10"
              onClick={openWidget}
            >
              <MessageCircle className="size-4" />
              Ask a question
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
