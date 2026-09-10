'use client'

import React, { useLayoutEffect, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

export interface VirtualTimelineListProps {
  itemCount: number
  renderItem: (index: number) => React.ReactNode
  /** Stable identity per item (e.g. the timeline entry's own id) — required by
   * `anchorTo: 'end'` to track which rendered item is which across re-renders. */
  getItemKey: (index: number) => string
  /** Domain-informed size guess per item, used only until an item is actually
   * measured. See the note on `scrollToEnd()` below for why this matters here. */
  estimateSize: (index: number) => number
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
}

/**
 * Virtualized chat timeline, pinned to the bottom as items are appended — built on
 * @tanstack/react-virtual's own chat-list support (`anchorTo`/`followOnAppend`/
 * `scrollToEnd`), matching its reference chat example:
 * https://github.com/TanStack/virtual/blob/main/examples/react/chat/src/main.tsx
 *
 * `directDomUpdates: true` matches the reference example exactly — item positions and the
 * container size are written straight to the DOM instead of through React re-renders.
 *
 * This component has been through two failed extremes on how to keep a row's cached size in
 * sync with its actual DOM height, and the current shape is what's left once both were proven
 * wrong empirically (not just reasoned about) against a live page:
 *
 * (1) No manual remeasurement at all, trusting the library's own ResizeObserver exclusively.
 * Reading virtual-core's source suggested this should be sufficient — its ResizeObserver
 * callback always calls `measureElement` *with* a real entry, reading `entry.borderBoxSize`
 * directly, no caching shortcut involved. In practice it is NOT sufficient: on a page load that
 * replays a large session's history, a row's content (e.g. a tool card's Parameters/Result
 * sections) can go from its barely-mounted size straight to its full, final size across several
 * store updates batched into the same commit — and the async ResizeObserver callback for that
 * growth reliably arrived too late or not at all before the page settled, permanently freezing
 * that row's cached size at its initial (much smaller) mount-time reading. Confirmed live: with
 * this component in that no-remeasure state, `itemSizeCache` for a Spawn Agent card sat frozen
 * at 118px (its header-only size at first mount) while its real `offsetHeight` was 652px, and
 * every item positioned after it inherited that 534px error, overlapping visibly and permanently.
 * Manually re-invoking `measureElement` on the exact same cached elements immediately corrected
 * every row's position with zero further changes needed — proving the reposition machinery
 * itself is correct and the ONLY thing missing is ever calling it again after mount.
 *
 * (2) Unconditional remeasurement of every cached row on every render (no dependency array).
 * This does fix (1), but overcorrects into a different, worse bug: during genuine live token
 * streaming, it re-invokes `measureElement` for every visible row on every single re-render,
 * including rows whose size did not change. Read-only calls are harmless on their own (a no-op
 * `resizeItem` early-returns on zero delta), but the *timing* of the redundant calls that DO see
 * a delta matters: `resizeItem`'s "stay pinned to the bottom while a message grows" compensation
 * independently re-decides "was I at the end?" via `scrollEndThreshold` (80px) on every call, and
 * an extra call sequenced at the wrong moment among many rapid, real ones can nudge that distance
 * just past the threshold and permanently drop the pin — the timeline silently stops following
 * new content, leaving a scrollable gap of blank space below the last card actually shown, with
 * no error or log. Confirmed live on an actively streaming session after this change.
 *
 * The fix that avoids both: give every newly-mounted row a BOUNDED settle check — repeated
 * `measureElement` calls — and then leave it alone for the rest of its life, relying on the
 * library's own ResizeObserver for any further, genuinely-live growth. Bounded and
 * one-shot-per-row means it cannot degrade into the every-render storm that broke (2), while
 * still catching what (1) missed.
 *
 * That settle check went through two more revisions past the first version, each caught by
 * reproducing a specific failure live rather than by further reasoning about the library source:
 *
 * (3a) Originally bounded to a fixed 3 `requestAnimationFrame` ticks. A fixed frame count assumes
 * a row's content finishes growing within a small, fixed wall-clock window after mount, which
 * does not hold under load: scrolling aggressively immediately after opening a session
 * (competing with the initial replay burst for main-thread time while many rows'
 * TOOL_CALL_ARGS/RESULT events are still being processed into the store) left several rows stuck
 * mid-growth, because the 3rd and final tick landed before that row's content had actually
 * finished changing.
 *
 * (3b) Changed to terminate on observed *stability* (size unchanged across 2 consecutive
 * `requestAnimationFrame` ticks) instead of a fixed count — reasoned as strictly better, but
 * empirically was not: reproducing the same aggressive-scroll-during-replay scenario again showed
 * rows *still* stuck, now because two consecutive rAF ticks can both land before a row's data has
 * even started arriving, reading the same small size twice in a row and declaring it "stable"
 * purely because nothing had happened *yet* — a false positive stability can't distinguish from
 * true stability using DOM state alone. Tracing this further turned up the actual mechanism:
 * `document.visibilityState` was `'hidden'` during the reproduction (an artifact of how this was
 * driven, but a state real users legitimately hit too — a session opened in a background tab).
 * Confirmed directly: a fresh `ResizeObserver` attached to one of the stuck rows received *zero*
 * callbacks even for a deliberately forced, genuine resize. Browsers suspend or heavily throttle
 * both `requestAnimationFrame` and `ResizeObserver` callback delivery while a tab is hidden — so
 * every rAF-driven tick in this settle check can stop firing entirely, and the library's own
 * ResizeObserver (the fallback for anything the settle check misses) can too, at the same time.
 *
 * (3c, current) Rebuilt on `setTimeout` instead of `requestAnimationFrame` — timers still fire
 * (if clamped) in a hidden tab, where rAF can stop entirely — and spaced 150ms apart rather than
 * one per frame, so "2 consecutive stable reads" means 300ms of real, held-steady wall-clock time
 * instead of ~32ms, giving async store updates a real window to land before the row is declared
 * done. The frame cap becomes a check cap (20 checks ≈ 3s of real time in the common case) —
 * still just a backstop against a row that pathologically never settles, not the primary
 * termination condition.
 *
 * Separately, `getItemKey`/`estimateSize` must stay referentially stable across renders — they
 * were fresh inline closures on every render of the page component, and virtual-core's internal
 * `getMeasurementOptions` memo keys off those two by reference, resetting its own tracked
 * "earliest index needing recomputation" on every render — discarding an in-flight resize's
 * correction before it reached a later item's position. Fixed at the source in app/chat/page.tsx
 * (`useCallback`, matching this library's own reference example's discipline).
 */
export function VirtualTimelineList(props: VirtualTimelineListProps) {
  const { scrollContainerRef } = props
  const [isReady, setIsReady] = useState(false)

  // Three problems, one fix. (1) scrollContainerRef is attached to a DOM node owned by an
  // *ancestor* (ChatInterface). React's commit phase runs layout effects/ref-attaches in
  // tree order with descendants settling before their ancestor's own work completes, so if
  // this component's very first mount lands in the same commit as that ancestor node's own
  // first mount (e.g. deep-linking straight into a session whose history is already loaded
  // by first paint), this effect can run before the ref is attached — with nothing to ever
  // retrigger it, since scrollContainerRef's identity never changes. (2) Even once the ref
  // is there, the container can still measure 0 height for a tick or two (layout not yet
  // settled — e.g. mid page-transition). @tanstack/react-virtual's calculateRange memoizes
  // `range = null` the moment it sees outerSize === 0, and nothing ever invalidates that
  // memo afterward if the container's size is the only thing that changes going forward —
  // getVirtualItems() then permanently returns nothing even once the container is correctly
  // sized moments later. (3) setTimeout rather than requestAnimationFrame for every wait
  // here: rAF is suspended entirely while the document is hidden (e.g. the tab is
  // backgrounded during load), which would strand isReady at false indefinitely.
  useLayoutEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    const waitForContainer = () => {
      if (cancelled) return
      if (!scrollContainerRef.current || scrollContainerRef.current.clientHeight === 0) {
        timer = setTimeout(waitForContainer, 0)
        return
      }
      timer = setTimeout(() => {
        timer = setTimeout(() => setIsReady(true), 0)
      }, 0)
    }

    waitForContainer()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [scrollContainerRef])

  if (!isReady) {
    return null
  }

  return <VirtualizedItems {...props} />
}

function VirtualizedItems({
  itemCount,
  renderItem,
  getItemKey,
  estimateSize,
  scrollContainerRef,
}: VirtualTimelineListProps) {
  const [didInitialScroll, setDidInitialScroll] = useState(false)

  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize,
    getItemKey,
    anchorTo: 'end',
    followOnAppend: true,
    scrollEndThreshold: 80,
    overscan: 6,
    directDomUpdates: true,
    // The default (true) can call React's flushSync from inside a ResizeObserver
    // callback that fires during this component's own StrictMode-safe mount layout
    // effect, which throws "flushSync was called from inside a lifecycle method."
    useFlushSync: false,
    // A plain, always-fresh offsetHeight read (no caching shortcut) — needed both for the
    // initial `ref={virtualizer.measureElement}` mount call below (fires without a
    // ResizeObserverEntry) and for the settle-check effect's own calls below it.
    measureElement: (element) => (element as HTMLElement).offsetHeight,
  })

  useLayoutEffect(() => {
    if (didInitialScroll) return
    virtualizer.scrollToEnd()
    setDidInitialScroll(true)
  }, [didInitialScroll, virtualizer])

  // A large session's historical replay can still be arriving well after this initial
  // scrollToEnd() fires — itemCount at that moment reflects only however many events had
  // landed so far, not the eventual total, and rows measured at that point can still grow
  // afterward (see the settle-check below). The library's own `followOnAppend` is supposed to
  // keep pace with each append and resize, but it independently re-decides "was the user at
  // the end?" via the same scrollEndThreshold on every one of those — a single missed
  // decision anywhere in that chain permanently ends the auto-follow, landing short of the
  // true bottom with no further correction. Confirmed live: a session's rows all correctly
  // measured and positioned with zero overlap, but the scroll position stuck 8317px short of
  // the true bottom, reading as "the stream stopped rendering" even though the store and DOM
  // both had every event. This re-affirms scrollToEnd() ourselves — both when a new item
  // appears (below) and when the settle-check detects a row actually grow (further below) —
  // independent of the library's own per-append/per-resize heuristic, as long as the user
  // hasn't deliberately scrolled away. A direct application-level guarantee rather than
  // trusting a heuristic proven fragile under a large, still-streaming replay.
  const stickToBottomRef = useRef(true)

  useLayoutEffect(() => {
    const scrollEl = scrollContainerRef.current
    if (!scrollEl) return
    const onScroll = () => {
      stickToBottomRef.current = virtualizer.isAtEnd(200)
    }
    scrollEl.addEventListener('scroll', onScroll, { passive: true })
    return () => scrollEl.removeEventListener('scroll', onScroll)
  }, [scrollContainerRef, virtualizer])

  useLayoutEffect(() => {
    if (!didInitialScroll) return
    if (stickToBottomRef.current) {
      virtualizer.scrollToEnd()
    }
  }, [itemCount, didInitialScroll, virtualizer])

  // Tracks which cached elements have already had their bounded post-mount settle-check
  // scheduled, so each row gets it exactly once for its whole lifetime — see the class-doc
  // comment above for why this exists (catches batched replay growth the ResizeObserver
  // misses — including while the tab is hidden, when the ResizeObserver itself can stop
  // delivering callbacks) and why it's bounded (an unconditional per-render version broke
  // follow-to-bottom during live streaming).
  const settleScheduledRef = useRef(new WeakSet<HTMLElement>())

  useLayoutEffect(() => {
    for (const element of virtualizer.elementsCache.values()) {
      const el = element as HTMLElement
      if (settleScheduledRef.current.has(el)) continue
      settleScheduledRef.current.add(el)
      let lastSize = el.offsetHeight
      let stableChecks = 0
      let totalChecks = 0
      // setTimeout, not requestAnimationFrame: rAF can stop firing entirely while the tab is
      // hidden, which is exactly when this settle check matters most (a session opened in a
      // background tab still needs to end up correctly laid out once viewed). 150ms between
      // checks — not one per frame — so "stable" means content held steady for 300ms of real
      // time, giving an async store update a real window to land before this gives up and
      // moves on (see class-doc comment for the false-positive this replaces).
      const tick = () => {
        if (!el.isConnected) return
        virtualizer.measureElement(el)
        const size = el.offsetHeight
        totalChecks++
        if (size === lastSize) {
          stableChecks++
        } else {
          stableChecks = 0
          lastSize = size
          // This row just grew *after* the last scrollToEnd() call (initial mount, or the
          // itemCount-driven reinforcement below) had already fixed the scroll position —
          // exactly the gap-below-the-visible-content case from the class-doc comment above,
          // caught here because this is where growth is actually detected, independent of
          // whether itemCount changed at the same time.
          if (stickToBottomRef.current) virtualizer.scrollToEnd()
        }
        if (stableChecks >= 2 || totalChecks >= 20) return
        setTimeout(tick, 150)
      }
      setTimeout(tick, 150)
    }
  })

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div ref={virtualizer.containerRef} style={{ position: 'relative', width: '100%' }}>
      {virtualItems.map((virtualItem) => (
        <div
          key={virtualItem.key}
          data-index={virtualItem.index}
          ref={virtualizer.measureElement}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
          }}
        >
          {renderItem(virtualItem.index)}
        </div>
      ))}
    </div>
  )
}
