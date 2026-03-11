#!/bin/bash
cd /Users/rhp/Projects/agent-console
codex --dangerously-bypass-approvals-and-sandbox "$(cat docs/hardening-loop/PROMPT.md)"
