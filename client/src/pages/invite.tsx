import { useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { UserPlus, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: nomination, isLoading, error } = useQuery({
    queryKey: ["nomination", token],
    queryFn: async () => {
      const res = await fetch(`/api/nominations/token/${token}`);
      if (!res.ok) throw new Error("Invalid invite");
      return res.json();
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/nominations/accept/${token}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to accept");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.profileId) {
        navigate(`/people/${data.profileId}`);
      } else {
        navigate("/app");
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !nomination) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full glass rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-display mb-2">Invalid Invite</h1>
          <p className="text-white/60 mb-6">
            This invite link is invalid or has already been used.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  if (nomination.accepted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full glass rounded-2xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-display mb-2">Already Claimed</h1>
          <p className="text-white/60 mb-6">
            This profile has already been claimed.
          </p>
          {nomination.profileId && (
            <Link
              href={`/people/${nomination.profileId}`}
              className="inline-block bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              View profile
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <ShieldCheck className="w-9 h-9 text-blue-400 fill-blue-400/20" />
            <span className="font-display font-bold text-2xl">RatedIRL</span>
          </Link>
        </div>

        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold font-display mb-2">You've been nominated!</h1>
          <p className="text-white/60 mb-6">
            Someone created a profile for <strong>{nomination.targetFirstName} {nomination.targetLastName}</strong> on RatedIRL. 
            Claim it to see reviews and manage your reputation.
          </p>

          {user ? (
            <button
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {acceptMutation.isPending ? "Claiming..." : "Claim this profile"}
            </button>
          ) : (
            <div className="space-y-3">
              <Link
                href={`/signup?invite=${token}`}
                className="block w-full bg-primary hover:bg-primary/90 py-4 rounded-xl font-semibold transition-colors text-center"
              >
                Sign up to claim
              </Link>
              <p className="text-sm text-white/50">
                Already have an account?{" "}
                <Link href={`/login?invite=${token}`} className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {acceptMutation.isError && (
            <p className="text-red-400 text-sm mt-4">
              {acceptMutation.error?.message || "Failed to claim profile"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
