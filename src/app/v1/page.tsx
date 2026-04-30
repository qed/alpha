import type { Metadata } from "next";
import StoriesApp from "@/components/v1/stories-app";
import "./v1.css";

export const metadata: Metadata = {
  title: "Parent Stories — Alpha Parents Hub",
  description:
    "Candid stories from Toronto families exploring, researching, committing to, and enrolled at Alpha School.",
};

export default function V1Page() {
  return <StoriesApp />;
}
