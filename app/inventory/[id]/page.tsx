'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { LiveChatTab } from '@/components/live-chat-tab';
import { InventoryDetail } from '@/components/inventory-detail';
import { api } from '@/lib/api';
import { mapInventoryItem, type InventoryResponse } from '@/lib/inventory';
import type { InventoryUnit } from '@/types';

async function fetchInventoryById(id: string): Promise<{ inventory: InventoryUnit }> {
  const res = (await api.get(`inventory/${encodeURIComponent(id)}`)) as InventoryResponse;
  const { inventory } = res.data;
  return { inventory: mapInventoryItem(inventory) };
}

export default function InventoryDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [unit, setUnit] = useState<InventoryUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    fetchInventoryById(id)
      .then((res) => {
        if (ignore) return;
        setUnit(res.inventory);
      })
      .catch((err: Error) => {
        if (ignore) return;
        setError(err.message || 'Failed to load inventory');
        setUnit(null);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 sm:min-h-[60vh]">
        <Spinner className="text-muted-foreground size-8" />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center sm:min-h-[60vh]">
        <p className="text-base font-semibold text-neutral-600 sm:text-lg">{error ?? 'Inventory not found'}</p>
        <Link
          href="/"
          className="text-primary mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to inventories
        </Link>
        <LiveChatTab />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl p-4">
        <Link
          href="/"
          className="text-primary inline-flex items-center gap-2 text-sm font-semibold transition hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to inventories
        </Link>
      </div>
      <InventoryDetail unit={unit} />
      <LiveChatTab />
    </>
  );
}
