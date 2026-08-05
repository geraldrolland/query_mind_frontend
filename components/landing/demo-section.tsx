import { AnimatedDashboardDemo } from "./animated-dashboard-demo";
import { SectionHeading } from "./section-heading";

export function DemoSection() {
  return (
    <section id="demo" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24">
      <SectionHeading
        eyebrow="Live demo"
        title="Watch QueryMind answer in real time"
        subtitle="A scripted walkthrough of the actual dashboard — clean, ask, and get charts back in seconds."
      />
      <AnimatedDashboardDemo />
    </section>
  );
}
