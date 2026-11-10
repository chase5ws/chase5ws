# Changes made for ChaseOS

This folder is [Spipu-Doom](https://github.com/spipu/doom-js) by Laurent Minguet (MIT, see `LICENSE.md`;
`assets/uzdoom/` is GPL-3.0, see its own `LICENSE.md`). Changes:

- Root-absolute paths (`/js/…`, `/assets/…`, `/lib/…`, `/icon/…`) made relative, so it runs from `/chase5ws/games/doom/`.
- `js/doom/menu/wadListScreen.js`: `?wad=<url>` adds that WAD once when none is stored yet.
- `wad/freedoom1.wad` is Freedoom Phase 1 v0.13.0 (BSD-3-Clause, see `wad/COPYING.txt`), loaded through `?wad=wad/freedoom1.wad`.
