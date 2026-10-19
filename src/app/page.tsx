import type { Metadata } from "next";
import Landing from "@/components/landing";

export const metadata: Metadata = {
  title: "Perishables Black Box | Fresh cargo. Clear evidence. Fair outcomes.",
  description:
    "Evidence-first cold-chain auditing for farmers, drivers, buyers, and reviewers. Explore cargo monitoring, transparent diagnostics, and fair settlement recommendations.",
};

export default function Home() {
  return <Landing />;
}
