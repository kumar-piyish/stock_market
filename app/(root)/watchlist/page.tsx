import { getWatchlist } from "@/lib/actions/watchlist.actions";
import WatchlistButton from "@/components/WatchlistButton";
import Link from "next/link";

const WatchlistPage = async () => {
  const watchlist = await getWatchlist();

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 lg:px-12">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          My Watchlist
        </h1>
        <span className="text-sm text-gray-400">
          {watchlist.length} stocks
        </span>
      </div>

      {/* Empty State */}
      {watchlist.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <p className="text-lg text-gray-400">
            Your watchlist is empty
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-yellow-400 px-5 py-2 font-medium text-black hover:bg-yellow-300"
          >
            Explore Stocks
          </Link>
        </div>
      )}

      {/* Watchlist Grid */}
      {watchlist.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((item: any) => (
            <div
              key={item._id}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 hover:border-yellow-400 transition"
            >
              {/* Stock Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {item.symbol}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {item.company}
                  </p>
                </div>

                <WatchlistButton
                  type="icon"
                  symbol={item.symbol}
                  company={item.company}
                  isInWatchlist={true}
                />
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between">
                <Link
                  href={`/stocks/${item.symbol.toLowerCase()}`}
                  className="text-sm font-medium text-yellow-400 hover:underline"
                >
                  View Details →
                </Link>

                <span className="text-xs text-gray-500">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
