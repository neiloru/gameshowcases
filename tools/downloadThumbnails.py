import argparse
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import urlparse, parse_qs


def sanitize_filename(name: str) -> str:
    """Convert to lowercase, replace spaces with dashes, remove invalid chars."""
    name = name.lower().strip()
    name = re.sub(r"\s+", "-", name)
    name = re.sub(r"[^a-z0-9\-]", "", name)
    return name


def get_youtube_video_id(url: str) -> str | None:
    """Extract YouTube video ID from common URL formats."""
    parsed = urlparse(url)

    if parsed.hostname in ("youtu.be", "www.youtu.be"):
        return parsed.path.lstrip("/")

    if parsed.hostname and "youtube.com" in parsed.hostname:
        return parse_qs(parsed.query).get("v", [None])[0]

    return None


def download_thumbnail(video_id: str, output_path: Path):
    thumbnail_url = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            thumbnail_url,
            str(output_path),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def main():
    parser = argparse.ArgumentParser(
        description="Download YouTube thumbnails from a games JSON file."
    )

    parser.add_argument(
        "json_file",
        help="Path to the JSON file containing game data",
    )

    parser.add_argument(
        "output_dir",
        help="Directory where thumbnails will be saved",
    )

    args = parser.parse_args()

    json_file = Path(args.json_file)
    output_dir = Path(args.output_dir)

    output_dir.mkdir(parents=True, exist_ok=True)

    with json_file.open("r", encoding="utf-8") as f:
        games = json.load(f)

    for game in games:
        name = game.get("name", "")
        trailer_url = game.get("trailer", "")

        video_id = get_youtube_video_id(trailer_url)

        if not video_id:
            print(f"Skipping '{name}': invalid YouTube URL")
            continue

        output_path = output_dir / f"{sanitize_filename(name)}.png"

        try:
            download_thumbnail(video_id, output_path)
            print(f"✓ {name} -> {output_path}")
        except subprocess.CalledProcessError:
            print(f"✗ Failed to download thumbnail for '{name}'")


if __name__ == "__main__":
    main()