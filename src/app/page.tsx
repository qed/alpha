import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import { PublicNavbar } from "@/components/shared/public-navbar";
import { HomepageHero } from "./_components/homepage-hero";
import { HomepageProgress } from "./_components/homepage-progress";
import { HomepageInterestChart } from "./_components/homepage-interest-chart";
import { HomepageServiceAreas } from "./_components/homepage-service-areas";
import { HomepageFooter } from "./_components/homepage-footer";
import { AlphaModelSection } from "./hub/library/website-preview/_components/alpha-model-section";
import { VideoSection } from "./hub/library/website-preview/_components/video-section";
import { DailyScheduleSection } from "./hub/library/website-preview/_components/daily-schedule-section";
import { EnrollmentSection } from "./hub/library/website-preview/_components/enrollment-section";
import { ComingSoonSection } from "./hub/library/website-preview/_components/coming-soon-section";
import { CtaSection } from "./hub/library/website-preview/_components/cta-section";
import "./homepage.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--wp-font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--wp-font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alpha Toronto — School that actually prepares kids for the future",
  description:
    "Alpha is a revolutionary K-8 school where students master core academics in ~2 hours per day through AI-powered, personalized learning.",
};

export default function HomePage() {
  return (
    <div className={`wp-root ${sora.variable} ${dmSans.variable}`}>
      <PublicNavbar />
      <main>
        <HomepageHero />
        <HomepageProgress />
        <AlphaModelSection />
        <VideoSection />
        <DailyScheduleSection />
        <EnrollmentSection />
        <ComingSoonSection />
        <HomepageInterestChart />
        <CtaSection />
        <HomepageServiceAreas />
      </main>
      <HomepageFooter />
    </div>
  );
}
