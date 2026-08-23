/**
 * Canonical stream-entity IDs.
 *
 * The backend mints ids like `msg-<runFrag>-<hash>-<n>` / `step-<runFrag>-<hash>-<n>` /
 * `toolresult-<runFrag>-<hash>-<n>`, where `<n>` is a per-endpoint running counter:
 * the invoke stream (POST /v1/agent/{id}/invoke) numbers events relative to that single
 * request, while the session replay stream (GET /v1/session/{id}/stream) numbers the same
 * logical event relative to the whole session's history. The same message therefore shows
 * up as e.g. `msg-ba21e90d-d1099cf6-1` on the invoke stream and `msg-ba21e90d-d1099cf6-3`
 * on a replay — identical content, unstable id.
 *
 * Every other id shape observed on the wire (runId/threadId, toolCallId, and client-minted
 * ids like `temp-user-<epoch>` or `error-<epoch>`) is already stable across both streams, so
 * this only strips the trailing counter when the segment before it is itself an 8-hex-char
 * hash — the signature of a backend-generated id — leaving everything else untouched.
 */
const TRAILING_COUNTER = /^(.+-[0-9a-f]{8})-\d+$/

export function canonicalStreamId(id: string): string
export function canonicalStreamId(id: string | undefined): string | undefined
export function canonicalStreamId(id?: string): string | undefined {
  if (!id) return id
  const match = id.match(TRAILING_COUNTER)
  return match ? match[1] : id
}
