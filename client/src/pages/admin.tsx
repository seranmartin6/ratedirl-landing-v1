import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/app-layout";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Link, useLocation } from "wouter";
import { 
  Shield, 
  Flag, 
  Star, 
  Users, 
  Trash2, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from "lucide-react";

export default function AdminModeration() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  if (user?.role !== "admin") {
    navigate("/app");
    return null;
  }

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: async () => {
      const res = await fetch("/api/admin/reports");
      return res.json();
    },
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      return res.json();
    },
  });

  const closeReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const res = await fetch(`/api/admin/reports/${reportId}/close`, { method: "POST" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });

  const hideReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/admin/reviews/${reviewId}/hide`, { method: "POST" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">Admin Panel</h1>
            <p className="text-white/60">Moderate reports and manage users</p>
          </div>
        </div>

        {/* Reports Section */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Flag className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-bold font-display">Open Reports</h2>
            {reports && reports.length > 0 && (
              <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs font-medium">
                {reports.length}
              </span>
            )}
          </div>

          {reportsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report: any) => (
                <div key={report.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm text-white/50 mb-1">
                        Reported by {report.reporter?.firstName} {report.reporter?.lastName}
                      </p>
                      <p className="font-medium">Reason: {report.reason}</p>
                    </div>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg shrink-0">
                      Open
                    </span>
                  </div>

                  {report.review && (
                    <div className="bg-black/30 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < report.review.rating ? "fill-yellow-500 text-yellow-500" : "text-white/20"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-white/40">Review content:</span>
                      </div>
                      <p className="text-sm text-white/80">"{report.review.text}"</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        hideReviewMutation.mutate(report.reviewId);
                        closeReportMutation.mutate(report.id);
                      }}
                      className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Hide Review
                    </button>
                    <button
                      onClick={() => closeReportMutation.mutate(report.id)}
                      className="flex items-center gap-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Dismiss Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white/60">No open reports. All clear!</p>
            </div>
          )}
        </div>

        {/* Users Section */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold font-display">All Users</h2>
            {users && (
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium">
                {users.length}
              </span>
            )}
          </div>

          {usersLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-white/50 border-b border-white/10">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Verified</th>
                    <th className="pb-3 font-medium">Joined</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u: any) => (
                    <tr key={u.id} className="text-sm">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <ProfileAvatar 
                            photoUrl={u.photoUrl} 
                            firstName={u.firstName} 
                            lastName={u.lastName} 
                            size="sm" 
                          />
                          <span>{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-white/60">{u.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          u.role === "admin" 
                            ? "bg-red-500/20 text-red-400" 
                            : "bg-white/10 text-white/60"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        {u.phoneVerified ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-white/30" />
                        )}
                      </td>
                      <td className="py-3 text-white/60">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        {u.id !== user?.id && u.role !== "admin" && (
                          <button
                            onClick={() => {
                              if (confirm(`Ban ${u.firstName} ${u.lastName}? This cannot be undone.`)) {
                                banUserMutation.mutate(u.id);
                              }
                            }}
                            className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Ban
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-white/60 py-8">No users found.</p>
          )}
        </div>

        {/* Admin Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-400 mb-1">Admin Actions</p>
              <p className="text-white/70">
                Actions taken here are permanent. Hiding a review removes it from public view. 
                Banning a user deletes their account entirely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
