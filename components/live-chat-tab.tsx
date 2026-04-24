export function LiveChatTab() {
  const handleClick = () => (window as any).ViewProWidget?.open();

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed top-1/2 right-0 z-50 flex h-36 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-l-lg border-y border-l border-white/15 bg-red-800 text-[11px] font-bold tracking-widest whitespace-nowrap text-white uppercase shadow-lg select-none hover:bg-red-800/80 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:outline-none active:bg-red-900"
      aria-label="Open live chat"
    >
      <span className="inline-block -rotate-90">Live chat</span>
    </button>
  );
}
