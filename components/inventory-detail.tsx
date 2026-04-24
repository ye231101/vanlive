'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Cog,
  Fuel,
  Gauge,
  LayoutTemplate,
  MapPin,
  Ruler,
  Tag,
  Video,
} from 'lucide-react';
import { formatPrice, formatMileage, formatSlideouts, rebateEndsLabel, labelFromCustomTags } from '@/lib/utils';
import type { InventoryUnit } from '@/types';

function openConnectFallback() {
  (window as any).ViewProWidget?.open();
}

export function InventoryDetail({ unit }: { unit: InventoryUnit }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const slides = useMemo(() => {
    const base =
      unit.images && unit.images.length > 0
        ? unit.images
        : unit.defaultImageUrl
          ? [unit.defaultImageUrl]
          : ['/images/photos_coming_soon.jpg'];
    return base;
  }, [unit.images, unit.defaultImageUrl]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
  });

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

  useEffect(() => {
    if (slides.length <= 1) return;
    const el = thumbRefs.current[slideIndex];
    if (!el) return;
    el.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [slideIndex, slides.length]);

  useEffect(() => {
    document.title = `${unit.title} | Van Live`;
    return () => {
      document.title = 'Van Live';
    };
  }, [unit.title]);

  const bodyLabel = unit.wI_Body;
  const rvTypeLabel = labelFromCustomTags(unit.customTags, 'rvType');
  const msrp = unit.wI_ListPrice;
  const salePrice = unit.websitePrice ?? 0;
  const hasWebsitePrice = salePrice > 0;
  const discountPct = msrp > 0 ? Math.round((1 - salePrice / msrp) * 100) : 0;
  const savings = Math.max(0, msrp - salePrice);
  const hasRebateBreakdown = Boolean(unit.rebate?.amount && unit.rebate.amount > 0) && !unit.isTooLowToShow;
  const listMinusSale = Math.max(0, msrp - salePrice);
  const netAfterRebate = hasRebateBreakdown ? Math.max(0, salePrice - (unit.rebate?.amount ?? 0)) : salePrice;
  const rebateFootnote = hasRebateBreakdown && unit.rebate ? rebateEndsLabel(unit.rebate.enddate) : null;
  const driveTrainLabel = labelFromCustomTags(unit.customTags, 'driveTrain');

  return (
    <div className="mx-auto max-w-7xl p-4 pb-10 md:pb-16">
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100">
            <div className="h-full overflow-hidden" ref={emblaRef}>
              <div className="flex h-full touch-pan-y">
                {slides.map((src: string, i: number) => (
                  <div key={`${unit.id}-detail-${i}`} className="relative min-w-0 shrink-0 grow-0 basis-full">
                    <img src={src} alt="" className="h-full w-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
                  </div>
                ))}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-black/10" />

            <div className="absolute right-3 bottom-3 z-10 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white tabular-nums backdrop-blur-[2px]">
              <Camera className="size-3.5 shrink-0 opacity-95" strokeWidth={2} aria-hidden />
              <span>
                {slideIndex + 1} / {slides.length}
              </span>
            </div>

            {canScrollPrev && (
              <button
                type="button"
                aria-label="Previous photo"
                className="absolute top-1/2 left-2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md transition hover:bg-white"
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ChevronLeft className="size-5" strokeWidth={2} />
              </button>
            )}
            {canScrollNext && (
              <button
                type="button"
                aria-label="Next photo"
                className="absolute top-1/2 right-2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md transition hover:bg-white"
                onClick={() => emblaApi?.scrollNext()}
              >
                <ChevronRight className="size-5" strokeWidth={2} />
              </button>
            )}
          </div>

          {slides.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5">
              {slides.map((src, i) => (
                <button
                  key={`${unit.id}-thumb-${i}`}
                  ref={(node) => {
                    thumbRefs.current[i] = node;
                  }}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    i === slideIndex
                      ? 'border-primary ring-primary/30 ring-1'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Photo ${i + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            {unit.wI_InventoryType === 'New' ? (
              <span className="w-fit rounded-md bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                New
              </span>
            ) : (
              <span className="w-fit rounded-md bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-800">Used</span>
            )}
            {unit.inFlashSale && (
              <span className="w-fit rounded-md bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">
                Flash Sale
              </span>
            )}
            {unit.isSpecialOffer && (
              <span className="w-fit rounded-md bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">
                Special offer
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">{unit.title}</h1>
            <p className="mt-1 text-base text-neutral-700">
              {bodyLabel} {rvTypeLabel}
            </p>
            <div className="mt-2 flex flex-col gap-y-1">
              <p className="inline-flex items-center gap-1.5 text-sm text-neutral-500">
                <Tag className="size-4 shrink-0" strokeWidth={2} />
                Stock# {unit.stockNumber}
              </p>
              <p className="inline-flex items-center gap-1.5 text-sm text-teal-800">
                <MapPin className="size-4 shrink-0" strokeWidth={2} />
                {unit.location}
              </p>
            </div>
          </div>

          <div className="border-b border-neutral-200 pb-5">
            {unit.isTooLowToShow ? (
              hasWebsitePrice || msrp > 0 ? (
                <div className="space-y-1">
                  {hasWebsitePrice ? (
                    <p className="text-3xl font-bold tracking-tight text-neutral-900 line-through decoration-neutral-900/75">
                      {formatPrice(salePrice)}
                    </p>
                  ) : null}
                  {msrp > 0 ? (
                    <span className="text-sm">
                      MSRP <span className="text-neutral-800 line-through">{formatPrice(msrp)}</span>
                    </span>
                  ) : null}
                </div>
              ) : null
            ) : !hasWebsitePrice ? null : hasRebateBreakdown ? (
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
                  <span className="shrink-0 font-bold text-neutral-900 tabular-nums">
                    {formatPrice(netAfterRebate)}
                  </span>
                </div>
                {rebateFootnote ? <p className="text-xs text-neutral-500">{rebateFootnote}</p> : null}
              </div>
            ) : savings > 0 ? (
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span className="text-3xl font-bold text-red-800 tabular-nums">-{discountPct}%</span>
                  <span className="text-3xl font-bold text-neutral-900 tabular-nums">{formatPrice(salePrice)}</span>
                </div>
                <p className="text-sm text-neutral-800">
                  {unit.wI_InventoryType === 'Used' ? 'Was' : 'MSRP'}{' '}
                  <span className="line-through">{formatPrice(msrp)}</span>
                </p>
                <p className="text-sm font-semibold text-green-800 tabular-nums">You save {formatPrice(savings)}</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-3xl font-bold text-neutral-900 tabular-nums">{formatPrice(salePrice)}</p>
                {msrp > salePrice + 0.5 ? (
                  <span className="text-sm">
                    {unit.wI_InventoryType === 'Used' ? 'Was' : 'MSRP'}{' '}
                    <span className="text-neutral-800 line-through">{formatPrice(msrp)}</span>
                  </span>
                ) : null}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-slate-200/90 px-4 py-3">
              <Fuel className="size-8 shrink-0 text-neutral-500" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">Fuel Type</p>
                <p className="font-semibold text-neutral-900">{unit.wI_Fuel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-200/90 px-4 py-3">
              <Gauge className="size-8 shrink-0 text-neutral-500" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">Mileage</p>
                <p className="font-semibold text-neutral-900">{formatMileage(unit.wI_Mileage)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-200/90 px-4 py-3">
              <LayoutTemplate className="size-8 shrink-0 text-neutral-500" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">Slideouts</p>
                <p className="font-semibold text-neutral-900">{formatSlideouts(unit.slideOutsCount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-200/90 px-4 py-3">
              <Ruler className="size-8 shrink-0 text-neutral-500" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">Length</p>
                <p className="font-semibold text-neutral-900">{unit.wI_Length} ft.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-200/90 px-4 py-3">
              <Cog className="size-8 shrink-0 text-neutral-500" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">Engine</p>
                <p className="font-semibold text-neutral-900">{unit.wI_Engine?.trim() ? unit.wI_Engine : '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-slate-200/90 px-4 py-3">
              <Car className="size-8 shrink-0 text-neutral-500" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">Drive Train</p>
                <p className="font-semibold text-neutral-900">{driveTrainLabel ?? '—'}</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-visible rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] sm:p-5">
            {unit.isTooLowToShow ? (
              <>
                <span className="inline-flex rounded-md bg-teal-100 px-2.5 py-1 text-xs font-bold tracking-wide text-teal-800 uppercase">
                  Price unavailable online
                </span>
                <div className="mt-3">
                  <h2 className="text-2xl leading-tight font-bold text-neutral-900">Price too low to show</h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Connect with a van specialist to unlock the lowest available price.
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-3 text-lg font-bold text-white transition hover:bg-teal-800/80"
                  onClick={openConnectFallback}
                >
                  Unlock Today's Price
                  <Video className="size-4 shrink-0 text-white sm:size-5" strokeWidth={2} />
                </button>
              </>
            ) : (
              <>
                <span className="bg-primary/10 text-primary inline-flex rounded-md px-2.5 py-1 text-xs font-bold tracking-wide uppercase">
                  Best price available live
                </span>
                <div className="mt-3">
                  <h2 className="text-2xl leading-tight font-bold text-neutral-900">Best price available live</h2>
                  <p className="mt-1 text-sm text-neutral-500">Get the lowest price instantly from a van specialist.</p>
                </div>

                <button
                  type="button"
                  className="bg-primary hover:bg-primary/80 mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-xl font-bold text-white transition"
                  onClick={openConnectFallback}
                >
                  Get Best Price Live
                  <Video className="size-4 shrink-0 text-white sm:size-5" strokeWidth={2} />
                </button>
              </>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-lg text-neutral-700">
              <span className="inline-flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-5" />
                See it live
              </span>
              <span className="inline-flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-5" />
                Real quotes
              </span>
              <span className="inline-flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-5" />
                No pressure
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-white/10 bg-neutral-900 px-3 py-3 shadow-[0_-6px_16px_rgba(0,0,0,0.35)]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
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
                    width={36}
                    height={36}
                    className={`size-9 rounded-full border-2 border-white object-cover ${i > 0 ? '-ml-4' : ''}`}
                  />
                ))}
              </div>
            </div>
            <div className="min-w-0 text-white">
              <p className="truncate text-sm font-bold">2 specialists are online</p>
              <p className="truncate text-xs text-white/80">Ready to help you now</p>
            </div>
          </div>

          <button
            type="button"
            className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition sm:text-lg ${
              unit.isTooLowToShow ? 'bg-teal-800 hover:bg-teal-800/80' : 'bg-primary hover:bg-primary/80'
            }`}
            onClick={openConnectFallback}
          >
            {unit.isTooLowToShow ? `Unlock Today's Price` : 'Get Best Price Live'}
            <Video className="size-4 shrink-0 text-white sm:size-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
