import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/app-layout";
import { ShieldCheck, Phone, Eye, EyeOff, Save, CheckCircle } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const res = await fetch("/api/profiles/my/profile");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const [userForm, setUserForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    bio: user?.bio || "",
    location: user?.location || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const [privacyForm, setPrivacyForm] = useState({
    profileVisibility: profile?.profileVisibility || "public",
    reviewsVisibility: profile?.reviewsVisibility || "public",
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!profile?.id) return;
      const res = await fetch(`/api/profiles/${profile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const verifyPhoneMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/users/me/verify-phone", { method: "POST" });
      if (!res.ok) throw new Error("Failed to verify");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate(userForm);
  };

  const handleSavePrivacy = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(privacyForm);
  };

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
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Settings</h1>
          <p className="text-white/60">Manage your profile and privacy preferences.</p>
        </div>

        {saved && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Changes saved successfully!
          </div>
        )}

        {/* Profile Settings */}
        <form onSubmit={handleSaveProfile} className="glass rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold font-display">Profile Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">First name</label>
              <input
                type="text"
                value={userForm.firstName}
                onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Last name</label>
              <input
                type="text"
                value={userForm.lastName}
                onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Location</label>
            <input
              type="text"
              value={userForm.location}
              onChange={(e) => setUserForm({ ...userForm, location: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="San Francisco, CA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Bio</label>
            <textarea
              value={userForm.bio}
              onChange={(e) => setUserForm({ ...userForm, bio: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              rows={3}
              placeholder="Tell people about yourself..."
            />
          </div>

          <button
            type="submit"
            disabled={updateUserMutation.isPending}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {updateUserMutation.isPending ? "Saving..." : "Save changes"}
          </button>
        </form>

        {/* Phone Verification */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold font-display">Phone Verification</h2>
          <p className="text-white/60 text-sm">
            Verify your phone number to get the verified badge on your profile and reviews.
          </p>

          <div className="flex items-center gap-4">
            <input
              type="tel"
              value={userForm.phoneNumber}
              onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="+1 (555) 123-4567"
            />
            {user?.phoneVerified ? (
              <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-3 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
                Verified
              </div>
            ) : (
              <button
                onClick={() => {
                  updateUserMutation.mutate({ phoneNumber: userForm.phoneNumber });
                  setTimeout(() => verifyPhoneMutation.mutate(), 500);
                }}
                disabled={!userForm.phoneNumber || verifyPhoneMutation.isPending}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                <Phone className="w-4 h-4" />
                Verify
              </button>
            )}
          </div>
          <p className="text-xs text-white/40">
            MVP Note: Phone verification is simulated. In production, this would send an SMS code.
          </p>
        </div>

        {/* Privacy Settings */}
        <form onSubmit={handleSavePrivacy} className="glass rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold font-display">Privacy Settings</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                {privacyForm.profileVisibility === "public" ? (
                  <Eye className="w-5 h-5 text-green-400" />
                ) : (
                  <EyeOff className="w-5 h-5 text-yellow-400" />
                )}
                <div>
                  <p className="font-medium">Profile Visibility</p>
                  <p className="text-sm text-white/50">Control who can see your profile</p>
                </div>
              </div>
              <select
                value={privacyForm.profileVisibility}
                onChange={(e) => setPrivacyForm({ ...privacyForm, profileVisibility: e.target.value })}
                className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                {privacyForm.reviewsVisibility === "public" ? (
                  <Eye className="w-5 h-5 text-green-400" />
                ) : (
                  <EyeOff className="w-5 h-5 text-yellow-400" />
                )}
                <div>
                  <p className="font-medium">Reviews Visibility</p>
                  <p className="text-sm text-white/50">Control who can see your reviews</p>
                </div>
              </div>
              <select
                value={privacyForm.reviewsVisibility}
                onChange={(e) => setPrivacyForm({ ...privacyForm, reviewsVisibility: e.target.value })}
                className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {updateProfileMutation.isPending ? "Saving..." : "Save privacy settings"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
