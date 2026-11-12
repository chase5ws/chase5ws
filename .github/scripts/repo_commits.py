"""Refresh the commit tags in the README project lists.

Every list line between <!-- repos:start --> and <!-- repos:end --> that links to
github.com/chase5ws/<repo> gets a trailing tag after a <!--c--> marker:

    · Public · `abc1234` · 2026-11-12 11:07

Each list is sorted newest commit first. The hash links to the commit for public repos. Private repos show the hash as plain
text, since visitors would only get a 404. Time is Taipei (UTC+8).

GH_TOKEN (a token that can read the private repos) is optional. Without it, public
repos are refreshed and private ones keep their current tag.
"""

import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

OWNER = "chase5ws"
README = sys.argv[1] if len(sys.argv) > 1 else "README.md"
TOKEN = os.environ.get("GH_TOKEN", "")
TPE = timezone(timedelta(hours=8))
MARK = " <!--c-->"


def api(path):
    req = urllib.request.Request(f"https://api.github.com{path}", headers={"Accept": "application/vnd.github+json", "User-Agent": "profile-readme-commits"})
    if TOKEN:
        req.add_header("Authorization", f"Bearer {TOKEN}")
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        print(f"::warning::{path}: HTTP {e.code} (private repo needs GH_TOKEN with repo scope)")
        return None


def tag(repo):
    info = api(f"/repos/{OWNER}/{repo}")
    commits = api(f"/repos/{OWNER}/{repo}/commits?per_page=1")
    if not info or not commits:
        return None
    c = commits[0]
    sha = c["sha"][:7]
    when = datetime.fromisoformat(c["commit"]["committer"]["date"].replace("Z", "+00:00")).astimezone(TPE)
    if info["private"]:
        return f"· Private · `{sha}` · {when:%Y-%m-%d %H:%M}"
    return f"· Public · [`{sha}`]({c['html_url']}) · {when:%Y-%m-%d %H:%M}"


text = open(README, encoding="utf-8").read()
start, end = text.find("<!-- repos:start -->"), text.find("<!-- repos:end -->")
if start < 0 or end < start:
    sys.exit("repo markers not found")

lines = text[start:end].split("\n")
for i, line in enumerate(lines):
    m = re.match(rf"- .*?github\.com/{OWNER}/([\w.-]+)\)", line)
    if not m:
        continue
    base = line.split(MARK)[0]
    new = tag(m.group(1))
    if new:
        lines[i] = f"{base}{MARK} {new}"

# Newest commit first inside each list; lines without a tag (no repo) go last.
def when(line):
    m = re.search(r"· (\d{4}-\d{2}-\d{2} \d{2}:\d{2})$", line)
    return m.group(1) if m else ""

result, block = [], []
for line in lines + [""]:
    if line.startswith("- "):
        block.append(line)
        continue
    result += sorted(block, key=when, reverse=True)  # stable, so ties keep their order
    block = []
    result.append(line)
lines = result[:-1]

out = text[:start] + "\n".join(lines) + text[end:]
if out != text:
    open(README, "w", encoding="utf-8").write(out)
    print("README updated")
else:
    print("no change")
