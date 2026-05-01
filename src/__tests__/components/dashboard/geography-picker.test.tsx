import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockSelectGeography = vi.fn();
const mockCreateGeography = vi.fn();

vi.mock("@/lib/actions/geography-selection", () => ({
  selectGeography: (input: unknown) => mockSelectGeography(input),
  createGeography: (input: unknown) => mockCreateGeography(input),
}));

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const mockReload = vi.fn().mockResolvedValue(undefined);
vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({ user: { reload: mockReload } }),
}));

import { GeographyPicker } from "@/components/dashboard/geography-picker";

const mockGeographies = [
  { id: "geo-1", name: "Austin", region: "Texas", country: "US" },
  { id: "geo-2", name: "Toronto", region: "Ontario", country: "CA" },
  { id: "geo-3", name: "Miami", region: "Florida", country: "US" },
];

describe("GeographyPicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectGeography.mockResolvedValue({ success: true });
    mockCreateGeography.mockResolvedValue({ success: true, geographyId: "geo-new" });
  });

  it("renders geography list", () => {
    render(<GeographyPicker geographies={mockGeographies} />);
    expect(screen.getByText("Austin")).toBeInTheDocument();
    expect(screen.getByText("Toronto")).toBeInTheDocument();
    expect(screen.getByText("Miami")).toBeInTheDocument();
  });

  it("filters geographies by search text", async () => {
    render(<GeographyPicker geographies={mockGeographies} />);
    const searchInput = screen.getByPlaceholderText("Search geographies...");

    fireEvent.change(searchInput, { target: { value: "tor" } });

    expect(screen.getByText("Toronto")).toBeInTheDocument();
    expect(screen.queryByText("Austin")).not.toBeInTheDocument();
    expect(screen.queryByText("Miami")).not.toBeInTheDocument();
  });

  it("calls selectGeography and refreshes on selection", async () => {
    render(<GeographyPicker geographies={mockGeographies} />);

    fireEvent.click(screen.getByText("Austin"));

    await waitFor(() => {
      expect(mockSelectGeography).toHaveBeenCalledWith({ geographyId: "geo-1" });
    });

    await waitFor(() => {
      expect(mockReload).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows create new prompt when search has no results", () => {
    render(<GeographyPicker geographies={mockGeographies} />);
    const searchInput = screen.getByPlaceholderText("Search geographies...");

    fireEvent.change(searchInput, { target: { value: "Springfield" } });

    expect(screen.getByText("No geographies match your search.")).toBeInTheDocument();
    expect(
      screen.getByText(/Create "Springfield" as a new geography/)
    ).toBeInTheDocument();
  });

  it("switches to create mode and pre-fills name from search", () => {
    render(<GeographyPicker geographies={mockGeographies} />);
    const searchInput = screen.getByPlaceholderText("Search geographies...");

    fireEvent.change(searchInput, { target: { value: "Springfield" } });
    fireEvent.click(screen.getByText(/Create "Springfield"/));

    expect(screen.getByLabelText("Geography name *")).toHaveValue("Springfield");
    expect(screen.getByLabelText("Region *")).toBeInTheDocument();
    expect(screen.getByLabelText("Country *")).toBeInTheDocument();
  });

  it("calls createGeography and refreshes on form submit", async () => {
    render(<GeographyPicker geographies={mockGeographies} />);

    fireEvent.click(screen.getByText("Create a new geography"));

    fireEvent.change(screen.getByLabelText("Geography name *"), {
      target: { value: "Springfield" },
    });
    fireEvent.change(screen.getByLabelText("Region *"), {
      target: { value: "Illinois" },
    });

    fireEvent.click(screen.getByText("Create & Select"));

    await waitFor(() => {
      expect(mockCreateGeography).toHaveBeenCalledWith({
        name: "Springfield",
        region: "Illinois",
        country: "US",
      });
    });

    await waitFor(() => {
      expect(mockReload).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error banner when server action fails", async () => {
    mockSelectGeography.mockResolvedValue({
      success: false,
      error: "This geography was just claimed by another champion.",
    });

    render(<GeographyPicker geographies={mockGeographies} />);
    fireEvent.click(screen.getByText("Austin"));

    await waitFor(() => {
      expect(
        screen.getByText("This geography was just claimed by another champion.")
      ).toBeInTheDocument();
    });
  });

  it("shows empty state when all geographies are claimed", () => {
    render(<GeographyPicker geographies={[]} />);
    expect(screen.getByText("No geographies available.")).toBeInTheDocument();
    expect(screen.getByText("Create a new geography")).toBeInTheDocument();
  });

  it("cancels create mode and returns to select", () => {
    render(<GeographyPicker geographies={mockGeographies} />);

    fireEvent.click(screen.getByText("Create a new geography"));
    expect(screen.getByLabelText("Geography name *")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByPlaceholderText("Search geographies...")).toBeInTheDocument();
  });
});
