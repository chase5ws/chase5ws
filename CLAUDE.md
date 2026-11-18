<!-- easy-mcp:start -->
## Shared AI memory (mcp-chase5ws)
- With the `mcp-chase5ws` MCP server (cloud: https://mcp.chase5ws.com): call `memory_context` with `project_dir: "chase5ws"` before working; log `PROMPT` → `WORK_START` → `FILES_*` → `WORK_END` with `memory_log` (same `project_dir`); record corrections with `lesson_add`; use `memory_search` for older history.
- Every update to this repo (each commit + push) also gets a `memory_log`: `FILES_*` for what changed and `WORK_END` with the commit hash, so the shared log stays current for every AI.
- Without it: tell the user the shared log was not updated (connect the `mcp-chase5ws` connector, or read https://mcp.chase5ws.com/s).
<!-- easy-mcp:end -->
