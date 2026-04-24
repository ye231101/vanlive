'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Bus,
  Camera,
  ChevronLeft,
  ChevronRight,
  Cog,
  Fuel,
  Gauge,
  LayoutTemplate,
  MapPin,
  Ruler,
  Tag,
  Video,
} from 'lucide-react';
import { formatPrice, formatMileage, formatSlideouts, rebateEndsLabel } from '@/lib/utils';
import type { InventoryUnit } from '@/types';
import { Button } from './ui/button';

export function InventoryCard({ unit }: { unit: InventoryUnit }) {
  const router = useRouter();
  const [slideIndex, setSlideIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const slides = useMemo(() => {
    const base =
      unit.images && unit.images.length > 0
        ? unit.images
        : unit.defaultImageUrl
          ? [unit.defaultImageUrl]
          : ['/images/photos_coming_soon.jpg'];
    return base;
  }, [unit.images, unit.defaultImageUrl]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSlideIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleLiveClick = () => (window as any).ViewProWidget?.open();

  const classLabel = unit.wI_Body;
  const msrp = unit.wI_ListPrice;
  const salePrice = unit.websitePrice ?? 0;
  const hasWebsitePrice = salePrice > 0;
  const discountPct = msrp > 0 ? Math.round((1 - salePrice / msrp) * 100) : 0;
  const savings = Math.max(0, msrp - salePrice);
  const hasRebateBreakdown = Boolean(unit.rebate?.amount && unit.rebate.amount > 0) && !unit.isTooLowToShow;
  const listMinusSale = Math.max(0, msrp - salePrice);
  const netAfterRebate = hasRebateBreakdown ? Math.max(0, salePrice - (unit.rebate?.amount ?? 0)) : salePrice;
  const rebateFootnote = hasRebateBreakdown && unit.rebate ? rebateEndsLabel(unit.rebate.enddate) : null;

  return (
    <article
      onClick={() => router.push(`/inventory/${unit.id}`)}
      className="flex flex-1 cursor-pointer flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white"
      aria-label={`View details: ${unit.title}`}
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-t-2xl">
        <div className="h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full touch-pan-y">
            {slides.map((src: string, i: number) => (
              <div key={`${unit.id}-slide-${i}`} className="relative min-w-0 shrink-0 grow-0 basis-full">
                <img src={src} alt="" className="h-full w-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/10" />

        {canScrollPrev && (
          <button
            type="button"
            aria-label="Previous photo"
            className="absolute top-1/2 left-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md transition hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              emblaApi?.scrollPrev();
            }}
          >
            <ChevronLeft className="size-5" strokeWidth={2} />
          </button>
        )}
        {canScrollNext && (
          <button
            type="button"
            aria-label="Next photo"
            className="absolute top-1/2 right-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md transition hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              emblaApi?.scrollNext();
            }}
          >
            <ChevronRight className="size-5" strokeWidth={2} />
          </button>
        )}

        <div className="absolute right-3 bottom-3 z-10 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white tabular-nums backdrop-blur-[2px]">
          <Camera className="size-3.5 shrink-0 opacity-95" strokeWidth={2} aria-hidden />
          <span>
            {slideIndex + 1} / {slides.length}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {unit.wI_InventoryType === 'New' ? (
              <span className="w-fit rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                New
              </span>
            ) : (
              <span className="w-fit rounded-md bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-800">Used</span>
            )}
            {unit.inFlashSale && (
              <span className="w-fit rounded-md bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">
                Flash Sale
              </span>
            )}
            {unit.isSpecialOffer && (
              <span className="w-fit rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">
                Special offer
              </span>
            )}
          </div>

          <h3 className="text-lg leading-snug font-bold tracking-tight text-neutral-900 md:text-xl">{unit.title}</h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-800">
            <span className="inline-flex items-center gap-1.5">
              <Tag className="size-3.5 shrink-0" strokeWidth={2} />
              Stock# {unit.stockNumber}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" strokeWidth={2} />
              {unit.location}
            </span>
          </div>
        </div>

        {unit.isTooLowToShow ? (
          hasWebsitePrice || msrp > 0 ? (
            <div className="flex-1 space-y-1">
              {hasWebsitePrice ? (
                <p className="text-xl font-bold tracking-tight text-neutral-900 line-through decoration-neutral-900/75">
                  {formatPrice(salePrice)}
                </p>
              ) : null}
              {msrp > 0 ? (
                <span className="text-sm">
                  MSRP <span className="text-neutral-800 line-through">{formatPrice(msrp)}</span>
                </span>
              ) : null}
            </div>
          ) : (
            <div className="flex-1" />
          )
        ) : !hasWebsitePrice ? (
          <div className="flex-1" />
        ) : hasRebateBreakdown ? (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-neutral-800">MSRP</span>
              <span className="shrink-0 font-medium text-neutral-900 tabular-nums">{formatPrice(msrp)}</span>
            </div>
            {listMinusSale > 0 ? (
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-neutral-800">Discount</span>
                <span className="shrink-0 font-semibold text-green-800 tabular-nums">
                  {`- ${formatPrice(listMinusSale)}`}
                </span>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-neutral-800">Sale Price</span>
              <span className="shrink-0 font-medium text-neutral-900 tabular-nums">{formatPrice(salePrice)}</span>
            </div>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-neutral-800">Manufacturer Rebate</span>
              <span className="shrink-0 font-semibold text-green-800 tabular-nums">
                {`- ${formatPrice(unit.rebate!.amount)}`}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 text-lg font-bold">
              <span className="text-neutral-800">Net Price</span>
              <span className="shrink-0 font-bold text-neutral-900 tabular-nums">{formatPrice(netAfterRebate)}</span>
            </div>
            {rebateFootnote ? <p className="text-xs text-neutral-500">{rebateFootnote}</p> : null}
          </div>
        ) : savings > 0 ? (
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="text-2xl font-bold text-red-800 tabular-nums">-{discountPct}%</span>
              <span className="text-2xl font-bold text-neutral-900 tabular-nums">{formatPrice(salePrice)}</span>
            </div>
            <p className="text-sm text-neutral-800">
              {unit.wI_InventoryType === 'Used' ? 'Was' : 'MSRP'}{' '}
              <span className="line-through">{formatPrice(msrp)}</span>
            </p>
            <p className="text-sm font-semibold text-green-800 tabular-nums">You save {formatPrice(savings)}</p>
          </div>
        ) : (
          <div className="flex-1 space-y-1">
            <p className="text-2xl font-bold text-neutral-900 tabular-nums">{formatPrice(salePrice)}</p>
            {msrp > salePrice + 0.5 ? (
              <span className="text-sm">
                {unit.wI_InventoryType === 'Used' ? 'Was' : 'MSRP'}{' '}
                <span className="text-neutral-800 line-through">{formatPrice(msrp)}</span>
              </span>
            ) : null}
          </div>
        )}

        <div className="my-0 border-b border-neutral-200" />

        <div className="grid grid-cols-3 gap-x-2 gap-y-3.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <Bus className="size-4 shrink-0 text-neutral-500" strokeWidth={2} />
            <span className="truncate text-xs text-neutral-500">{classLabel}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Fuel className="size-4 shrink-0 text-neutral-500" strokeWidth={2} />
            <span className="truncate text-xs text-neutral-500">{unit.wI_Fuel}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Gauge className="size-4 shrink-0 text-neutral-500" strokeWidth={2} />
            <span className="truncate text-xs text-neutral-500">{formatMileage(unit.wI_Mileage)}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Ruler className="size-4 shrink-0 text-neutral-500" strokeWidth={2} />
            <span className="truncate text-xs text-neutral-500">{unit.wI_Length} ft</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <LayoutTemplate className="size-4 shrink-0 text-neutral-500" strokeWidth={2} />
            <span className="truncate text-xs text-neutral-500">{formatSlideouts(unit.slideOutsCount)}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Cog className="size-4 shrink-0 text-neutral-500" strokeWidth={2} />
            <span className="truncate text-xs text-neutral-500">{unit.wI_Engine || 'N/A'}</span>
          </div>
        </div>

        {unit.isTooLowToShow ? (
          <Button
            type="button"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/inventory/${unit.id}`);
            }}
            className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-teal-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800/90"
          >
            Price too low to show
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              handleLiveClick();
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors"
          >
            See This Van Live
            <Video className="size-4 shrink-0" />
          </Button>
        )}
      </div>
    </article>
  );
}
