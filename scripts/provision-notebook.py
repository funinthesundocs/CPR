#!/usr/bin/env python3
"""
CPR Notebook Provisioner
========================
Creates a NotebookLM notebook for a defendant, adds all sources,
waits for indexing, then hands off to build-artifacts.py.

Usage:
    python scripts/provision-notebook.py \\
        --slug colin-james-bradley \\
        --name "Colin James Bradley" \\
        [--source-url URL ...] \\
        [--source-file PATH ...]

Example (full):
    python scripts/provision-notebook.py \\
        --slug colin-james-bradley \\
        --name "Colin James Bradley" \\
        --source-url "https://example.com/article-1" \\
        --source-url "https://example.com/article-2" \\
        --source-file "evidence/affidavit.pdf" \\
        --source-file "evidence/contract.pdf"

Outputs:
    .agent/artifacts/<slug>/notebook-id.txt   — notebook UUID for reference
    Prints the exact build-artifacts.py command to run next.

Note:
    This script only provisions the notebook and sources.
    Run build-artifacts.py separately to generate and download artifacts.
"""

import asyncio
import argparse
import sys
from pathlib import Path


# ── Helpers ────────────────────────────────────────────────────────────────────

def find_project_root() -> Path:
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


def warn(msg: str):
    print(f"  ⚠  {msg}", flush=True)


def err(msg: str):
    print(f"  ✗  {msg}", file=sys.stderr, flush=True)


def step(n: int, total: int, title: str):
    print(f"\n[{n}/{total}] {title}", flush=True)


# ── Core provisioning logic ────────────────────────────────────────────────────

async def provision(
    slug: str,
    defendant_name: str,
    source_urls: list[str],
    source_files: list[Path],
    root: Path,
):
    try:
        from notebooklm import NotebookLMClient
    except ImportError:
        err("notebooklm package not found.")
        err("Install with:  pip install notebooklm")
        sys.exit(1)

    # ── Output directory ──────────────────────────────────────────────────────
    agent_dir = root / ".agent" / "artifacts" / slug
    agent_dir.mkdir(parents=True, exist_ok=True)

    notebook_id_path = agent_dir / "notebook-id.txt"

    # ── Header ────────────────────────────────────────────────────────────────
    log("")
    log(hr("═"))
    log("  CPR Notebook Provisioner")
    log(hr("═"))
    log(f"  Defendant  : {defendant_name}")
    log(f"  Slug       : {slug}")
    log(f"  URLs       : {len(source_urls)}")
    log(f"  Files      : {len(source_files)}")
    log(hr("─"))

    if not source_urls and not source_files:
        warn("No sources provided. Notebook will be created empty.")
        warn("Add sources manually in NotebookLM before running build-artifacts.py.")

    # ── Validate files exist before starting ─────────────────────────────────
    for f in source_files:
        if not f.exists():
            err(f"Source file not found: {f}")
            sys.exit(1)

    async with await NotebookLMClient.from_storage() as client:

        # ── Step 1: Create notebook ───────────────────────────────────────────
        step(1, 4, "Creating NotebookLM notebook...")
        notebook_title = f"CPR — {defendant_name}"
        notebook = await client.notebooks.create(notebook_title)
        notebook_id = notebook.id
        ok(f"Created: \"{notebook_title}\"")
        ok(f"Notebook ID: {notebook_id}")

        # Save notebook ID immediately so it's never lost
        notebook_id_path.write_text(notebook_id, encoding="utf-8")
        ok(f"Saved to .agent/artifacts/{slug}/notebook-id.txt")

        # ── Step 2: Add URL sources ───────────────────────────────────────────
        added_source_ids: list[str] = []

        if source_urls:
            step(2, 4, f"Adding {len(source_urls)} URL source(s)...")
            for url in source_urls:
                try:
                    source = await client.sources.add_url(notebook_id, url, wait=False)
                    added_source_ids.append(source.id)
                    info(f"Queued: {url[:70]}{'...' if len(url) > 70 else ''}")
                except Exception as e:
                    warn(f"Failed to add URL (skipping): {url}")
                    warn(f"        Error: {e}")
        else:
            step(2, 4, "No URL sources — skipping.")

        # ── Step 3: Add file sources ──────────────────────────────────────────
        if source_files:
            step(3, 4, f"Uploading {len(source_files)} file source(s)...")
            for file_path in source_files:
                try:
                    source = await client.sources.add_file(
                        notebook_id,
                        str(file_path),
                        wait=False,
                    )
                    added_source_ids.append(source.id)
                    ok(f"Uploaded: {file_path.name}  ({file_path.stat().st_size / 1024:.1f} KB)")
                except Exception as e:
                    warn(f"Failed to upload file (skipping): {file_path.name}")
                    warn(f"        Error: {e}")
        else:
            step(3, 4, "No file sources — skipping.")

        # ── Step 4: Wait for all sources to finish indexing ───────────────────
        step(4, 4, "Waiting for sources to finish indexing...")

        if added_source_ids:
            info(f"{len(added_source_ids)} source(s) queued for indexing...")
            try:
                ready_sources = await client.sources.wait_for_sources(
                    notebook_id,
                    added_source_ids,
                    timeout=300,
                )
                ok(f"All {len(ready_sources)} source(s) indexed and ready.")
            except TimeoutError:
                warn("Some sources took too long to index (>5 min).")
                warn("They may still finish in the background.")
                warn("Check NotebookLM before running build-artifacts.py.")
        else:
            info("No sources were added — nothing to wait for.")

        # ── Done ──────────────────────────────────────────────────────────────
        log("")
        log(hr("═"))
        log("  Provisioning complete.")
        log(hr("─"))
        log(f"  Notebook ID : {notebook_id}")
        log(f"  Sources     : {len(added_source_ids)} indexed")
        log(hr("─"))
        log("  Run next:")
        log("")
        log(f"    python scripts/build-artifacts.py \\")
        log(f"        --notebook {notebook_id} \\")
        log(f"        --slug {slug}")
        log("")
        log(hr("═"))
        log("")

        return notebook_id


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="CPR Notebook Provisioner — creates a NotebookLM notebook and adds sources",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
examples:
  # Minimal (empty notebook)
  python scripts/provision-notebook.py \\
      --slug colin-james-bradley \\
      --name "Colin James Bradley"

  # With URLs and files
  python scripts/provision-notebook.py \\
      --slug colin-james-bradley \\
      --name "Colin James Bradley" \\
      --source-url "https://example.com/article" \\
      --source-file "evidence/affidavit.pdf"
        """,
    )
    parser.add_argument(
        "--slug", required=True, metavar="SLUG",
        help="Defendant URL slug matching the defendants table (e.g. colin-james-bradley)",
    )
    parser.add_argument(
        "--name", required=True, metavar="NAME",
        help="Defendant full name (used as notebook title)",
    )
    parser.add_argument(
        "--source-url", action="append", default=[], metavar="URL",
        dest="source_urls",
        help="URL to add as a source (can be specified multiple times)",
    )
    parser.add_argument(
        "--source-file", action="append", default=[], metavar="PATH",
        dest="source_files",
        help="Local file path to upload as a source (can be specified multiple times)",
    )
    parser.add_argument(
        "--root", default=None, metavar="PATH",
        help="CPR project root directory (auto-detected from CLAUDE.md if omitted)",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve() if args.root else find_project_root()

    if not (root / "CLAUDE.md").exists():
        print(f"WARNING: CLAUDE.md not found at {root}", file=sys.stderr)
        print("         Pass --root explicitly if paths look wrong.", file=sys.stderr)

    source_files = [Path(f).resolve() for f in args.source_files]

    asyncio.run(provision(
        slug=args.slug,
        defendant_name=args.name,
        source_urls=args.source_urls,
        source_files=source_files,
        root=root,
    ))


if __name__ == "__main__":
    main()
