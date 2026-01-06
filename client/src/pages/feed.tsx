import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { AppLayout } from "@/components/app-layout";
import { 
  Star, 
  TrendingUp, 
  UserCheck, 
  MessageSquare, 
  Flag,
  Flame
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type FilterType = "all" | "reviews" | "new_profiles" | "trending" | "following";

type FeedItem = {
  id: string;
  type: "review" | "profile_claimed" | "user_verified" | "trending";
  createdAt: string;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    location?: string;
  };
  review?: {
    id: string;
    rating: number;
    text: string;
    reviewer?: {
      firstName: string;
      lastName: string;
      phoneVerified: boolean;
    };
  };
  user?: {
    firstName: string;
    lastName: string;
  };
  trendingScore?: number;
};

const filters: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "reviews", label: "Reviews" },
  { key: "new_profiles", label: "New Profiles" },
  { key: "trending", label: "Trending" },
  { key: "following", label: "Following" },
];

export default function Feed() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const queryClient = useQueryClient();

  const { data: feedItems = [], isLoading } = useQuery<FeedItem[]>({
    queryKey: ["feed", activeFilter],
    queryFn: async () => {
      const res = await fetch(`/api/feed?filter=${activeFilter}`);
      if (!res.ok) throw new Error("Failed to load feed");
      return res.json();
    },
  });

  const reportMutation = useMutation({
    mutationFn: async ({ reviewId, reason }: { reviewId: string; reason: string }) => {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, reason }),
      });
      if (!res.ok) throw new Error("Failed to report");
      return res.json();
    },
    onSuccess: () => {
      setReportingId(null);
      setReportReason("");
    },
  });

  const handleReport = (reviewId: string) => {
    if (reportReason.trim()) {
      reportMutation.mutate({ reviewId, reason: reportReason });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "fill-yellow-500 text-yellow-500" : "text-white/20"}`}
          />
        ))}
      </div>
    );
  };

  const getTypeIcon = (type: FeedItem["type"]) => {
    switch (type) {
      case "review":
        return <MessageSquare className="w-5 h-5 text-primary" />;
      case "profile_claimed":
        return <UserCheck className="w-5 h-5 text-green-400" />;
      case "trending":
        return <Flame className="w-5 h-5 text-orange-400" />;
      default:
        return <TrendingUp className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTypeLabel = (type: FeedItem["type"]) => {
    switch (type) {
      case "review":
        return "New Review";
      case "profile_claimed":
        return "Profile Claimed";
      case "trending":
        return "Trending";
      default:
        return "Activity";
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold font-display mb-6">Activity Feed</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === filter.key
                  ? "bg-primary text-white"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
              data-testid={`filter-${filter.key}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : feedItems.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-white/60">No activity yet.</p>
            {activeFilter === "following" && (
              <p className="text-sm text-white/40 mt-2">
                Follow some profiles to see their activity here.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {feedItems.map((item) => (
              <div
                key={item.id}
                className="glass rounded-2xl p-5 hover:bg-white/5 transition-colors"
                data-testid={`feed-item-${item.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-white/50 uppercase tracking-wide">
                        {getTypeLabel(item.type)}
                      </span>
                      {item.trendingScore && (
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                          Score: {item.trendingScore}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/people/${item.profile.id}`}
                      className="font-semibold text-lg hover:text-primary transition-colors"
                      data-testid={`link-profile-${item.profile.id}`}
                    >
                      {item.profile.firstName} {item.profile.lastName}
                    </Link>

                    {item.profile.location && (
                      <p className="text-sm text-white/50">{item.profile.location}</p>
                    )}

                    {item.type === "review" && item.review && (
                      <div className="mt-3 p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(item.review.rating)}
                          {item.review.reviewer && (
                            <span className="text-sm text-white/60">
                              by {item.review.reviewer.firstName} {item.review.reviewer.lastName}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/80">{item.review.text}</p>

                        {reportingId === item.review.id ? (
                          <div className="mt-3 space-y-2">
                            <input
                              type="text"
                              value={reportReason}
                              onChange={(e) => setReportReason(e.target.value)}
                              placeholder="Reason for report..."
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                              data-testid="input-report-reason"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReport(item.review!.id)}
                                disabled={reportMutation.isPending}
                                className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/30"
                                data-testid="button-submit-report"
                              >
                                Submit Report
                              </button>
                              <button
                                onClick={() => {
                                  setReportingId(null);
                                  setReportReason("");
                                }}
                                className="text-xs text-white/50 hover:text-white"
                                data-testid="button-cancel-report"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReportingId(item.review!.id)}
                            className="mt-2 text-xs text-white/40 hover:text-red-400 flex items-center gap-1"
                            data-testid={`button-report-${item.review.id}`}
                          >
                            <Flag className="w-3 h-3" />
                            Report
                          </button>
                        )}
                      </div>
                    )}

                    {item.type === "profile_claimed" && item.user && (
                      <p className="mt-2 text-sm text-white/60">
                        {item.user.firstName} {item.user.lastName} claimed their profile
                      </p>
                    )}

                    <p className="text-xs text-white/40 mt-2">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
