#!/usr/bin/env python3
"""Download the official Tainan Tianhou 27 poem-card images for transcription.

The poem text on these pages is published only as an image. The first image is
the poem card; the second is the temple's modern explanation, which is not
transcribed here.

Images are written outside the repository because display rights are unconfirmed.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import time
from urllib.parse import urljoin
from urllib.request import Request, urlopen

USER_AGENT = (
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
    '(KHTML, like Gecko) Chrome/126.0 Safari/537.36'
)


def fetch_bytes(url: str) -> bytes:
    for attempt in range(3):
        try:
            request = Request(url, headers={'User-Agent': USER_AGENT, 'Accept-Language': 'zh-TW,zh;q=0.9'})
            with urlopen(request, timeout=30) as response:
                return response.read()
        except Exception:  # noqa: BLE001
            time.sleep(2.0 * (attempt + 1))
    raise RuntimeError(f'fetch failed: {url}')


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--register', required=True)
    parser.add_argument('--out-dir', required=True)
    args = parser.parse_args()

    with open(args.register, 'r', encoding='utf-8') as handle:
        register = json.load(handle)
    collection = next(
        item for item in register['collections'] if item['id'] == 'tainan_tianhou_yuelao_27'
    )

    image_dir = os.path.join(args.out_dir, 'tainan-images')
    os.makedirs(image_dir, exist_ok=True)

    manifest: list[dict] = []
    issues: list[str] = []
    for entry in collection['entries']:
        number = entry['number']
        page_url = entry['sourceUrl']
        html = fetch_bytes(page_url).decode('utf-8', errors='replace')
        block = re.search(
            r'<div class="col-md-12 my-3 py-4 text-center"[^>]*>(.*?)</div>',
            html,
            re.S,
        )
        if not block:
            issues.append(f'#{number}: content block not found')
            continue
        images = re.findall(r'<img[^>]+src="([^"]+)"', block.group(1))
        if not images:
            issues.append(f'#{number}: no images in content block')
            continue
        label_match = re.search(r'<strong>\s*(第[^<]*首)\s*<br\s*/?>\s*「([^」]*)」', block.group(1))
        if not label_match:
            label_match = re.search(r'(第[^<]*首)\s*<br\s*/?>\s*「([^」]*)」', block.group(1))
        label = label_match.group(1).strip() if label_match else ''
        pattern_text = label_match.group(2).strip() if label_match else ''

        poem_url = urljoin(page_url, images[0])
        explanation_url = urljoin(page_url, images[1]) if len(images) > 1 else None
        data = fetch_bytes(poem_url)
        ext = os.path.splitext(poem_url.rsplit('/', 1)[-1])[1] or '.jpg'
        filename = f'{number:02d}-poem{ext}'
        with open(os.path.join(image_dir, filename), 'wb') as handle:
            handle.write(data)
        manifest.append({
            'number': number,
            'officialLabel': label,
            'pagePatternText': pattern_text,
            'registerRitualPattern': entry.get('ritualPattern'),
            'pageUrl': page_url,
            'poemImageUrl': poem_url,
            'explanationImageUrl': explanation_url,
            'localFile': filename,
            'bytes': len(data),
            'sha256': hashlib.sha256(data).hexdigest(),
        })
        time.sleep(0.4)

    out_path = os.path.join(args.out_dir, 'tainan-images-manifest.json')
    with open(out_path, 'w', encoding='utf-8') as handle:
        json.dump(
            {
                'editionId': 'tainan-tianhou-yuelao-27',
                'sourceMode': 'official_image_pages',
                'rightsStatus': 'unconfirmed',
                'count': len(manifest),
                'images': manifest,
                'issues': issues,
            },
            handle,
            ensure_ascii=False,
            indent=2,
        )
        handle.write('\n')

    print(f'tainan images={len(manifest)}/{len(collection["entries"])} issues={len(issues)}')
    for issue in issues:
        print(f'  - {issue}')
    print(f'manifest={out_path}')
    return 0 if len(manifest) == len(collection['entries']) and not issues else 1


if __name__ == '__main__':
    raise SystemExit(main())
