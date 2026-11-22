// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ResumePage from "./pages/ResumePage";

afterEach(cleanup);

describe("HomePage", () => {
  it("renders the hero, a role, and a venture without throwing", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <HomePage />
      </MemoryRouter>,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("Marcelo Bayon");
    expect(text).toContain("Software Developer");
    expect(text).toContain("Mitig8 AI");
  });
});

describe("ResumePage (no WebGL → text résumé)", () => {
  it("falls back to the accessible résumé and shows real experience", async () => {
    const { container, findByText } = render(
      <MemoryRouter initialEntries={["/resume"]}>
        <ResumePage />
      </MemoryRouter>,
    );
    // jsdom has no WebGL, so the page resolves to the text résumé.
    await findByText(/Office Solutions Specialist II/);
    const text = container.textContent ?? "";
    expect(text).toContain("Experience");
    expect(text).toContain("Amazon");
    expect(text).toContain("Technical skills");
  });
});
