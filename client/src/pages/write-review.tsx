import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { Star, AlertCircle, CheckCircle } from "lucide-react";

export default function WriteReview() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const res = await fetch(`/api/profiles/${id}`);
      if (!res.ok) throw new Error("Profile not found");
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetProfileId: id,
          rating,
          text,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: (data) => {
      setSubmitted(true);
      setTimeout(() => {
        navigate(`/people/${id}`);
      }, 2000);
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

  const profile = profileData?.profile;

  if (submitted) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto">
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold font-display mb-2">Review submitted!</h2>
            <p className="text-white/60">
              {profile?.claimed 
                ? "Your review is now live." 
                : "Your review will be visible once the profile is claimed."}
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Write a review</h1>
          <p className="text-white/60">
            Share your experience with {profile?.firstName} {profile?.lastName}
          </p>
        </div>

        {!profile?.claimed && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm text-white/70">
                This profile hasn't been claimed yet. Your review will be saved but won't be visible until the profile owner claims it.
              </p>
            </div>
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            submitMutation.mutate();
          }}
          className="glass rounded-2xl p-8 space-y-6"
        >
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">Your rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                  data-testid={`star-${star}`}
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-white/20"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Your review <span className="text-white/40">(max 150 characters)</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 150))}
              placeholder="Share your experience in a few words..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              rows={4}
              required
              data-testid="input-review"
            />
            <p className="text-right text-sm text-white/40 mt-1">
              {text.length}/150
            </p>
          </div>

          {submitMutation.isError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              {submitMutation.error?.message || "Failed to submit review"}
            </div>
          )}

          <button
            type="submit"
            disabled={rating === 0 || !text || submitMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-semibold transition-all disabled:opacity-50"
            data-testid="button-submit-review"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit review"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
