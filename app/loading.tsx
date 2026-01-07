export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        {/* Inner Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-black italic text-lg tracking-tighter">F</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
        Loading Experience...
      </p>
    </div>
  );
}
