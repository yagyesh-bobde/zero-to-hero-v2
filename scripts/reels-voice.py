#!/usr/bin/env python3
"""Render reel narration with Kokoro-82M (local TTS).

Normally run through `npm run reels:voice [-- <reelId>] [--force]`, which first
extracts .reels-cache/narration.json and then runs this script under `uv`.

Direct use:
    uv run --python 3.12 --with kokoro --with soundfile scripts/reels-voice.py \
        [reelId] [--force] [--voice af_heart] [--speed 1.1]

For every reel in the narration file it writes, into public/react-native-reels/audio/:
    <id>.m4a    mono AAC, loudness-normalised, beats joined with short gaps
    <id>.json   {beats: [{start, end, words?}], duration, hash, file}
and finally index.json mapping reel id -> manifest. A reel is skipped when its
manifest hash (voice, speed, gaps, model, all `speak`/`say` text) is unchanged.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf

# --- Settings -----------------------------------------------------------------
VOICE = "af_heart"
SPEED = 1.1
MODEL_ID = "hexgrad/Kokoro-82M"
LANG_CODE = "a"  # American English
SAMPLE_RATE = 24_000  # Kokoro's native rate
LEAD_IN = 0.15  # seconds of silence before the first beat
BEAT_GAP = 0.4  # seconds between beats
TAIL = 0.4  # seconds of silence after the last beat
SILENCE_THRESHOLD = 0.004  # trim near-silence around each beat
SILENCE_PAD = 0.02  # ...but keep this much
BITRATE = "64k"
LOUDNORM = "loudnorm=I=-16:TP=-1.5:LRA=11"
DURATION_TOLERANCE = 0.1  # max allowed |ffprobe - computed| seconds (AAC adds tail frame padding)
# ------------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
Manifest = dict[str, Any]
Beat = dict[str, str]


def compute_hash(beats: list[Beat], voice: str, speed: float) -> str:
    payload = {
        "voice": voice,
        "speed": speed,
        "gaps": [LEAD_IN, BEAT_GAP, TAIL],
        "model": MODEL_ID,
        "beats": [[b["speak"], b["say"]] for b in beats],
    }
    blob = json.dumps(payload, sort_keys=True, ensure_ascii=False).encode()
    return hashlib.sha256(blob).hexdigest()[:16]


def group_words(tokens: list[Any]) -> list[tuple[float, float]] | None:
    """Group Kokoro tokens into whitespace-separated words -> (start, end) seconds."""
    words: list[tuple[float, float]] = []
    start: float | None = None
    end: float | None = None
    open_word = False
    for tok in tokens:
        open_word = True
        if tok.start_ts is not None and tok.end_ts is not None:
            start = tok.start_ts if start is None else start
            end = tok.end_ts
        if tok.whitespace:
            if start is None or end is None:
                return None
            words.append((start, end))
            start = end = None
            open_word = False
    if open_word:
        if start is None or end is None:
            return None
        words.append((start, end))
    return words


def _norm(word: str) -> str:
    return "".join(c for c in word.lower() if c.isalnum())


def map_to_say(
    say_words: list[str], speak_words: list[str], times: list[tuple[float, float]]
) -> list[tuple[float, float]] | None:
    """Map spoken-word times onto caption words, merging split words ("set state" -> "setState")."""
    if len(times) != len(speak_words):
        return None
    if len(speak_words) == len(say_words):
        return times
    mapped: list[tuple[float, float]] = []
    i = 0
    for word in say_words:
        target, acc, first = _norm(word), "", i
        while i < len(speak_words) and len(acc) < len(target):
            acc += _norm(speak_words[i])
            i += 1
        if not target or acc != target:
            return None
        mapped.append((times[first][0], times[i - 1][1]))
    return mapped if i == len(speak_words) else None


def trim_silence(audio: np.ndarray) -> tuple[np.ndarray, int]:
    """Trim near-silence from both ends. Returns (audio, samples trimmed from the front)."""
    loud = np.flatnonzero(np.abs(audio) > SILENCE_THRESHOLD)
    if loud.size == 0:
        return audio, 0
    pad = int(SILENCE_PAD * SAMPLE_RATE)
    lo = max(int(loud[0]) - pad, 0)
    hi = min(int(loud[-1]) + pad + 1, len(audio))
    return audio[lo:hi], lo


def render_beat(
    pipeline: Any, beat: Beat, voice: str, speed: float
) -> tuple[np.ndarray, list[tuple[float, float]] | None]:
    """Render one beat. Returns trimmed audio and per-caption-word times relative to it."""
    chunks: list[np.ndarray] = []
    word_times: list[tuple[float, float]] = []
    aligned = True
    offset = 0.0
    for result in pipeline(beat["speak"], voice=voice, speed=speed):
        if result.audio is None:
            continue
        audio = result.audio.detach().cpu().numpy().astype(np.float32)
        words = group_words(result.tokens) if result.tokens else None
        if words is None:
            aligned = False
        else:
            word_times += [(s + offset, e + offset) for s, e in words]
        chunks.append(audio)
        offset += len(audio) / SAMPLE_RATE
    if not chunks:
        raise RuntimeError(f"Kokoro produced no audio for: {beat['speak']!r}")

    audio, lead = trim_silence(np.concatenate(chunks))
    mapped = map_to_say(beat["say"].split(), beat["speak"].split(), word_times) if aligned else None
    if mapped is None:
        return audio, None  # `speak` rewrote words in a way we can't align: omit words
    shift = lead / SAMPLE_RATE
    length = len(audio) / SAMPLE_RATE
    return audio, [(min(max(s - shift, 0.0), length), min(max(e - shift, 0.0), length)) for s, e in mapped]


def encode_m4a(audio: np.ndarray, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "in.wav"
        sf.write(wav, audio, SAMPLE_RATE)
        subprocess.run(
            [
                "ffmpeg", "-nostdin", "-y", "-loglevel", "error", "-i", str(wav),
                "-af", LOUDNORM, "-ar", str(SAMPLE_RATE), "-ac", "1",
                "-c:a", "aac", "-b:a", BITRATE, "-movflags", "+faststart", str(out),
            ],
            check=True,
        )


def probe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        check=True, capture_output=True, text=True,
    )
    return float(out.stdout.strip())


def render_reel(pipeline: Any, reel: dict[str, Any], voice: str, speed: float, out_dir: Path, hash_: str) -> Manifest:
    pos = LEAD_IN
    segments: list[np.ndarray] = [np.zeros(int(LEAD_IN * SAMPLE_RATE), dtype=np.float32)]
    beats_out: list[dict[str, Any]] = []
    for i, beat in enumerate(reel["beats"]):
        audio, words = render_beat(pipeline, beat, voice, speed)
        length = len(audio) / SAMPLE_RATE
        entry: dict[str, Any] = {"start": round(pos, 3), "end": round(pos + length, 3)}
        if words is not None:
            entry["words"] = [[round(pos + s, 3), round(pos + e, 3)] for s, e in words]
        beats_out.append(entry)
        segments.append(audio)
        pos += length
        if i < len(reel["beats"]) - 1:
            segments.append(np.zeros(int(BEAT_GAP * SAMPLE_RATE), dtype=np.float32))
            pos += BEAT_GAP
    segments.append(np.zeros(int(TAIL * SAMPLE_RATE), dtype=np.float32))
    duration = pos + TAIL

    file_name = f"{reel['id']}.m4a"
    encode_m4a(np.concatenate(segments), out_dir / file_name)
    probed = probe_duration(out_dir / file_name)
    if abs(probed - duration) > DURATION_TOLERANCE:
        print(f"  warning: {reel['id']} ffprobe {probed:.3f}s vs computed {duration:.3f}s", file=sys.stderr)
    manifest: Manifest = {"beats": beats_out, "duration": round(duration, 3), "hash": hash_, "file": file_name}
    (out_dir / f"{reel['id']}.json").write_text(json.dumps(manifest, separators=(",", ":")) + "\n")
    return manifest


def load_manifest(out_dir: Path, reel_id: str) -> Manifest | None:
    path = out_dir / f"{reel_id}.json"
    if not path.exists():
        return None
    try:
        manifest: Manifest = json.loads(path.read_text())
    except json.JSONDecodeError:
        return None
    return manifest if (out_dir / str(manifest.get("file", ""))).exists() else None


def main() -> int:
    parser = argparse.ArgumentParser(description="Render reel narration with Kokoro.")
    parser.add_argument("reel", nargs="?", help="only process this reel id")
    parser.add_argument("--force", action="store_true", help="re-render even if unchanged")
    parser.add_argument("--voice", default=VOICE)
    parser.add_argument("--speed", type=float, default=SPEED)
    parser.add_argument("--narration", type=Path, default=ROOT / ".reels-cache/narration.json")
    parser.add_argument("--out-dir", type=Path, default=ROOT / "public/react-native-reels/audio")
    args = parser.parse_args()

    reels: list[dict[str, Any]] = json.loads(args.narration.read_text())["reels"]
    if args.reel and args.reel not in {r["id"] for r in reels}:
        print(f"unknown reel id: {args.reel}", file=sys.stderr)
        return 1
    out_dir: Path = args.out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    pipeline: Any = None  # created lazily: skipped runs never import torch
    index: dict[str, Manifest] = {}
    for reel in reels:
        reel_id: str = reel["id"]
        existing = load_manifest(out_dir, reel_id)
        if args.reel and reel_id != args.reel:
            if existing:
                index[reel_id] = existing
            continue
        hash_ = compute_hash(reel["beats"], args.voice, args.speed)
        if existing and existing.get("hash") == hash_ and not args.force:
            index[reel_id] = existing
            print(f"{reel_id:32} {existing['duration']:6.1f}s  skipped (unchanged)")
            continue
        if pipeline is None:
            from kokoro import KPipeline  # heavy import

            pipeline = KPipeline(lang_code=LANG_CODE, repo_id=MODEL_ID)
        manifest = render_reel(pipeline, reel, args.voice, args.speed, out_dir, hash_)
        index[reel_id] = manifest
        aligned = sum("words" in b for b in manifest["beats"])
        print(f"{reel_id:32} {manifest['duration']:6.1f}s  rendered ({len(manifest['beats'])} beats, words {aligned}/{len(manifest['beats'])})")

    (out_dir / "index.json").write_text(json.dumps(index, separators=(",", ":")) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
