import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { DemoSection } from "@/components/landing/demo-section";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhoIsThisFor } from "@/components/landing/who-is-this-for";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";
import { Cta } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <LandingNav />
      <main>
        <Hero />
        <DemoSection />
        <Features />
        <HowItWorks />
        <WhoIsThisFor />
        <Testimonials />
        <Faq />
        <Cta />
      </main>
      <LandingFooter />
    </div>
  );
}
