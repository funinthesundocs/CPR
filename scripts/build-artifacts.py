#!/usr/bin/env python3
"""
CPR Artifact Builder
====================
Generates and downloads all NotebookLM artifacts for a defendant page.

Usage:
    python scripts/build-artifacts.py --notebook <id> --slug <defendant-slug>

Example:
    python scripts/build-artifacts.py \\
        --notebook ddcaf0ca-f7d6-40a5-8588-ea19a3747398 \\
        --slug colin-james-bradley

Output paths (must match page.tsx expectations exactly):
    public/artifacts/<slug>/podcast.mp3               — audio overview
    public/artifacts/<slug>/infographic-landscape.png — story infographic
    public/artifacts/<slug>/slides.pdf                — slide deck
    .agent/artifacts/<slug>/briefing.md               — briefing document
    .agent/artifacts/<slug>/notebook-summary.txt      — AI summary (one paragraph)
"""

import asyncio
import argparse
import sys
import time
from pathlib import Path


# ── Helpers ────────────────────────────────────────────────────────────────────

def find_project_root() -> Path:
    """Walk up from CWD to find CPR project root (contains both CLAUDE.md and package.json)."""
    cwd = Path.cwd()
    for candidate in [cwd, *cwd.parents]:
        if (candidate / "CLAUDE.md").exists() and (candidate / "package.json").exists():
            return candidate
    return cwd


def hr(char: str = "─", width: int = 56) -> str:
    return char * width


def log(msg: str):
    print(msg, flush=True)


def ok(msg: str):
    print(f"  ✓  {msg}", flush=True)


def info(msg: str):
    print(f"  →  {msg}", flush=True)


def err(msg: str):
    print(f"  ✗  {msg}", file=sys.stderr, flush=True)


def step(n: int, total: int, title: str):
    print(f"\n[{n}/{total}] {title}", flush=True)


def fmt_size(path: Path) -> str:
    b = path.stat().st_size
    if b >= 1_048_576:
        return f"{b / 1_048_576:.1f} MB"
    return f"{b / 1024:.1f} KB"


# ── Core build logic ───────────────────────────────────────────────────────────

async def build(notebook_id: str, slug: str, root: Path):
    # Import here so import errors surface with a clear message
    try:
        from notebooklm import NotebookLMClient
    except ImportError:
        err("notebooklm package not found.")
        err("Install with:  pip install notebooklm")
        sys.exit(1)

    try:
        from notebooklm._artifacts import ReportFormat, InfographicOrientation
    except ImportError:
        err("Could not import notebooklm._artifacts enums.")
        err("Your notebooklm version may be outdated. Run: pip install --upgrade notebooklm")
        sys.exit(1)

    # ── Output paths ──────────────────────────────────────────────────────────
    public_dir = root / "public" / "artifacts" / slug
    agent_dir  = root / ".agent"  / "artifacts" / slug
    public_dir.mkdir(parents=True, exist_ok=True)
    agent_dir.mkdir(parents=True, exist_ok=True)

    audio_path       = public_dir / "podcast.mp3"
    infographic_path = public_dir / "infographic-landscape.png"
    slides_path      = public_dir / "slides.pdf"
    briefing_path    = agent_dir  / "briefing.md"
    summary_path     = agent_dir  / "notebook-summary.txt"

    # ── Header ────────────────────────────────────────────────────────────────
    log("")
    log(hr("═"))
    log("  CPR Artifact Builder")
    log(hr("═"))
    log(f"  Defendant  : {slug}")
    log(f"  Notebook   : {notebook_id}")
    log(f"  Root       : {root}")
    log(f"  Public out : public/artifacts/{slug}/")
    log(f"  Agent out  : .agent/artifacts/{slug}/")
    log(hr("─"))

    async with await NotebookLMClient.from_storage() as client:

        # ── Step 1: Notebook summary (instant RPC, no generation queue) ───────
        step(1, 5, "Fetching notebook summary...")
        summary = await client.notebooks.get_summary(notebook_id)
        if not summary:
            err("get_summary returned empty string — check notebook ID and auth.")
            sys.exit(1)
        summary_path.write_text(summary.strip(), encoding="utf-8")
        ok(f".agent/artifacts/{slug}/notebook-summary.txt  ({fmt_size(summary_path)})")

        # ── Step 2: Kick off all generation tasks ─────────────────────────────
        step(2, 5, "Launching generation tasks...")
        info("Staggering requests 1s apart to avoid RPC collisions.")

        audio_gen = await client.artifacts.generate_audio(notebook_id)
        info(f"Audio        started  task_id={audio_gen.task_id}")

        await asyncio.sleep(1.0)
        infographic_gen = await client.artifacts.generate_infographic(
            notebook_id,
            orientation=InfographicOrientation.LANDSCAPE,
        )
        info(f"Infographic  started  task_id={infographic_gen.task_id}")

        await asyncio.sleep(1.0)
        slides_gen = await client.artifacts.generate_slide_deck(notebook_id)
        info(f"Slide deck   started  task_id={slides_gen.task_id}")

        await asyncio.sleep(1.0)
        briefing_gen = await client.artifacts.generate_report(
            notebook_id,
            report_format=ReportFormat.BRIEFING_DOC,
        )
        info(f"Briefing doc started  task_id={briefing_gen.task_id}")

        # ── Step 3: Wait for all to complete in parallel ──────────────────────
        step(3, 5, "Waiting for generation to complete...")
        info("Audio can take 5–15 minutes. All four run in parallel.")

        t0 = time.monotonic()

        try:
            (
                audio_result,
                infographic_result,
                slides_result,
                briefing_result,
            ) = await asyncio.gather(
                client.artifacts.wait_for_completion(
                    notebook_id, audio_gen.task_id,
                    timeout=900.0,
                    initial_interval=10.0,
                    max_interval=30.0,
                ),
                client.artifacts.wait_for_completion(
                    notebook_id, infographic_gen.task_id,
                    timeout=300.0,
                    initial_interval=5.0,
                    max_interval=15.0,
                ),
                client.artifacts.wait_for_completion(
                    notebook_id, slides_gen.task_id,
                    timeout=300.0,
                    initial_interval=5.0,
                    max_interval=15.0,
                ),
                client.artifacts.wait_for_completion(
                    notebook_id, briefing_gen.task_id,
                    timeout=300.0,
                    initial_interval=5.0,
                    max_interval=15.0,
                ),
            )
        except TimeoutError as e:
            err(f"Timed out waiting for generation: {e}")
            err("Re-run the script — existing in-progress jobs will be detected by NotebookLM.")
            sys.exit(1)

        elapsed = time.monotonic() - t0
        ok(f"All artifacts generated in {elapsed:.0f}s")

        for name, result in [
            ("Audio",       audio_result),
            ("Infographic", infographic_result),
            ("Slide deck",  slides_result),
            ("Briefing",    briefing_result),
        ]:
            failed = getattr(result, "is_failed", False)
            status = getattr(result, "status", "?")
            if failed:
                err(f"{name:<14} FAILED  status={status}  error={getattr(result, 'error', 'unknown')}")
                sys.exit(1)
            info(f"{name:<14} status={status}")

        # ── Step 4: Download all artifacts ────────────────────────────────────
        step(4, 5, "Downloading artifacts to disk...")

        # Safety check: never silently overwrite a manually-curated audio file.
        # If podcast.mp3 already exists, require explicit --force-audio flag.
        if audio_path.exists() and not getattr(args, 'force_audio', False):
            warn(f"podcast.mp3 already exists ({fmt_size(audio_path)}) — skipping audio download.")
            warn("The existing file may be a manually curated recording (e.g. an interview).")
            warn("Pass --force-audio to overwrite it with the NotebookLM generated audio.")
            skip_audio = True
        else:
            skip_audio = False

        if not skip_audio:
            await client.artifacts.download_audio(notebook_id, str(audio_path))
            ok(f"public/artifacts/{slug}/podcast.mp3               ({fmt_size(audio_path)})")
        else:
            ok(f"public/artifacts/{slug}/podcast.mp3               (kept existing — skipped)")

        await client.artifacts.download_infographic(notebook_id, str(infographic_path))
        ok(f"public/artifacts/{slug}/infographic-landscape.png ({fmt_size(infographic_path)})")

        await client.artifacts.download_slide_deck(notebook_id, str(slides_path))
        ok(f"public/artifacts/{slug}/slides.pdf                ({fmt_size(slides_path)})")

        await client.artifacts.download_report(notebook_id, str(briefing_path))
        ok(f".agent/artifacts/{slug}/briefing.md               ({fmt_size(briefing_path)})")

        # ── Step 5: Summary ───────────────────────────────────────────────────
        step(5, 5, "Build complete.")
        log("")
        log(hr("─"))
        log("  Artifacts written:")
        for path in [audio_path, infographic_path, slides_path, briefing_path, summary_path]:
            rel = path.relative_to(root)
            log(f"    {str(rel)}")
        log(hr("─"))
        log("  Next steps:")
        log(f"    1. Visit defendant page to verify artifacts render correctly")
        log(f"    2. git add public/artifacts/{slug}/ .agent/artifacts/{slug}/")
        log(f"    3. git commit -m \"feat: add artifacts for {slug}\"")
        log(hr("═"))
        log("")


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="CPR Artifact Builder — generates and downloads NotebookLM artifacts for a defendant page",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
examples:
  python scripts/build-artifacts.py \\
      --notebook ddcaf0ca-f7d6-40a5-8588-ea19a3747398 \\
      --slug colin-james-bradley
        """,
    )
    parser.add_argument(
        "--notebook", required=True, metavar="ID",
        help="NotebookLM notebook UUID (find in notebooklm.google.com URL)",
    )
    parser.add_argument(
        "--slug", required=True, metavar="SLUG",
        help="Defendant URL slug matching the defendants table (e.g. colin-james-bradley)",
    )
    parser.add_argument(
        "--root", default=None, metavar="PATH",
        help="CPR project root directory (auto-detected from CLAUDE.md if omitted)",
    )
    parser.add_argument(
        "--force-audio", action="store_true", default=False,
        dest="force_audio",
        help="Overwrite existing podcast.mp3 even if it already exists (default: skip to protect manually curated recordings)",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve() if args.root else find_project_root()

    if not (root / "CLAUDE.md").exists():
        print(f"WARNING: CLAUDE.md not found at {root}", file=sys.stderr)
        print("         Pass --root explicitly if the paths look wrong.", file=sys.stderr)

    asyncio.run(build(args.notebook, args.slug, root))


if __name__ == "__main__":
    main()
