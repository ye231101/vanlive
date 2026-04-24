'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronsRight } from 'lucide-react';

const brands = [
  {
    label: 'Airstream',
    image: '/images/logos/airstream.png',
  },
  {
    label: 'Thor Motor Coach',
    image: '/images/logos/thor.png',
  },
  {
    label: 'Jayco',
    image: '/images/logos/jayco.png',
  },
  {
    label: 'Tiffin',
    image: '/images/logos/tiffin.png',
  },
  {
    label: 'Renegade',
    image: '/images/logos/renegade.png',
  },
  {
    label: 'Winnebago',
    image: '/images/logos/winnebago.png',
  },
];

export default function ShowPage() {
  const [showWidget, setShowWidget] = useState(false);

  useEffect(() => {
    const checkWidget = () => !!(window as any).ViewProWidget?.isAvailable();

    setShowWidget(checkWidget());
    const interval = setInterval(() => {
      setShowWidget(checkWidget());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-56px)] overflow-hidden md:min-h-[calc(100vh-80px)]">
      <div className="absolute inset-0">
        <Image src="/images/hero_bg.png" alt="" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_30%,rgba(0,0,0,0.45)_70%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      <div className="relative z-10 flex h-full min-h-[calc(100vh-56px)] flex-col items-center px-4 pt-10 pb-8 md:min-h-[calc(100vh-80px)] md:px-6 md:pt-14 lg:px-8">
        <h1 className="mb-4 text-center leading-tight">
          <span className="block text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="text-yellow-400 italic drop-shadow-lg">FREE </span>
            <span className="text-white drop-shadow-lg">VAN SHOW</span>
          </span>
          <span className="mt-3 block text-2xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-3xl md:mt-3 md:text-4xl lg:text-5xl">
            Tour Hundreds of Top Brands,
          </span>
          <span className="mt-1 block text-2xl font-extrabold tracking-tight text-yellow-400 drop-shadow-lg sm:text-3xl md:mt-2 md:text-4xl lg:text-5xl">
            LIVE From Your Couch
          </span>
        </h1>

        <div className="-mx-4 flex min-h-0 w-[calc(100%+2rem)] flex-col items-center justify-center md:-mx-6 md:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]">
          <div className="w-full bg-black/50 py-6">
            <div className="grid w-full grid-cols-3 gap-4 px-4 sm:gap-6 lg:grid-cols-6 lg:grid-rows-1">
              {brands.map((brand) => (
                <div key={brand.label} className="flex min-h-0 min-w-0 items-center justify-center">
                  <div className="relative h-9 w-full sm:h-11 lg:h-12">
                    <Image
                      src={brand.image}
                      alt={brand.label}
                      fill
                      className="object-contain object-center brightness-0 invert"
                      sizes="(max-width: 1024px) 33vw, 16vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {showWidget && (
          <>
            <div className="cta-border-glow mb-4">
              <button
                onClick={() => (window as any).ViewProWidget?.open()}
                className="cta-3d flex items-center gap-2 text-xl font-black tracking-wider uppercase italic sm:text-2xl md:gap-3 md:text-3xl"
                role="button"
              >
                ENTER LIVE SHOW
                <ChevronsRight className="h-6 w-6 md:h-8 md:w-8" />
              </button>
            </div>

            <p className="mt-2 text-center text-xs font-medium tracking-wide text-white/50 italic sm:text-sm md:text-base">
              No Signup. No pressure. Just Click & Explorer.
            </p>
          </>
        )}

        <div className="h-8 shrink-0 md:h-12" />
      </div>
    </div>
  );
}
