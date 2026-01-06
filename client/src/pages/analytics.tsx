import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Eye, Star, MessageSquare, TrendingUp } from "lucide-react";

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      return res.json();
    },
  });

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const res = await fetch("/api/profiles/my/profile");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: profileData } = useQuery({
    queryKey: ["profile", myProfile?.id],
    queryFn: async () => {
      if (!myProfile?.id) return null;
      const res = await fetch(`/api/profiles/${myProfile.id}`);
      return res.json();
    },
    enabled: !!myProfile?.id,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Analytics</h1>
          <p className="text-white/60">Track your reputation metrics and engagement.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-4xl font-bold mb-1">{analytics?.profileViews || 0}</p>
            <p className="text-sm text-white/50">Profile Views</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <p className="text-4xl font-bold mb-1">{analytics?.reviewsReceived || 0}</p>
            <p className="text-sm text-white/50">Reviews Received</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-4xl font-bold mb-1">{analytics?.reviewsGiven || 0}</p>
            <p className="text-sm text-white/50">Reviews Given</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-4xl font-bold mb-1">
              {profileData?.stats?.average?.toFixed(1) || "–"}
            </p>
            <p className="text-sm text-white/50">Average Rating</p>
          </div>
        </div>

        {/* Rating Distribution */}
        {profileData?.stats && profileData.stats.count > 0 && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold font-display mb-6">Rating Distribution</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = profileData.stats.breakdown[rating] || 0;
                  const percentage = profileData.stats.count > 0 
                    ? (count / profileData.stats.count) * 100 
                    : 0;
                  return (
                    <div key={rating} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-16">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{rating}</span>
                      </div>
                      <div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-16 text-right">
                        <span className="font-bold">{count}</span>
                        <span className="text-white/40 text-sm ml-1">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="text-6xl font-bold mb-2">
                  {profileData.stats.average.toFixed(1)}
                </div>
                <div className="flex text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.round(profileData.stats.average) ? "fill-current" : "opacity-30"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-white/50">
                  Based on {profileData.stats.count} {profileData.stats.count === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!profileData?.stats || profileData.stats.count === 0) && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">No data yet</h3>
            <p className="text-white/60">
              Share your profile to start receiving reviews and building your analytics.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
