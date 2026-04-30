import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

configure({ reactStrictMode: false });

afterEach(() => {
  cleanup();
});
