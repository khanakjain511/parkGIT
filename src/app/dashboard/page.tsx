import type { Metadata } from "next";
import Platform from "@/components/platform";

export const metadata: Metadata = {
  title: "Dashboard | Perishables Black Box",
};

export default function DashboardPage() {
  return <Platform />;
}
