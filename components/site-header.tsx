'use client';

import { type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Phone, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const PHONE_DISPLAY = '(786) 570-8584';
const PHONE_TEL = 'tel:1-786-570-8584';

function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';

  const handleInput = (e: FormEvent<HTMLInputElement>) => {
    if (e.currentTarget.value !== '' || !searchParams.has('q')) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
  };

  return (
    <div className={cn('relative w-full min-w-0', className)}>
      <form role="search" action="/inventory" method="get" className="relative w-full">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          name="q"
          type="search"
          defaultValue={searchQuery}
          placeholder="Make, Model or Keyword"
          className="relative h-10 rounded-full border-gray-200 bg-gray-100 pr-4 pl-10 shadow-none"
          autoComplete="off"
          onInput={handleInput}
        />
      </form>
    </div>
  );
}

function PhoneBlock({ compact }: { compact?: boolean }) {
  return (
    <a
      href={PHONE_TEL}
      className="text-foreground hover:text-foreground/80 shrink-0 transition-colors"
      aria-label={`Call ${PHONE_DISPLAY}`}
    >
      {compact ? (
        <span className="flex items-center justify-center rounded-full">
          <Phone className="size-5" aria-hidden />
        </span>
      ) : (
        <span className="flex items-center gap-1 text-sm font-medium">
          <Phone className="size-5 shrink-0" aria-hidden />
          {PHONE_DISPLAY}
        </span>
      )}
    </a>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white md:h-20">
      <div className="mx-auto flex h-full w-full justify-center px-4 py-3 md:px-6 md:py-4 lg:px-10">
        {/* Mobile */}
        <div className="flex flex-1 flex-col gap-3 md:hidden">
          <div className="relative flex min-h-10 items-center">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Link href="/" className="pointer-events-auto min-w-0 shrink" aria-label="Van Live">
                <Image src="/logo.svg" alt="Van Live" width={200} height={40} className="h-8 w-auto" priority />
              </Link>
            </div>

            <div className="ml-auto shrink-0">
              <PhoneBlock compact />
            </div>
          </div>

          <HeaderSearch />
        </div>

        {/* Desktop */}
        <div className="hidden w-full min-w-0 items-center gap-4 md:flex md:gap-6 lg:gap-10">
          <Link href="/" className="min-w-0 shrink-0" aria-label="Van Live">
            <Image src="/logo.svg" alt="Van Live" width={200} height={40} className="h-10 w-auto" />
          </Link>

          <div className="flex flex-1 items-center justify-end gap-2 md:gap-4 lg:gap-6">
            <HeaderSearch className="max-w-md" />
            <PhoneBlock />
          </div>
        </div>
      </div>
    </header>
  );
}
