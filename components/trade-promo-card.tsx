import { Handshake } from 'lucide-react';

export function TradePromoCard() {
  const handleClick = () => (window as any).ViewProWidget?.open();

  return (
    <article className="flex h-full min-h-80 flex-col items-center justify-center rounded-2xl border border-neutral-200/80 bg-white px-10 py-12 text-center shadow-md">
      <div className="flex max-w-70 flex-col items-center gap-5">
        <Handshake className="size-16 shrink-0 text-teal-800" strokeWidth={1.35} aria-hidden />
        <h3 className="text-lg leading-snug font-bold tracking-tight text-teal-800">Trade with Van Live</h3>
        <p className="text-sm leading-relaxed text-neutral-500">
          Get a competitive offer and upgrade effortlessly. Quick, easy, and transparent!
        </p>
        <button
          type="button"
          className="mt-1 w-full cursor-pointer rounded-md border border-teal-800 bg-transparent px-5 py-2.5 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-800/10"
          onClick={handleClick}
        >
          Trade My Van
        </button>
      </div>
    </article>
  );
}
