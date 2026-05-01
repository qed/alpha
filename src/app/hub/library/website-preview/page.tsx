import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import { Navbar } from "./_components/navbar";
import { HeroSection } from "./_components/hero-section";
import { EventsStandaloneSection } from "./_components/form-screenshot-section";
import { ProgressSection } from "./_components/progress-section";
import { AlphaModelSection } from "./_components/alpha-model-section";
import { VideoSection } from "./_components/video-section";
import { DailyScheduleSection } from "./_components/daily-schedule-section";
import { EnrollmentSection } from "./_components/enrollment-section";
import { ComingSoonSection } from "./_components/coming-soon-section";
import { InterestChart } from "./_components/interest-chart";
import { CtaSection } from "./_components/cta-section";
import { ServiceAreasSection } from "./_components/service-areas-section";
import { Footer } from "./_components/footer";
import "./website-preview.css";

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
  title: "Alpha Local City",
  description:
    "Alpha Local City — a full Alpha school website template for champions.",
};

export default function WebsitePreviewPage() {
  return (
    <div className={`wp-root ${sora.variable} ${dmSans.variable}`}>
      <Navbar />
      <main>
        <HeroSection />
        <EventsStandaloneSection />
        <ProgressSection />
        <AlphaModelSection />
        <VideoSection />
        <DailyScheduleSection />
        <EnrollmentSection />
        <ComingSoonSection />
        <InterestChart />
        <CtaSection />
        <ServiceAreasSection />
      </main>
      <Footer />
    </div>
  );
}
