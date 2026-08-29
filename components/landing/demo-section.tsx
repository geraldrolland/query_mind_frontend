import { AnimatedDashboardDemo } from "./animated-dashboard-demo";
import { SectionHeading } from "./section-heading";

export function DemoSection() {
  return (
    <section id="demo" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-24">
      <SectionHeading
        eyebrow="Live demo"
        title="From upload to insight in seconds"
        subtitle="Upload a CSV, explore your data, ask a question, and get a chart — all in one seamless flow."
      />
      <AnimatedDashboardDemo />
    </section>
  );
}
