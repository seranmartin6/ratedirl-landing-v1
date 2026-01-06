import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/app-layout";
import { 
  Star, 
  ShieldCheck, 
  MapPin, 
  Flag, 
  Pencil, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reportingReview, setReportingReview] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const res = await fetch(`/api/profiles/${id}`);
      if (!res.ok) throw new Error("Profile not found");
      return res.json();
    },
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/profiles/${id}/claim`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to claim profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", id] });
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
      setReportingReview(null);
      setReportReason("");
    },
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

  if (error || !data) {
    return (
      <AppLayout>
        <div className="glass rounded-2xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Profile not found</h2>
          <p className="text-white/60">This profile doesn't exist or has been removed.</p>
        </div>
      </AppLayout>
    );
  }

  const { profile, stats, reviews } = data;
  const isOwner = profile.ownerUserId === user?.id;
  const canClaim = !profile.claimed && user;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="glass rounded-2xl p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-3xl font-bold shrink-0">
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold font-display">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.claimed && (
                  <span className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-xs font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              {profile.location && (
                <p className="text-white/60 flex items-center gap-1 mb-4">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(stats.average) ? "fill-current" : "opacity-30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold">{stats.average.toFixed(1)}</span>
                </div>
                <span className="text-white/60">
                  Based on {stats.count} {stats.count === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {isOwner && (
                <Link
                  href="/settings"
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </Link>
              )}
              {canClaim && (
                <button
                  onClick={() => claimMutation.mutate()}
                  disabled={claimMutation.isPending}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  data-testid="button-claim"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Claim this profile
                </button>
              )}
              {!isOwner && profile.claimed && (
                <Link
                  href={`/write-review/${id}`}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  data-testid="button-write-review"
                >
                  <Star className="w-4 h-4" />
                  Write a review
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Rating Breakdown */}
        {stats.count > 0 && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold font-display mb-4">Rating Breakdown</h2>
            <div className="space-y-2 max-w-md">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.breakdown[rating] || 0;
                const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm">{rating}</span>
                    </div>
                    <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm text-white/60">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold font-display mb-4">
            Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No reviews yet.</p>
              {!isOwner && profile.claimed && (
                <Link
                  href={`/write-review/${id}`}
                  className="inline-block mt-4 bg-primary hover:bg-primary/90 px-6 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Be the first to review
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white text-sm font-medium">
                        {review.reviewer?.firstName?.[0]}{review.reviewer?.lastName?.[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {review.reviewer?.firstName} {review.reviewer?.lastName?.[0]}.
                          </span>
                          {review.reviewer?.phoneVerified && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-white/20"
                                }`}
                              />
                            ))}
                          </div>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {user && review.reviewerUserId !== user.id && (
                      <button
                        onClick={() => setReportingReview(review.id)}
                        className="text-white/40 hover:text-red-400 transition-colors"
                        title="Report review"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-white/90 leading-relaxed">"{review.text}"</p>

                  {reportingReview === review.id && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm font-medium text-red-400 mb-2">Report this review</p>
                      <textarea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="Why are you reporting this review?"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none mb-2"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => reportMutation.mutate({ reviewId: review.id, reason: reportReason })}
                          disabled={!reportReason || reportMutation.isPending}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          Submit Report
                        </button>
                        <button
                          onClick={() => {
                            setReportingReview(null);
                            setReportReason("");
                          }}
                          className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Reviews Notice */}
        {!profile.claimed && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-400 mb-1">Profile not yet claimed</h3>
                <p className="text-white/70 text-sm">
                  Reviews for this profile are pending until the owner claims their profile. 
                  Reviews will become visible once the profile is claimed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
