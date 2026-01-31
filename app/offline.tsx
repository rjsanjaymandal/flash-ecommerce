import { WifiOff } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Offline | Flash Fashion",
};

export default function Offline() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
        <WifiOff className="h-10 w-10 text-white/60" />
      </div>

      <h1 className="mt-8 text-3xl font-black uppercase tracking-tight text-white lg:text-5xl">
        System Offline
      </h1>

      <p className="mt-4 max-w-md text-base text-zinc-400">
        Connection severed. We cannot reach the Flash mainframe. Check your
        neural link (WiFi) and try again.
      </p>

      <div className="mt-8 flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="rounded-full bg-white px-8 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}
