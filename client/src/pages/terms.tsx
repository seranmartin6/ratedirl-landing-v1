import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { ShimmerLogo } from "@/components/shimmer-logo";

export const TOS_VERSION = "1.0.0";
export const TOS_LAST_UPDATED = "January 6, 2026";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="mb-8">
          <ShimmerLogo size="lg" showText={true} />
        </div>

        <div className="glass rounded-2xl p-8 md:p-12">
          <h1 className="text-3xl font-bold font-display mb-2">Terms of Service</h1>
          <p className="text-white/50 mb-8">Last updated: {TOS_LAST_UPDATED} (Version {TOS_VERSION})</p>

          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/80">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using this website, mobile application, or any related services (collectively, the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you must not use the Platform.</p>
              <p>These Terms form a legally binding agreement between you and RatedIRL Inc. ("Company," "we," "us," or "our").</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Nature of the Platform</h2>
              <p>The Platform provides tools that allow users to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Create profiles</li>
                <li>Nominate individuals</li>
                <li>Submit reviews and ratings</li>
                <li>View content submitted by other users</li>
              </ul>
              <p className="mt-3">The Platform is a neutral technology provider. We do not create, endorse, verify, or guarantee the accuracy of user-generated content.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Eligibility & User Responsibility</h2>
              <p><strong>You must:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Be at least 18 years old</li>
                <li>Provide accurate and truthful information</li>
                <li>Use the Platform in compliance with all applicable laws</li>
              </ul>
              <p className="mt-3"><strong>You are solely responsible for:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Content you submit</li>
                <li>Statements you make</li>
                <li>Any consequences arising from your use of the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Consent-Based Reviews (Critical Section)</h2>
              <p><strong>Reviews on this Platform are consent-based.</strong></p>
              <p>Profiles may only display reviews publicly once the individual has:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Claimed their profile, OR</li>
                <li>Accepted an invitation to join the Platform</li>
              </ul>
              <p className="mt-3">Unclaimed profiles may store reviews privately or in a pending state. Individuals may control visibility through privacy settings. This system exists to promote fairness and accountability.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. User-Generated Content Disclaimer</h2>
              <p>All content, including reviews, ratings, comments, and profile information, is user-generated.</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>We do not verify factual accuracy</li>
                <li>We do not guarantee truthfulness</li>
                <li>Opinions expressed are those of users, not the Company</li>
              </ul>
              <p className="mt-3"><strong>You understand and agree that the Company is not responsible or liable for user-generated content.</strong></p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Prohibited Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Post false statements of fact</li>
                <li>Defame, harass, threaten, or abuse others</li>
                <li>Impersonate another person</li>
                <li>Post content intended to cause reputational harm</li>
                <li>Upload private, confidential, or unlawfully obtained information</li>
                <li>Use the Platform for stalking, harassment, or retaliation</li>
              </ul>
              <p className="mt-3">Violation may result in content removal, account suspension, or permanent ban.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Moderation & Enforcement Rights</h2>
              <p>We reserve the absolute right, at our sole discretion, to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Remove or hide content</li>
                <li>Suspend or terminate accounts</li>
                <li>Limit visibility of profiles or reviews</li>
                <li>Investigate complaints</li>
                <li>Cooperate with law enforcement</li>
              </ul>
              <p className="mt-3">We are not obligated to moderate content, but may do so.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Reporting & Dispute Process</h2>
              <p>Users may report content they believe violates these Terms. We may review reported content, remove or restrict access, or take no action if content does not violate our policies. We are not required to resolve disputes between users.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">9. No Professional or Legal Advice</h2>
              <p>Content on the Platform is for informational purposes only. Nothing on the Platform constitutes legal advice, employment advice, professional certification, or background checks. You rely on content at your own risk.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">10. Limitation of Liability</h2>
              <p><strong>To the maximum extent permitted by law, the Company shall not be liable for:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Defamation</li>
                <li>Emotional distress</li>
                <li>Reputational harm</li>
                <li>Loss of income or opportunity</li>
                <li>User disputes</li>
                <li>Content accuracy</li>
                <li>Third-party conduct</li>
              </ul>
              <p className="mt-3">Our total liability, if any, shall not exceed $100 CAD or the amount paid to us, whichever is less.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">11. Indemnification</h2>
              <p>You agree to defend, indemnify, and hold harmless the Company, its owners, officers, employees, and agents from any claims, damages, losses, liabilities, or legal fees arising from:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your content</li>
                <li>Your use of the Platform</li>
                <li>Your violation of these Terms</li>
                <li>Any dispute with another user</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">12. Account Termination</h2>
              <p>We may suspend or terminate your account at any time, for any reason, without notice. You may stop using the Platform at any time.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">13. Intellectual Property</h2>
              <p>The Platform, branding, design, software, and trademarks belong to the Company. Users retain ownership of their content but grant the Company a non-exclusive, royalty-free license to host, display, and distribute it as part of the Platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">14. Third-Party Services</h2>
              <p>The Platform may link to third-party services. We are not responsible for third-party content, external websites, or third-party actions or policies.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">15. Arbitration & Governing Law</h2>
              <p>Any dispute arising from these Terms shall be resolved by binding arbitration, not in court, except where prohibited by law. These Terms are governed by the laws of Ontario, Canada.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">16. Changes to Terms</h2>
              <p>We may update these Terms at any time. Continued use of the Platform constitutes acceptance of updated Terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">17. Contact Information</h2>
              <p>For legal or policy inquiries: <a href="mailto:legal@ratedirl.com" className="text-primary hover:underline">legal@ratedirl.com</a></p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
