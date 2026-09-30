import type { Metadata } from "next";
import { CmsShell } from "@/components/cms/shell";

export const metadata: Metadata = {
  title: "Portfolio CMS",
  robots: { index: false, follow: false },
};

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return <CmsShell>{children}</CmsShell>;
}
