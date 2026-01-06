import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Link } from "wouter";
import { Search as SearchIcon, MapPin, Star, ShieldCheck, Users } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles", "search", searchTerm, searchLocation],
    queryFn: async () => {
      if (!searchTerm) return [];
      const params = new URLSearchParams({ q: searchTerm });
      if (searchLocation) params.append("location", searchLocation);
      const res = await fetch(`/api/profiles/search?${params}`);
      return res.json();
    },
    enabled: searchTerm.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
    setSearchLocation(location);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Find People</h1>
          <p className="text-white/60">Search for profiles by name or location</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="glass rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                data-testid="input-search"
              />
            </div>
            <div className="relative md:w-64">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (optional)"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                data-testid="input-location"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 px-8 py-3 rounded-xl font-semibold transition-colors"
              data-testid="button-search"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {profiles && profiles.length > 0 && (
          <div className="grid gap-4">
            {profiles.map((profile: any) => (
              <Link
                key={profile.id}
                href={`/people/${profile.id}`}
                className="glass rounded-2xl p-6 hover:bg-white/10 transition-colors block"
                data-testid={`card-profile-${profile.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-xl font-bold shrink-0">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold truncate">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      {profile.claimed && (
                        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                    </div>
                    {profile.location && (
                      <p className="text-sm text-white/60 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {profile.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {searchTerm && profiles && profiles.length === 0 && !isLoading && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">No profiles found</h3>
            <p className="text-white/60 mb-6">
              Can't find who you're looking for? Nominate them to create their profile.
            </p>
            <Link
              href="/nominate"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Nominate someone
            </Link>
          </div>
        )}

        {!searchTerm && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">Start searching</h3>
            <p className="text-white/60">
              Enter a name above to find people and view their ratings.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
