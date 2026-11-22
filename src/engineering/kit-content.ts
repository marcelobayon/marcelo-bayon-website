/**
 * Content source of truth for /engineering (the plain-English overview AND the
 * 3D interactive overlay). Geometry lives in scene-config.ts; the human-readable
 * copy lives here, mirroring src/data/resume-content.ts.
 *
 * INTEGRITY RULES (same spirit as resume-content.ts):
 * - Describe only what the kit actually does. No invented metrics or adoption
 *   claims. The kit is a real, installable library — keep the language honest.
 */

import type { FormationId, KitModuleId } from "./scene-config";

export const KIT_META = {
  name: "Personal Engineering Kit",
  importName: "mbkit",
  tagline: "The reliable parts I reuse in every project.",
  plainSummary:
    "A personal set of reusable software building blocks. Instead of rebuilding the same plumbing for each new product, I keep the proven pieces in one tested toolkit and snap them into whatever I'm building next.",
  repoUrl: "https://github.com/marcelobayon/personal_engineering_kit",
  pipInstall:
    'pip install "git+https://github.com/marcelobayon/personal_engineering_kit.git"',
  importLine:
    "from mbkit import get_logger, load_config, retry, CircuitBreaker, Ok, Err",
} as const;

/** One kit module = one clickable block group in the 3D scene. */
export interface KitModule {
  id: KitModuleId;
  name: string;
  /** Plain-English, for a non-technical reader. An analogy, not jargon. */
  plain: string;
  /** What it does, for a developer. */
  technical: string;
  /** A short, real usage snippet. */
  snippet: string;
  /** File in the repo this maps to. */
  repoPath: string;
}

export const KIT_MODULES: readonly KitModule[] = [
  {
    id: "log",
    name: "Logging",
    plain:
      "A clear, consistent record of what the software did — like a flight recorder. Set it up once and every project writes its diary the same way.",
    technical:
      "Idempotent, configurable logger factory. Human-readable or structured JSON, with request-scoped context — and it never stacks duplicate handlers.",
    snippet: 'log = get_logger("myapp", json=True)\nlog.info("request", extra={"id": "abc123"})',
    repoPath: "src/mbkit/log.py",
  },
  {
    id: "config",
    name: "Configuration",
    plain:
      "The settings dial. One predictable rule for where a setting comes from — a safe default, a file, or the environment it's running in — so nothing is a surprise.",
    technical:
      "Layered config: defaults < file < environment. Typed getters coerce strings sensibly; supports .json, .toml, and .env.",
    snippet: 'cfg = load_config(defaults={"port": 8080}, env_prefix="APP_")\ncfg.get_int("port")  # env wins',
    repoPath: "src/mbkit/config.py",
  },
  {
    id: "resilience",
    name: "Resilience",
    plain:
      "The safety system. When something it depends on stumbles, the software retries carefully, switches to a backup, or steps back instead of crashing — then checks the result is actually good.",
    technical:
      "retry (bounded backoff + jitter), CircuitBreaker (closed/open/half-open), and approved-fallback chains. Translated from the biology-to-software theory into bounded, verifiable patterns.",
    snippet: "@retry(attempts=3, exceptions=(ConnectionError,))\ndef fetch(): ...",
    repoPath: "src/mbkit/resilience/",
  },
  {
    id: "result",
    name: "Result",
    plain:
      "Honest outcomes. Every operation returns either a value or a clear reason it failed — never a silent blank — so problems can't hide.",
    technical:
      "A railway-oriented Result[T, E] (Ok / Err) for expected failures, with map / and_then / unwrap_or so a failure short-circuits a pipeline cleanly.",
    snippet: 'parse_port("9000").map(lambda p: p + 1).unwrap_or(8080)',
    repoPath: "src/mbkit/result.py",
  },
  {
    id: "timing",
    name: "Timing",
    plain:
      "A stopwatch. Measure how long things take, because you can't speed up or budget what you never measured.",
    technical:
      "A Timer context manager and a @timed decorator that log elapsed time, pairing with the logging module.",
    snippet: 'with Timer("load", logger=log):\n    load_everything()',
    repoPath: "src/mbkit/timing.py",
  },
] as const;

/** One scroll section = one formation. The narrative arc of the page. */
export interface KitSection {
  id: FormationId;
  eyebrow: string;
  title: string;
  /** Plain-English body for the overlay card. */
  body: string;
  /** Which modules light up in this section. */
  modules: KitModuleId[];
}

export const KIT_SECTIONS: readonly KitSection[] = [
  {
    id: "orbit-scatter",
    eyebrow: "The idea",
    title: "Reusable building blocks",
    body: "Every project needs the same core parts. Instead of rebuilding them each time, they float here as a kit — ready to snap together. Scroll to watch the same pieces solve different problems.",
    modules: ["log", "config", "resilience", "result", "timing"],
  },
  {
    id: "stacked-pillar",
    eyebrow: "Step one",
    title: "Set your standards once",
    body: "The foundation: how the software keeps a record of what it did, and how it reads its settings. Decide this once, reuse it everywhere, and every project behaves consistently.",
    modules: ["log", "config"],
  },
  {
    id: "radial-matrix",
    eyebrow: "Step two",
    title: "Survive failure on purpose",
    body: "Real systems depend on things that sometimes break. These parts retry carefully, fall back to a backup, and report honest outcomes — then verify the result is actually correct, not just quiet.",
    modules: ["resilience", "result"],
  },
  {
    id: "unified-core",
    eyebrow: "The payoff",
    title: "One kit, reused everywhere",
    body: "The parts dock into a single, shippable whole — the same tested toolkit powering each product I build, instead of five slightly different copies of the same plumbing.",
    modules: ["log", "config", "resilience", "result", "timing"],
  },
] as const;

export function moduleById(id: KitModuleId): KitModule {
  const found = KIT_MODULES.find((m) => m.id === id);
  if (!found) throw new Error(`Unknown kit module: ${id}`);
  return found;
}

export function sectionById(id: FormationId): KitSection {
  const found = KIT_SECTIONS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown kit section: ${id}`);
  return found;
}
