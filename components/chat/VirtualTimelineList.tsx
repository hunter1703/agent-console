'use client'

import React, { useLayoutEffect, useReducer, useRef, useState } from 'react'
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
 *
 * A fourth, more fundamental issue surfaced after all of the above: on some loads, scrolling
 * the container — including all the way to its true `scrollHeight` — kept rendering the exact
 * same handful of rows from near the start, no matter where the real scrollbar was. Traced this
 * to virtual-core's own `this.scrollElement` binding (the DOM node its internal scroll-offset
 * tracking listens to) ending up `null` — confirmed live by reaching into the virtualizer
 * instance directly: its public `scrollOffset` field read `0` while the real `scrollTop` was in
 * the thousands, and the computed `range` stayed frozen at `{startIndex: 0, endIndex: 2}` no
 * matter how far the container was actually scrolled. `this.scrollElement` is (re)bound inside
 * `_willUpdate()`, which the library's React wrapper calls from a layout effect with no
 * dependency array — so it runs, and can self-heal, on every render. The failure mode is a
 * render-timing race: if `_willUpdate()` happens to run at a moment `getScrollElement()`
 * transiently returns something falsy (plausible given `scrollContainerRef` is attached by an
 * *ancestor* — see the container-wait comment below), it locks in a `null` binding, and nothing
 * un-sticks it until the *next* render — which may not come for a long time once a session's
 * replay finishes and the store stops changing. Manually re-invoking the library's own private
 * `_willUpdate()` confirmed the rebind logic itself is correct (it fixes the binding
 * immediately) — the fix is to make sure a render actually happens again, not to call private
 * internals ourselves: both the scroll listener and the MutationObserver below directly compare
 * the library's own public `scrollElement` field against the real container, and force a
 * re-render on a mismatch — giving `_willUpdate()` another chance to rebind through its normal,
 * already-correct lifecycle. Two triggers because either alone leaves a gap: the scroll listener
 * only fires once the user scrolls (no help for a session that loads already stuck), and the
 * MutationObserver needs at least one DOM mutation after the binding breaks (no help for a
 * session that finishes loading with no further mutations) — between the two, either a scroll or
 * the page's own initial render activity is enough to catch and repair it.
 *
 * This health check compared `scrollOffset` against `scrollTop` at first, on the theory that a
 * broken binding would leave the tracked offset stale. Confirmed live on a user's own running
 * session that this has a blind spot: `scrollElement` read `null` while `scrollOffset` still
 * exactly matched the real `scrollTop` — a correct value left over from before the binding broke,
 * not proof the binding was still healthy. Comparing `scrollElement` itself directly against the
 * real container has no such gap: it's binary, not a heuristic about whether some derived value
 * looks plausible.
 *
 * A fifth issue was this fourth fix's own likely side effect: forcing extra renders to give
 * `_willUpdate()` more chances to rebind also gives the library's *own* internal `followOnAppend`
 * auto-scroll more chances to fire — and that logic lives inside `_willUpdate()` too, deciding
 * whether to scroll to end from its own `isAtEnd` snapshot taken whenever `count` last changed in
 * `setOptions()`, with no knowledge of anything that happened after, including a user scroll our
 * own tracking already knows about. `followOnAppend` is now `false` on the virtualizer options
 * below: our own stickToBottomRef-gated `scrollToEnd()` calls (on itemCount change,
 * settle-check-detected growth, and MutationObserver-detected growth) are a complete replacement
 * for it, so only one system decides when to auto-scroll.
 *
 * That alone did not fix the reported symptom (confirmed by the same user, same session,
 * immediately after): scroll up mid-generation, and within about a millisecond of the next event
 * the view still snapped back to the bottom. The sixth issue, and the actual cause: the scroll
 * listener below was computing "am I at the bottom" via `virtualizer.isAtEnd()`, which reads the
 * library's own internally-tracked `scrollOffset` — populated by a *separate* scroll listener the
 * library attaches to the same element via `observeElementOffset`. Two independent listeners on
 * one event have no specified firing order from the outside; if the library's own listener
 * happens to run after ours for a given event, `isAtEnd()` still reflects the *previous* scroll
 * position when we ask, one event behind. `stickToBottomRef` would then still read `true` from
 * before the user scrolled up, right when the next `scrollToEnd()` trigger fires — reproducing
 * exactly the "scrolls back down within a millisecond" symptom, with `followOnAppend` no longer
 * even in the picture. Fixed by computing distance-from-bottom directly from
 * `scrollHeight`/`clientHeight`/`scrollTop` on the element itself inside the handler — real DOM
 * state for this exact event, with no dependency on which listener the browser happens to run
 * first.
 *
 * Still not enough — confirmed by the same user, same reproduction, immediately after: scroll up
 * mid-generation, and the view still snapped back down almost immediately on the next event. Next
 * attempt (seventh issue): compute distance-from-bottom synchronously *during render*, before the
 * new item's DOM changes are committed, instead of trusting the scroll-event-driven
 * `stickToBottomRef` — reasoned as immune to any event-ordering race, since it reads real DOM
 * state mid-render with no dependency on any listener having fired yet. Also insufficient,
 * reported again immediately after — which is what exposed the actual, eighth and deepest issue:
 * this was never fundamentally a one-time ordering race to win by reading the right value at the
 * right instant. It's a *frequency* problem. During active generation, new timeline items can
 * arrive faster than a distance-based check can ever observe the user as "away from bottom" — if
 * our own `scrollToEnd()` fires again before the user's own scroll gesture has moved scrollTop
 * past whatever threshold counts as "left," the next check just sees them still close to the
 * bottom and forces them back, over and over, regardless of which API or which instant is used to
 * read the distance. No threshold-based read, however precisely timed, can win a race that's
 * really about which side acts more often.
 *
 * The fix: don't disengage based on where scrollTop ends up at all — disengage on the user's raw
 * input *intent*. A `wheel` or `touchmove` event fires as the browser receives the gesture,
 * before the resulting scroll even happens, let alone before any of our own `scrollToEnd()` calls
 * could react to it — so it cannot lose the frequency race: even if our own code wins the very
 * next check and scrolls back down anyway, the event already recorded that the user tried to
 * leave, and `stickToBottomRef` is already `false` by the time that next check runs. `keydown` for
 * the standard scroll-up keys covers keyboard navigation, which fires neither of those events.
 * Re-engagement keeps the simple distance-based scroll check — that direction has no race to lose,
 * since nothing requires the user to reach the bottom within any particular window.
 *
 * A ninth issue, reported immediately after the eighth fix landed: disengagement worked, but felt
 * "sticky" — a small scroll up barely moved before something pulled back, and only a large,
 * decisive scroll up actually got away. `app/globals.css` sets `scroll-behavior: smooth` on
 * `html` (not inherited to this component's own scrollable div, but every one of our
 * `scrollToEnd()` calls was passing no explicit `behavior`, defaulting to `'auto'` — which means
 * "follow whatever CSS says," not "jump instantly"). A `scrollToEnd()` call fired a moment before
 * the user started scrolling up can still be mid-animation when their gesture begins, actively
 * moving scrollTop back down for the rest of its duration regardless of new input — a small scroll
 * gets partly absorbed by it, a large one is needed to visibly overcome it. All `scrollToEnd()`
 * calls in this component now pass `{ behavior: 'instant' }` explicitly, which overrides any CSS
 * `scroll-behavior` entirely — every jump-to-bottom here is a discrete, one-frame snap by design
 * anyway (this pins to the bottom on every new token/tool-call during active generation; animating
 * each one would look far worse than a snap).
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
    // Deliberately false — see the class-doc comment's fifth issue. Our own
    // stickToBottomRef-gated scrollToEnd() calls below are a complete replacement for this,
    // and leaving both active meant two independent systems could decide to auto-scroll: the
    // library's own internal one runs from inside `_willUpdate()` using its own `isAtEnd`
    // snapshot from whenever `count` last changed, with no knowledge of a user scroll that
    // happened after that — including one that just disengaged our tracking on purpose.
    followOnAppend: false,
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
    virtualizer.scrollToEnd({ behavior: 'instant' })
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

  // Forces a re-render with no other effect, purely to give virtual-core's own `_willUpdate()`
  // (called from a layout effect with no dependency array, so it runs on every render) another
  // chance to rebind `scrollElement` — see the class-doc comment's fourth issue for why that
  // binding can otherwise stay stuck on a render-timing race, silently freezing the virtualizer's
  // internal scroll-offset tracking while the real DOM keeps scrolling.
  const [, forceRerender] = useReducer((n: number) => n + 1, 0)

  // Direct health check: is virtual-core's own `scrollElement` field the SAME node as the real
  // scroll container right now? This caught a case an offset-comparison proxy check missed —
  // `scrollElement` was confirmed `null` (live, via a user's own console) while `scrollOffset`
  // still happened to equal the real `scrollTop` (a stale-but-accurate leftover from before the
  // binding broke), so the offset-based check saw no problem despite the binding genuinely being
  // broken. Comparing the reference directly has no such blind spot.
  const checkScrollBinding = (scrollEl: HTMLDivElement) => {
    if (virtualizer.scrollElement !== scrollEl) {
      forceRerender()
    }
  }

  useLayoutEffect(() => {
    const scrollEl = scrollContainerRef.current
    if (!scrollEl) return

    // Disengage the instant the user shows ANY intent to scroll — not once scrollTop has
    // moved some distance, which is what the eighth issue (class-doc comment) is about: during
    // active generation, new content can re-trigger auto-scroll more often than the user's own
    // scroll gesture can move scrollTop far enough to read as "away from bottom" before the
    // next check undoes it. A `wheel`/`touchmove` event fires as the browser receives the
    // input — before the resulting scroll even happens, let alone before any of our own
    // scrollToEnd() calls could react — so it can't lose that race: even if our own code wins
    // the very next frame and scrolls back down, the event already told us the user tried to
    // leave. `keydown` for the standard scroll-up keys covers keyboard navigation, which fires
    // neither of those events.
    const disengage = () => {
      stickToBottomRef.current = false
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'Home') disengage()
    }

    // Re-engagement is the opposite: only once the user has scrolled back within a tight
    // distance of the true bottom themselves. This can safely stay a plain scroll-position
    // check (no race to lose) since nothing forces re-engagement to happen within any
    // particular window — the user either is back at the bottom or they aren't.
    const onScroll = () => {
      const distanceFromEnd = scrollEl.scrollHeight - scrollEl.clientHeight - scrollEl.scrollTop
      if (distanceFromEnd <= 40) {
        stickToBottomRef.current = true
      }
      checkScrollBinding(scrollEl)
    }

    scrollEl.addEventListener('wheel', disengage, { passive: true })
    scrollEl.addEventListener('touchmove', disengage, { passive: true })
    scrollEl.addEventListener('keydown', onKeyDown)
    scrollEl.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scrollEl.removeEventListener('wheel', disengage)
      scrollEl.removeEventListener('touchmove', disengage)
      scrollEl.removeEventListener('keydown', onKeyDown)
      scrollEl.removeEventListener('scroll', onScroll)
    }
  }, [scrollContainerRef, virtualizer])

  useLayoutEffect(() => {
    if (!didInitialScroll) return
    if (stickToBottomRef.current) {
      virtualizer.scrollToEnd({ behavior: 'instant' })
    }
  }, [itemCount, didInitialScroll, virtualizer])

  useLayoutEffect(() => {
    const scrollEl = scrollContainerRef.current
    if (!scrollEl) return
    // A MutationObserver guarantees that even if a row grows dynamically without
    // triggering a React render or an itemCount change (e.g. SmoothText typing out characters),
    // we will still keep the scroll pinned to the bottom if the user hasn't scrolled away.
    const mo = new MutationObserver(() => {
      if (stickToBottomRef.current) {
        virtualizer.scrollToEnd({ behavior: 'instant' })
      }
      // Same scrollElement health check as the scroll listener above, run here too because
      // this fires on essentially every content change regardless of whether the user has
      // ever scrolled — the initial-load case the scroll listener alone can't catch (nothing
      // to scroll yet the very first time the range comes out wrong).
      checkScrollBinding(scrollEl)
    })
    mo.observe(scrollEl, { childList: true, characterData: true, subtree: true })
    return () => mo.disconnect()
  }, [scrollContainerRef, virtualizer])

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
          if (stickToBottomRef.current) virtualizer.scrollToEnd({ behavior: 'instant' })
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
