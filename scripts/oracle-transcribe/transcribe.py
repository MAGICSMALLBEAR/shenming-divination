#!/usr/bin/env python3
"""Fetch and transcribe official oracle poem pages into a local JSON file.

The output is intentionally written outside the repository by default. The
temple text is not licensed for app display yet; committing it to a public
repository would publish it. Only counts, checksums and source URLs should be
committed until the rights holder grants permission.

Usage:
  python -I scripts/oracle-transcribe/transcribe.py \
    --edition zizhu \
    --register src/data/poems/oracleCandidateEntryRegister.json \
    --out-dir /path/outside/repo \
    --cache-dir /path/outside/repo/cache
"""
from __future__ import annotations

import argparse
import hashlib
import html as html_lib
import json
import os
import re
import sys
import time
from datetime import date, datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

REGISTER_COLLECTION = {
    'zizhu': 'zizhu_guanyin_28',
    'wenwu': 'wenwu_yuelao_40',
    'cifeng': 'cifeng_mazu_100',
    'tainan': 'tainan_tianhou_yuelao_27',
}

EDITION_ID = {
    'zizhu': 'zizhu-guanyin-28',
    'wenwu': 'wenwu-yuelao-40',
    'cifeng': 'cifeng-mazu-100',
    'tainan': 'tainan-tianhou-yuelao-27',
}

USER_AGENT = (
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
    '(KHTML, like Gecko) Chrome/126.0 Safari/537.36'
)


def fetch(url: str, cache_dir: str) -> str:
    key = hashlib.sha256(url.encode('utf-8')).hexdigest()[:20]
    path = os.path.join(cache_dir, key + '.html')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8', errors='replace') as handle:
            return handle.read()
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            request = Request(url, headers={'User-Agent': USER_AGENT, 'Accept-Language': 'zh-TW,zh;q=0.9'})
            with urlopen(request, timeout=30) as response:
                body = response.read()
            text = body.decode('utf-8')
            with open(path, 'w', encoding='utf-8') as handle:
                handle.write(text)
            return text
        except Exception as error:  # noqa: BLE001 - network stack raises many types
            last_error = error
            time.sleep(2.0 * (attempt + 1))
    raise RuntimeError(f'fetch failed: {url}: {last_error}')


def strip_tags(value: str) -> str:
    value = re.sub(r'<br\s*/?>', '\n', value, flags=re.I)
    value = re.sub(r'<[^>]+>', '', value)
    return html_lib.unescape(value).replace('　', ' ').strip()


def clean_line(value: str) -> str:
    value = strip_tags(value)
    value = re.sub(r'[\t\r\n]+', '', value)
    value = re.sub(r'\s+', ' ', value).strip()
    return value


def split_verse(value: str) -> list[str]:
    """Split a comma-separated verse into lines, keeping the original punctuation."""
    value = value.strip()
    if not value:
        return []
    parts = re.findall(r'[^，,。；;]+[，,。；;]?', value)
    return [part.strip() for part in parts if part.strip()]


def parse_zizhu(page: str) -> tuple[str, list[str]]:
    label_match = re.search(
        r'<p style="color:#630c13;font-size:24px;" class="mb-3">\s*(.*?)\s*</p>',
        page,
        re.S,
    )
    label = clean_line(label_match.group(1)) if label_match else ''
    poem_match = re.search(
        r'<p style="color:#000000;font-size:20px;" class="mb-3">(.*?)</p>',
        page,
        re.S,
    )
    if not poem_match:
        return label, []
    lines = [clean_line(part) for part in re.split(r'<br\s*/?>', poem_match.group(1), flags=re.I)]
    return label, [line for line in lines if line]


def parse_wenwu(page: str) -> tuple[str, list[str]]:
    title_match = re.search(r'<title>(.*?)</title>', page, re.S)
    label = clean_line(title_match.group(1)) if title_match else ''
    label = re.sub(r'\s*[-|｜].*$', '', label).strip()
    poem_match = re.search(
        r'<div class="ir-title">籤詩</div>\s*<div class="ir-ctr">(.*?)</div>',
        page,
        re.S,
    )
    if not poem_match:
        return label, []
    first_line = re.split(r'<br\s*/?>', poem_match.group(1), maxsplit=1, flags=re.I)[0]
    return label, split_verse(clean_line(first_line))


def parse_cifeng(page: str) -> tuple[str, list[str]]:
    label_match = re.search(r'fortune-main-title">(.*?)</h2>', page, re.S)
    label = clean_line(label_match.group(1)) if label_match else ''
    items = re.findall(r'fortune-verse-item">(.*?)</h3>', page, re.S)
    return label, [clean_line(item) for item in items if clean_line(item)]


def parse_tainan(page: str) -> tuple[str, list[str]]:
    # Tainan publishes the poem as an image. This parser only returns the label;
    # the poem text is transcribed separately from the official image.
    label_match = re.search(r'<title>(.*?)</title>', page, re.S)
    label = clean_line(label_match.group(1)) if label_match else ''
    label = re.sub(r'\s*[-|｜].*$', '', label).strip()
    return label, []


PARSERS = {
    'zizhu': parse_zizhu,
    'wenwu': parse_wenwu,
    'cifeng': parse_cifeng,
    'tainan': parse_tainan,
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--edition', required=True, choices=sorted(PARSERS))
    parser.add_argument('--register', required=True)
    parser.add_argument('--out-dir', required=True)
    parser.add_argument('--cache-dir', required=True)
    parser.add_argument('--limit', type=int, default=None)
    args = parser.parse_args()

    with open(args.register, 'r', encoding='utf-8') as handle:
        register = json.load(handle)
    collection = next(
        item for item in register['collections'] if item['id'] == REGISTER_COLLECTION[args.edition]
    )
    entries = collection['entries'][: args.limit] if args.limit else collection['entries']

    os.makedirs(args.cache_dir, exist_ok=True)
    os.makedirs(args.out_dir, exist_ok=True)

    results: list[dict] = []
    issues: list[str] = []
    seen: dict[str, int] = {}

    for entry in entries:
        number = entry['number']
        url = entry.get('sourceUrl')
        if not url:
            issues.append(f'#{number}: missing sourceUrl')
            continue
        try:
            page = fetch(url, args.cache_dir)
        except RuntimeError as error:
            issues.append(f'#{number}: {error}')
            continue
        label, lines = PARSERS[args.edition](page)
        content = '\n'.join(lines)
        normalized = re.sub(r'\s+', '', content)
        review_flags: list[str] = []
        if not lines:
            issues.append(f'#{number}: no poem text parsed ({url})')
        if '�' in content:
            review_flags.append('official_page_has_replacement_char')
        if lines and len(lines) != 4:
            review_flags.append(f'line_count_{len(lines)}')
        lengths = {len(re.sub(r'[，,。；;]', '', line)) for line in lines}
        if lines and lengths != {7}:
            review_flags.append('non_7_char_lines')
        if normalized and normalized in seen:
            issues.append(f'#{number}: duplicate text with #{seen[normalized]}')
        if normalized:
            seen[normalized] = number
        results.append({
            'number': number,
            'officialLabel': entry.get('officialLabel') or label,
            'sourceUrl': url,
            'fetchedAt': datetime.now(timezone.utc).isoformat(timespec='seconds'),
            'content': content,
            'lines': lines,
            'lineCount': len(lines),
            'charCount': len(normalized),
            'sha256': hashlib.sha256(normalized.encode('utf-8')).hexdigest(),
            'reviewFlags': review_flags,
            'verification': {
                'officialPageChecked': True,
                'secondSourceChecked': False,
                'note': 'Single official page; cross-source variant check still pending.',
            },
        })

    expected_numbers = [entry['number'] for entry in entries]
    actual_numbers = [item['number'] for item in results]
    if actual_numbers != expected_numbers:
        issues.append(f'number sequence mismatch: expected {expected_numbers}, got {actual_numbers}')

    output = {
        'schemaVersion': 1,
        'editionId': EDITION_ID[args.edition],
        'temple': collection.get('temple'),
        'collectedAt': date.today().isoformat(),
        'rightsStatus': 'unconfirmed',
        'sourceMode': 'official_detail_pages',
        'expectedCount': len(entries),
        'parsedCount': len(results),
        'entries': results,
        'issues': issues,
    }
    out_path = os.path.join(args.out_dir, f'{EDITION_ID[args.edition]}.json')
    with open(out_path, 'w', encoding='utf-8') as handle:
        json.dump(output, handle, ensure_ascii=False, indent=2)
        handle.write('\n')

    report_path = os.path.join(args.out_dir, f'{EDITION_ID[args.edition]}.report.txt')
    with open(report_path, 'w', encoding='utf-8') as handle:
        handle.write(f'edition: {EDITION_ID[args.edition]}\n')
        handle.write(f'expected: {len(entries)}\nparsed: {len(results)}\n')
        handle.write(f'issues: {len(issues)}\n')
        for issue in issues:
            handle.write(f'  - {issue}\n')
        for item in results:
            flags = f' flags={",".join(item["reviewFlags"])}' if item['reviewFlags'] else ''
            handle.write(
                f'  #{item["number"]} lines={item["lineCount"]} chars={item["charCount"]} '
                f'{item["sha256"][:12]}{flags} {item["content"].replace(chr(10), " / ")}\n'
            )

    print(f'edition={EDITION_ID[args.edition]} parsed={len(results)}/{len(entries)} issues={len(issues)}')
    print(f'output={out_path}')
    print(f'report={report_path}')
    return 0 if len(results) == len(entries) and not issues else 1


if __name__ == '__main__':
    sys.exit(main())
