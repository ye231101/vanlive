'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { LiveChatTab } from '@/components/live-chat-tab';
import { InventoryCard } from '@/components/inventory-card';
import { TradePromoCard } from '@/components/trade-promo-card';
import { api } from '@/lib/api';
import { mapInventoryItem, type InventoryListResponse, type InventoryPagination } from '@/lib/inventory';
import { makes, models, inventoryTypes, locations } from '@/lib/utils';
import type { InventoryUnit } from '@/types';

const INVENTORY_BODY_FILTER = 'class-b';

const FILTER_MAKES = [
  { label: 'All Makes', value: 'all' },
  ...makes.map((m) => ({ label: m.label, value: m.value })),
] as const;

const FILTER_MODELS = [
  { label: 'All Models', value: 'all' },
  ...models.map((m) => ({ label: m.label, value: m.value })),
] as const;

const FILTER_INVENTORY_TYPES = [
  { label: 'All Vans', value: 'all' },
  ...inventoryTypes.map((i) => ({ label: i.label, value: i.value })),
] as const;

const FILTER_LOCATIONS = [
  { label: 'All Locations', value: 'all' },
  ...locations.map((l) => ({ label: l.label, value: l.value })),
] as const;

function visiblePageItems(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | 'ellipsis')[] = [];
  const push = (v: number | 'ellipsis') => {
    if (items[items.length - 1] === v) return;
    items.push(v);
  };
  push(1);
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) push('ellipsis');
  for (let p = start; p <= end; p++) push(p);
  if (end < total - 1) push('ellipsis');
  if (total > 1) push(total);
  return items;
}

function pageGridItems(units: InventoryUnit[], page: number): ReactNode[] {
  if (units.length === 0) return [];
  if (units.length < 4) {
    return units.map((unit) => <InventoryCard key={unit.id} unit={unit} />);
  }
  const promo = <TradePromoCard key={`trade-promo-${page}`} />;
  if (units.length === 4) {
    return [...units.map((unit) => <InventoryCard key={unit.id} unit={unit} />), promo];
  }
  return [
    ...units.slice(0, 4).map((unit) => <InventoryCard key={unit.id} unit={unit} />),
    promo,
    ...units.slice(4).map((unit) => <InventoryCard key={unit.id} unit={unit} />),
  ];
}

function parsePageParam(value: string | null): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

function parseSizeParam(value: string | null): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed < 1 || parsed > 100) return 20;
  return parsed;
}

function isValidFilterValue(value: string | null, options: readonly { value: string }[]): value is string {
  if (!value) return false;
  return options.some((option) => option.value === value);
}

async function fetchInventories(params: {
  currentPage: number;
  perPage: number;
  q: string | null;
  filterMake: string;
  filterModel: string;
  filterInventoryType: string;
  filterLocation: string;
}): Promise<{ inventories: InventoryUnit[]; pagination: InventoryPagination }> {
  const query: Record<string, string | number> = {
    currentPage: params.currentPage,
    perPage: params.perPage,
    body: INVENTORY_BODY_FILTER,
  };
  if (params.q != null && params.q !== '') {
    query.q = params.q;
  }
  if (params.filterMake !== 'all' && params.filterMake !== '') {
    query.make = params.filterMake;
  }
  if (params.filterModel !== 'all' && params.filterModel !== '') {
    query.model = params.filterModel;
  }
  if (params.filterInventoryType !== 'all' && params.filterInventoryType !== '') {
    query.inventoryType = params.filterInventoryType;
  }
  if (params.filterLocation !== 'all' && params.filterLocation !== '') {
    query.location = params.filterLocation;
  }

  const res = (await api.get('inventory', {
    params: query,
  })) as InventoryListResponse;

  const { inventories, pagination } = res.data;
  return {
    inventories: inventories.map(mapInventoryItem),
    pagination,
  };
}

export default function InventoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(() => parsePageParam(searchParams.get('page')));
  const [perPage, setPerPage] = useState(() => parseSizeParam(searchParams.get('size')));
  const [pageUnits, setPageUnits] = useState<InventoryUnit[]>([]);
  const [pagination, setPagination] = useState<InventoryPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState(() => searchParams.get('q'));
  const [filterMake, setFilterMake] = useState(() => {
    const value = searchParams.get('make');
    return isValidFilterValue(value, FILTER_MAKES) ? value : 'all';
  });
  const [filterModel, setFilterModel] = useState(() => {
    const value = searchParams.get('model');
    return isValidFilterValue(value, FILTER_MODELS) ? value : 'all';
  });
  const [filterInventoryType, setFilterInventoryType] = useState(() => {
    const value = searchParams.get('inventoryType');
    return isValidFilterValue(value, FILTER_INVENTORY_TYPES) ? value : 'all';
  });
  const [filterLocation, setFilterLocation] = useState(() => {
    const value = searchParams.get('location');
    return isValidFilterValue(value, FILTER_LOCATIONS) ? value : 'all';
  });
  const skipScrollRef = useRef(true);

  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  useEffect(() => {
    const pageParam = parsePageParam(searchParams.get('page'));
    const sizeParam = parseSizeParam(searchParams.get('size'));
    const qParam = searchParams.get('q');
    const makeParam = searchParams.get('make');
    const modelParam = searchParams.get('model');
    const inventoryTypeParam = searchParams.get('inventoryType');
    const locationParam = searchParams.get('location');

    setCurrentPage((prev) => (prev === pageParam ? prev : pageParam));
    setPerPage((prev) => (prev === sizeParam ? prev : sizeParam));
    setQ((prev) => (prev === qParam ? prev : qParam));
    setFilterMake((prev) => {
      const next = isValidFilterValue(makeParam, FILTER_MAKES) ? makeParam : 'all';
      return prev === next ? prev : next;
    });
    setFilterModel((prev) => {
      const next = isValidFilterValue(modelParam, FILTER_MODELS) ? modelParam : 'all';
      return prev === next ? prev : next;
    });
    setFilterInventoryType((prev) => {
      const next = isValidFilterValue(inventoryTypeParam, FILTER_INVENTORY_TYPES) ? inventoryTypeParam : 'all';
      return prev === next ? prev : next;
    });
    setFilterLocation((prev) => {
      const next = isValidFilterValue(locationParam, FILTER_LOCATIONS) ? locationParam : 'all';
      return prev === next ? prev : next;
    });
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    fetchInventories({
      currentPage,
      perPage,
      q,
      filterMake,
      filterModel,
      filterInventoryType,
      filterLocation,
    })
      .then((res) => {
        if (ignore) return;
        setPageUnits(res.inventories);
        setPagination(res.pagination);
      })
      .catch((err: Error) => {
        if (ignore) return;
        setError(err.message || 'Failed to load inventories');
        setPageUnits([]);
        setPagination(null);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [currentPage, perPage, q, filterMake, filterModel, filterInventoryType, filterLocation]);

  useEffect(() => {
    if (!pagination) return;
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, pagination]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentPage != null && currentPage !== 1) params.set('page', String(currentPage));
    else params.delete('page');
    if (perPage != null && perPage !== 20) params.set('size', String(perPage));
    else params.delete('size');
    if (q != null && q !== '') params.set('q', q);
    else params.delete('q');
    if (filterMake != null && filterMake !== 'all') params.set('make', filterMake);
    else params.delete('make');
    if (filterModel != null && filterModel !== 'all') params.set('model', filterModel);
    else params.delete('model');
    if (filterInventoryType != null && filterInventoryType !== 'all') params.set('inventoryType', filterInventoryType);
    else params.delete('inventoryType');
    if (filterLocation != null && filterLocation !== 'all') params.set('location', filterLocation);
    else params.delete('location');

    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentQuery = searchParams.toString();
    const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;
    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [currentPage, perPage, q, filterMake, filterModel, filterInventoryType, filterLocation]);

  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    document.getElementById('inventory')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [currentPage]);

  const gridItems = useMemo(() => pageGridItems(pageUnits, currentPage), [pageUnits, currentPage]);

  const pageItems = useMemo(() => visiblePageItems(currentPage, totalPages), [currentPage, totalPages]);

  const go = (p: number) => {
    setCurrentPage(Math.min(Math.max(1, p), totalPages));
  };

  const clearFilters = () => {
    setQ(null);
    setFilterMake('all');
    setFilterModel('all');
    setFilterInventoryType('all');
    setFilterLocation('all');
    setCurrentPage(1);
  };

  return (
    <section id="inventory" className="py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="border-border bg-card mb-8 rounded-lg border p-4 md:p-6">
          <div className="flex flex-col items-start justify-start gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Inventory</p>
              <h2 className="text-foreground mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">
                Find Your Van and See It Live
              </h2>
            </div>
          </div>

          <div className="border-border bg-background mt-6 flex flex-col overflow-hidden rounded-lg border md:mt-8 md:flex-row md:items-stretch">
            <div className="border-border flex min-w-0 flex-1 flex-col border-b px-4 py-3 md:border-r md:border-b-0">
              <span className="text-muted-foreground text-xs font-medium">Make</span>
              <Select
                value={filterMake}
                onValueChange={(v) => {
                  setFilterMake(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger
                  className="w-full justify-between rounded-none border-0 px-0 py-1.5 text-base font-medium shadow-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 data-[size=default]:h-auto"
                  size="sm"
                >
                  <SelectValue placeholder="All Makes" />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_MAKES.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border-border flex min-w-0 flex-1 flex-col border-b px-4 py-3 md:border-r md:border-b-0">
              <span className="text-muted-foreground text-xs font-medium">Model</span>
              <Select
                value={filterModel}
                onValueChange={(v) => {
                  setFilterModel(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger
                  className="w-full justify-between rounded-none border-0 px-0 py-1.5 text-base font-medium shadow-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 data-[size=default]:h-auto"
                  size="sm"
                >
                  <SelectValue placeholder="All Models" />
                </SelectTrigger>
                <SelectContent className="max-h-[min(24rem,var(--radix-select-content-available-height))]">
                  {FILTER_MODELS.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border-border flex min-w-0 flex-1 flex-col border-b px-4 py-3 md:border-r md:border-b-0">
              <span className="text-muted-foreground text-xs font-medium">New/Used</span>
              <Select
                value={filterInventoryType}
                onValueChange={(v) => {
                  setFilterInventoryType(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger
                  className="w-full justify-between rounded-none border-0 px-0 py-1.5 text-base font-medium shadow-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 data-[size=default]:h-auto"
                  size="sm"
                >
                  <SelectValue placeholder="All Vans" />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_INVENTORY_TYPES.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border-border flex min-w-0 flex-1 flex-col border-b px-4 py-3 md:border-r md:border-b-0">
              <span className="text-muted-foreground text-xs font-medium">Location</span>
              <Select
                value={filterLocation}
                onValueChange={(v) => {
                  setFilterLocation(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger
                  className="w-full justify-between rounded-none border-0 px-0 py-1.5 text-base font-medium shadow-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 data-[size=default]:h-auto"
                  size="sm"
                >
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  {FILTER_LOCATIONS.map(({ label, value }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex shrink-0 items-stretch p-3 md:min-w-[200px]">
              <Button
                type="reset"
                size="lg"
                className="h-auto min-h-11 w-full rounded-md px-6 text-base font-bold"
                onClick={clearFilters}
              >
                <span className="hidden lg:block">Clear Filters</span>
                <span className="block lg:hidden">Clear</span>
              </Button>
            </div>
          </div>
        </div>

        {error ? <p className="text-destructive text-center text-sm">{error}</p> : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="text-muted-foreground size-8" />
          </div>
        ) : (
          <div id="inventory-results" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gridItems}
          </div>
        )}

        {!loading && !error && pageUnits.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm">No units match this page.</p>
        ) : null}

        {!loading && totalPages > 1 ? (
          <Pagination className="mt-10">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    go(currentPage - 1);
                  }}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-40' : undefined}
                  aria-disabled={currentPage <= 1}
                />
              </PaginationItem>
              {pageItems.map((item, i) =>
                item === 'ellipsis' ? (
                  <PaginationItem key={`e-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      size="icon"
                      isActive={item === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        go(item);
                      }}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    go(currentPage + 1);
                  }}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-40' : undefined}
                  aria-disabled={currentPage >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </div>

      <LiveChatTab />
    </section>
  );
}
