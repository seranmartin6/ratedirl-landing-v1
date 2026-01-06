import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/app-layout";
import { UserPlus, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function Nominate() {
  const [formData, setFormData] = useState({
    targetFirstName: "",
    targetLastName: "",
    contactEmailOrPhone: "",
  });
  const [submitted, setSubmitted] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const { data: nominations, refetch } = useQuery({
    queryKey: ["my-nominations"],
    queryFn: async () => {
      const res = await fetch("/api/nominations/my");
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/nominations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: (data) => {
      setSubmitted(data);
      refetch();
      setFormData({ targetFirstName: "", targetLastName: "", contactEmailOrPhone: "" });
    },
  });

  const inviteUrl = submitted 
    ? `${window.location.origin}/invite/${submitted.inviteToken}`
    : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Nominate Someone</h1>
          <p className="text-white/60">
            Can't find someone on RatedIRL? Nominate them and send an invite link.
          </p>
        </div>

        {submitted ? (
          <div className="glass rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold font-display mb-2">Nomination created!</h2>
              <p className="text-white/60">
                Share this invite link with {submitted.targetFirstName} so they can claim their profile.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inviteUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-white/80 outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSubmitted(null)}
                className="flex-1 bg-primary hover:bg-primary/90 py-3 rounded-xl font-semibold transition-colors"
              >
                Nominate another
              </button>
              {submitted.profileId && (
                <Link
                  href={`/people/${submitted.profileId}`}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View profile
                </Link>
              )}
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitMutation.mutate();
            }}
            className="glass rounded-2xl p-8 space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">First name</label>
                <input
                  type="text"
                  value={formData.targetFirstName}
                  onChange={(e) => setFormData({ ...formData, targetFirstName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="John"
                  required
                  data-testid="input-firstname"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Last name</label>
                <input
                  type="text"
                  value={formData.targetLastName}
                  onChange={(e) => setFormData({ ...formData, targetLastName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Doe"
                  required
                  data-testid="input-lastname"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Email or phone number
              </label>
              <input
                type="text"
                value={formData.contactEmailOrPhone}
                onChange={(e) => setFormData({ ...formData, contactEmailOrPhone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="john@example.com or +1234567890"
                required
                data-testid="input-contact"
              />
              <p className="text-xs text-white/40 mt-2">
                This won't be shown publicly. It's just to help identify the person.
              </p>
            </div>

            {submitMutation.isError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                {submitMutation.error?.message || "Failed to create nomination"}
              </div>
            )}

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="button-nominate"
            >
              <UserPlus className="w-5 h-5" />
              {submitMutation.isPending ? "Creating..." : "Create nomination"}
            </button>
          </form>
        )}

        {/* Past Nominations */}
        {nominations && nominations.length > 0 && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold font-display mb-4">Your Nominations</h2>
            <div className="space-y-3">
              {nominations.map((nom: any) => (
                <div
                  key={nom.id}
                  className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/5"
                >
                  <div>
                    <p className="font-medium">
                      {nom.targetFirstName} {nom.targetLastName}
                    </p>
                    <p className="text-sm text-white/50">{nom.contactEmailOrPhone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {nom.accepted ? (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-lg">
                        Claimed
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg">
                        Pending
                      </span>
                    )}
                    {nom.profileId && (
                      <Link
                        href={`/people/${nom.profileId}`}
                        className="text-primary hover:underline text-sm"
                      >
                        View
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
