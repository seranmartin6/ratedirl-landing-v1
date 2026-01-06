import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/app-layout";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Star, Eye, MessageSquare, ArrowRight, ShieldCheck, Search, PlusCircle } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Dashboard() {
  const { user } = useAuth();

  const { data: analytics } = useQuery({
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

  return (
    <AppLayout>
      <motion.div 
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Welcome Header */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          variants={fadeInUp}
        >
          <div>
            <h1 className="text-3xl font-bold font-display mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-white/60">Here's what's happening with your reputation.</p>
          </div>
          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/people"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <Search className="w-4 h-4" />
                Find people
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/nominate"
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Nominate
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={staggerContainer}
        >
          <motion.div 
            className="glass rounded-2xl p-6"
            variants={fadeInUp}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <span className="text-white/60 text-sm">Profile Views</span>
            </div>
            <p className="text-3xl font-bold">{analytics?.profileViews || 0}</p>
          </motion.div>

          <motion.div 
            className="glass rounded-2xl p-6"
            variants={fadeInUp}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-accent" />
              </div>
              <span className="text-white/60 text-sm">Reviews Received</span>
            </div>
            <p className="text-3xl font-bold">{analytics?.reviewsReceived || 0}</p>
          </motion.div>

          <motion.div 
            className="glass rounded-2xl p-6"
            variants={fadeInUp}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-white/60 text-sm">Reviews Given</span>
            </div>
            <p className="text-3xl font-bold">{analytics?.reviewsGiven || 0}</p>
          </motion.div>
        </motion.div>

        {/* Your Profile Card */}
        {myProfile && (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-display">Your Profile</h2>
              <Link
                href={`/people/${myProfile.id}`}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View public profile <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-center gap-4">
                <ProfileAvatar 
                  photoUrl={user?.photoUrl} 
                  firstName={user?.firstName} 
                  lastName={user?.lastName} 
                  size="xl" 
                  className="rounded-2xl"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">
                      {myProfile.firstName} {myProfile.lastName}
                    </h3>
                    {user?.phoneVerified && (
                      <ShieldCheck className="w-5 h-5 text-blue-400 fill-blue-400/20" />
                    )}
                  </div>
                  {profileData?.stats && (
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(profileData.stats.average)
                                ? "fill-current"
                                : "opacity-30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-white/60">
                        {profileData.stats.average.toFixed(1)} ({profileData.stats.count} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {profileData?.stats && profileData.stats.count > 0 && (
                <div className="flex-1 flex items-center justify-end">
                  <div className="space-y-1 w-full max-w-xs">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = profileData.stats.breakdown[rating] || 0;
                      const percentage = profileData.stats.count > 0 
                        ? (count / profileData.stats.count) * 100 
                        : 0;
                      return (
                        <div key={rating} className="flex items-center gap-2 text-sm">
                          <span className="w-3 text-white/60">{rating}</span>
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-6 text-right text-white/40">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Reviews */}
        {profileData?.reviews && profileData.reviews.length > 0 && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold font-display mb-4">Recent Reviews</h2>
            <div className="space-y-4">
              {profileData.reviews.slice(0, 3).map((review: any) => (
                <div key={review.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-white/20"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-white/40">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/90 mb-2">"{review.text}"</p>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <span>
                      {review.reviewer?.firstName} {review.reviewer?.lastName?.[0]}.
                    </span>
                    {review.reviewer?.phoneVerified && (
                      <span className="text-blue-400">Verified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!profileData?.reviews || profileData.reviews.length === 0) && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
            <p className="text-white/60 mb-6">
              Share your profile link with friends and colleagues to start building your reputation.
            </p>
            <Link
              href="/nominate"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Nominate someone
            </Link>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
