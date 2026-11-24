export function PilotApronOverlay() {
  return (
    <p role="status" className="pointer-events-none absolute bottom-5 left-1/2 z-20 w-max max-w-[calc(100%-24px)] -translate-x-1/2 rounded-xl border border-sky-200 bg-white/95 px-3 py-2 text-center text-sm font-bold text-sky-950 shadow-sm">
      Kaptanla birlikte uçağa biniyorsun…
    </p>
  );
}
