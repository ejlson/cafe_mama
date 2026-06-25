"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Focus mode — a WordArt toggle (above the clock) brings up a video in the
 * bottom-left corner at its native aspect ratio. The video carries its own
 * audio. The panel can be dragged anywhere on screen; a play/pause button
 * overlays it. Scrolling on the panel — or the current clip ending —
 * advances to the next clip in the playlist.
 */
const VIDEOS = [
  "/focusvideos/0615.mp4",
  "/focusvideos/HOJICHA%20together.mp4",
  "/focusvideos/JONAS%20LONGANISA.mp4",
  "/focusvideos/chilli%20chicken%20kimchi.mp4",
  "/focusvideos/mango%20mog%20final1.mp4",
  "/focusvideos/meat%20boys.mp4",
  "/focusvideos/sando-adobo-mushroom.mp4",
  "/focusvideos/subwaysurf.mp4",
  "/focusvideos/ube%20latte%20final.mp4",
  "/focusvideos/ube%20power%20final1.mp4",
  "/focusvideos/website%20adobo%20mushroom.mp4",
];

function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Mock comment POOLS — per-video. Each pool has more comments than we show
// at once; on first mount we shuffle and pick 3–4 so the surfaced thread
// feels fresh every page load. All themed to that video's content so the
// replies read like a real, on-topic comment section.
type MockComment = {
  id: number;
  user: string;
  text: string;
  time: string;
  likes: number;
};

const MOCK_COMMENT_POOL_BY_VIDEO: Record<string, MockComment[]> = {
  "/focusvideos/0615.mp4": [
    { id: 1, user: "kentishtowner", text: "favourite spot in NW1 🤍", time: "1w", likes: 207 },
    { id: 2, user: "lewis_eats", text: "what's the song?", time: "3d", likes: 22 },
    { id: 3, user: "maria.santos", text: "this is the cleanest edit lol", time: "4d", likes: 51 },
    { id: 4, user: "tina_kt", text: "putting this on my list", time: "2d", likes: 19 },
    { id: 5, user: "m.delgado", text: "rewatching for the third time", time: "6d", likes: 38 },
    { id: 6, user: "henry.chua", text: "the vibes >>>", time: "1w", likes: 64 },
  ],
  "/focusvideos/HOJICHA%20together.mp4": [
    { id: 1, user: "matchamilf", text: "hojicha latte > matcha latte fight me", time: "5d", likes: 142 },
    { id: 2, user: "j_meralco", text: "smelled it from outside 🥲", time: "1w", likes: 64 },
    { id: 3, user: "filo_eats", text: "the foam art tho 🥺", time: "2d", likes: 88 },
    { id: 4, user: "tina_kt", text: "ordering on saturday 🫶", time: "6h", likes: 12 },
    { id: 5, user: "lila.kim", text: "switching from matcha forever", time: "3d", likes: 47 },
    { id: 6, user: "samtam23", text: "the roasted notes mmm", time: "4d", likes: 71 },
    { id: 7, user: "k_tan", text: "underrated drink no cap", time: "1w", likes: 56 },
  ],
  "/focusvideos/JONAS%20LONGANISA.mp4": [
    { id: 1, user: "filo_eats", text: "the longanisa sando is unreal 😍", time: "1w", likes: 312 },
    { id: 2, user: "manny.ph", text: "needed this in london forever", time: "4d", likes: 98 },
    { id: 3, user: "henry.chua", text: "jonas the goat", time: "3d", likes: 27 },
    { id: 4, user: "amaia.t", text: "perfect breakfast tbh", time: "1w", likes: 61 },
    { id: 5, user: "ines_park", text: "the sweet & savoury combo 🤤", time: "2d", likes: 43 },
    { id: 6, user: "k_tan", text: "this should be illegal it's so good", time: "5d", likes: 119 },
  ],
  "/focusvideos/chilli%20chicken%20kimchi.mp4": [
    { id: 1, user: "spicegirl21", text: "spice levels were SENDING me 🥵", time: "5d", likes: 154 },
    { id: 2, user: "k_tan", text: "fav sando in london", time: "1w", likes: 92 },
    { id: 3, user: "kentishtowner", text: "made me sweat, made me happy", time: "3d", likes: 41 },
    { id: 4, user: "henry.chua", text: "kimchi crunch hits different", time: "4d", likes: 73 },
    { id: 5, user: "samtam23", text: "i need a refill of milk after", time: "2d", likes: 27 },
    { id: 6, user: "filo_eats", text: "10/10 spice perfect crunch", time: "6d", likes: 88 },
  ],
  "/focusvideos/mango%20mog%20final1.mp4": [
    { id: 1, user: "lila.kim", text: "honey peach mango heavy rotation", time: "2w", likes: 89 },
    { id: 2, user: "mango_mom", text: "this drink is the reason i live", time: "5d", likes: 203 },
    { id: 3, user: "ines_park", text: "where's the recipe 🥲", time: "1d", likes: 18 },
    { id: 4, user: "amaia.t", text: "10/10 on a hot day", time: "3d", likes: 44 },
    { id: 5, user: "marko_b", text: "stop teasing me i'm at work", time: "6d", likes: 31 },
    { id: 6, user: "tina_kt", text: "the colour 🧡", time: "2d", likes: 67 },
  ],
  "/focusvideos/meat%20boys.mp4": [
    { id: 1, user: "henry.chua", text: "the meat boys are EATING", time: "4d", likes: 76 },
    { id: 2, user: "samtam23", text: "wtv they're doing keep doing 🔥", time: "1w", likes: 49 },
    { id: 3, user: "jacob_lee", text: "this is the sign to visit", time: "2d", likes: 22 },
    { id: 4, user: "manny.ph", text: "the brothers got it down", time: "5d", likes: 38 },
    { id: 5, user: "lewis_eats", text: "respect the craft 🫡", time: "3d", likes: 54 },
  ],
  "/focusvideos/sando-adobo-mushroom.mp4": [
    { id: 1, user: "vegan_dad", text: "the adobo mushroom is INSANE", time: "1w", likes: 188 },
    { id: 2, user: "filo_eats", text: "vegetarian filo win 🍄", time: "5d", likes: 73 },
    { id: 3, user: "tina_kt", text: "i don't even like mushrooms but this???", time: "3d", likes: 102 },
    { id: 4, user: "amaia.t", text: "umami HEAVEN", time: "2d", likes: 56 },
    { id: 5, user: "ines_park", text: "wish more places did this", time: "6d", likes: 39 },
  ],
  "/focusvideos/subwaysurf.mp4": [
    { id: 1, user: "scrollboy", text: "kept me here for the full vid lol", time: "2d", likes: 41 },
    { id: 2, user: "m.delgado", text: "lol fr", time: "1d", likes: 8 },
    { id: 3, user: "kentishtowner", text: "real ones know", time: "3d", likes: 33 },
    { id: 4, user: "lewis_eats", text: "the brainrot is real", time: "5d", likes: 62 },
    { id: 5, user: "tina_kt", text: "this is genius marketing 😂", time: "4d", likes: 28 },
  ],
  "/focusvideos/ube%20latte%20final.mp4": [
    { id: 1, user: "ube_supremacist", text: "this purple is therapy", time: "4d", likes: 167 },
    { id: 2, user: "marko_b", text: "ube latte run > anything else", time: "1w", likes: 81 },
    { id: 3, user: "lila.kim", text: "obsessed with the colour 🟣", time: "3d", likes: 56 },
    { id: 4, user: "maria.santos", text: "creamiest latte ever", time: "5d", likes: 92 },
    { id: 5, user: "ines_park", text: "the foam art is unreal", time: "2d", likes: 34 },
    { id: 6, user: "tina_kt", text: "my coffee order is sorted 🫶", time: "6d", likes: 47 },
  ],
  "/focusvideos/ube%20power%20final1.mp4": [
    { id: 1, user: "maria.santos", text: "the ube matcha is EVERYTHING 🟣", time: "2d", likes: 218 },
    { id: 2, user: "ube_supremacist", text: "best matcha in london ngl", time: "1w", likes: 134 },
    { id: 3, user: "j_meralco", text: "the layering 🤤", time: "5d", likes: 67 },
    { id: 4, user: "tina_kt", text: "ordered already 🫶", time: "6h", likes: 14 },
    { id: 5, user: "lila.kim", text: "the purple-green combo eats", time: "3d", likes: 78 },
    { id: 6, user: "matchamilf", text: "two of my faves in one drink", time: "4d", likes: 41 },
  ],
  "/focusvideos/website%20adobo%20mushroom.mp4": [
    { id: 1, user: "vegan_dad", text: "still thinking about this sando", time: "1w", likes: 95 },
    { id: 2, user: "ines_park", text: "save me one for sunday plsss", time: "2d", likes: 32 },
    { id: 3, user: "filo_eats", text: "umami sando king 👑", time: "4d", likes: 71 },
    { id: 4, user: "amaia.t", text: "the bread game is strong", time: "3d", likes: 58 },
    { id: 5, user: "kentishtowner", text: "regular order on lunch break", time: "5d", likes: 44 },
  ],
};

const DEFAULT_MOCK_COMMENT_POOL: MockComment[] = [
  { id: 1, user: "kentishtowner", text: "favourite spot in NW1 🤍", time: "1w", likes: 207 },
  { id: 2, user: "filo_eats", text: "this looks unreal 😍", time: "5d", likes: 88 },
  { id: 3, user: "tina_kt", text: "adding to my list", time: "3d", likes: 21 },
  { id: 4, user: "henry.chua", text: "vibes immaculate", time: "2d", likes: 33 },
];

// Pick 3–4 random comments from a pool — Fisher-Yates shuffle. Used inside
// the FocusMode useState initializer so the selection is generated ONCE per
// page load, then stays stable while you navigate the reel.
const shuffleMockComments = (pool: MockComment[]): MockComment[] => {
  const a = pool.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  const count = 3 + Math.floor(Math.random() * 2); // 3 or 4
  return a.slice(0, Math.min(count, a.length));
};

const buildSessionMockComments = (): Record<string, MockComment[]> => {
  const out: Record<string, MockComment[]> = {};
  for (const [url, pool] of Object.entries(MOCK_COMMENT_POOL_BY_VIDEO)) {
    out[url] = shuffleMockComments(pool);
  }
  return out;
};

const USER_HANDLE = "you";
const CAFE_HANDLE = "cafe_mama_sons";

type UserComment = {
  id: number;
  text: string;
  ts: number;
  reply?: { id: number; text: string; ts: number };
};
type UserCommentsByVideo = Record<string, UserComment[]>;

// "12s", "3m", "2h", "5d" — short relative time string for the comment timestamp.
const formatAgo = (ts: number): string => {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w`;
};

export default function FocusMode() {
  const [on, setOn] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [index, setIndex] = useState(0);
  const [playlist, setPlaylist] = useState<string[]>(VIDEOS.slice());
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [noAnim, setNoAnim] = useState(false);
  const [bursts, setBursts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [iconFlash, setIconFlash] = useState<{ id: number; kind: "play" | "pause" } | null>(null);
  const [instructionsShown, setInstructionsShown] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [scrollDragging, setScrollDragging] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  // User comments live in memory only — they reset on every page reload.
  const [userCommentsByVideo, setUserCommentsByVideo] = useState<UserCommentsByVideo>({});
  // Per-session shuffled mock comments — random sample picked from the
  // pool ONCE on FocusMode mount, so each page load gets a fresh thread but
  // the comments stay stable while you navigate the reel.
  const [sessionMockComments] = useState<Record<string, MockComment[]>>(() =>
    buildSessionMockComments(),
  );
  const [draft, setDraft] = useState("");
  const replyTimers = useRef<number[]>([]);
  const commentsListRef = useRef<HTMLUListElement>(null);

  // Active video URL + per-video derived views.
  const activeVideo = playlist[index] ?? "";
  const mockComments =
    sessionMockComments[activeVideo] ?? DEFAULT_MOCK_COMMENT_POOL.slice(0, 3);
  const userComments = userCommentsByVideo[activeVideo] ?? [];

  // Tick the relative timestamps so "12s" → "13s" etc. without a full re-mount.
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!commentsOpen) return;
    const id = window.setInterval(() => forceTick((n) => n + 1), 15_000);
    return () => window.clearInterval(id);
  }, [commentsOpen]);

  // Clear any pending Cafe Mama replies if the panel unmounts.
  useEffect(() => {
    return () => {
      replyTimers.current.forEach((t) => window.clearTimeout(t));
      replyTimers.current = [];
    };
  }, []);

  // Hits the /api/cafe-reply Next.js route which proxies to Anthropic with
  // the @cafe_mama_sons persona. The route falls back to a canned reply if
  // ANTHROPIC_API_KEY isn't set or the API call fails, so the UX still works
  // without config.
  const fetchCafeReply = async (userText: string): Promise<string> => {
    try {
      const r = await fetch("/api/cafe-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText }),
      });
      if (!r.ok) throw new Error("non-200");
      const data = (await r.json()) as { reply?: unknown };
      if (typeof data.reply === "string" && data.reply.trim()) return data.reply.trim();
    } catch {
      /* fall through to canned reply */
    }
    return "thanks for stopping by!! 🤍";
  };

  const scheduleCafeReply = (videoUrl: string, commentId: number, userText: string) => {
    const delay = 1100 + Math.floor(Math.random() * 800);
    const timer = window.setTimeout(async () => {
      replyTimers.current = replyTimers.current.filter((t) => t !== timer);
      const replyText = await fetchCafeReply(userText);
      setUserCommentsByVideo((prev) => {
        const list = prev[videoUrl] ?? [];
        const next = {
          ...prev,
          [videoUrl]: list.map((c) =>
            c.id === commentId
              ? { ...c, reply: { id: Date.now(), text: replyText, ts: Date.now() } }
              : c,
          ),
        };
        return next;
      });
      // Scroll list to bottom so the reply lands in view.
      requestAnimationFrame(() => {
        const el = commentsListRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    }, delay);
    replyTimers.current.push(timer);
  };

  const submitComment = () => {
    const text = draft.trim();
    if (!text) return;
    const videoUrl = activeVideo;
    if (!videoUrl) return;
    const id = Date.now();
    const comment: UserComment = { id, text, ts: id };
    setUserCommentsByVideo((prev) => {
      const list = prev[videoUrl] ?? [];
      return { ...prev, [videoUrl]: [...list, comment] };
    });
    setDraft("");
    scheduleCafeReply(videoUrl, id, text);
    // Scroll the user's own comment into view immediately.
    requestAnimationFrame(() => {
      const el = commentsListRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const heartBtnRef = useRef<HTMLButtonElement>(null);
  const drag = useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0 });
  const scrollDrag = useRef<{
    active: boolean;
    confirmed: boolean;
    startX: number;
    startY: number;
    panelH: number;
    pointerId: number;
  } | null>(null);
  const wheelLock = useRef(false);
  const wheelIdleTimer = useRef<number | null>(null);
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  const burstId = useRef(0);
  const tapTimer = useRef<number | null>(null);
  const instructionsSeen = useRef(false);
  const instructionsTimer = useRef<number | null>(null);

  // Walking off either end of the cycle reshuffles for the next cycle, so
  // each loop through the reel comes back in a fresh random order. The wrap
  // snaps without a slide transition so we don't rewind through every clip.
  // The reshuffle also dedupes against the just-watched clip so the next
  // cycle never opens with the same video the previous one closed on.
  const advance = (dir: 1 | -1) => {
    // Any pending single-tap pause is stale once we change clip — fire it
    // and we'd pause a video the user didn't intend to pause.
    if (tapTimer.current !== null) {
      window.clearTimeout(tapTimer.current);
      tapTimer.current = null;
    }
    setPaused(false);
    if (dir === 1 && index >= VIDEOS.length - 1) {
      const justWatched = playlist[index];
      const next = shuffle(VIDEOS);
      if (next.length > 1 && next[0] === justWatched) {
        [next[0], next[1]] = [next[1], next[0]];
      }
      setNoAnim(true);
      setPlaylist(next);
      setLiked(new Set());
      setIndex(0);
      return;
    }
    if (dir === -1 && index <= 0) {
      const justWatched = playlist[index];
      const next = shuffle(VIDEOS);
      const last = next.length - 1;
      if (next.length > 1 && next[last] === justWatched) {
        [next[last], next[last - 1]] = [next[last - 1], next[last]];
      }
      setNoAnim(true);
      setPlaylist(next);
      setLiked(new Set());
      setIndex(last);
      return;
    }
    setIndex(index + dir);
  };

  // Clear any deferred timers when the panel goes away.
  useEffect(() => {
    return () => {
      if (tapTimer.current !== null) window.clearTimeout(tapTimer.current);
      if (instructionsTimer.current !== null) window.clearTimeout(instructionsTimer.current);
      if (wheelIdleTimer.current !== null) window.clearTimeout(wheelIdleTimer.current);
    };
  }, []);

  // Re-enable the slide transition the frame after a wrap snap commits.
  useEffect(() => {
    if (!noAnim) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setNoAnim(false));
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [noAnim]);

  const dismissInstructions = () => {
    if (instructionsTimer.current !== null) {
      window.clearTimeout(instructionsTimer.current);
      instructionsTimer.current = null;
    }
    instructionsSeen.current = true;
    setInstructionsShown(false);
  };

  const toggle = () => {
    if (on) {
      setOn(false);
      // Make sure no stray timers fire after a close.
      dismissInstructions();
      if (tapTimer.current !== null) {
        window.clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }
    } else {
      setPaused(false);
      setPos({ x: 0, y: 0 });
      setPlaylist(shuffle(VIDEOS));
      setLiked(new Set());
      setIndex(0);
      setOn(true);
      if (!instructionsSeen.current) {
        setInstructionsShown(true);
        instructionsTimer.current = window.setTimeout(() => {
          instructionsTimer.current = null;
          instructionsSeen.current = true;
          setInstructionsShown(false);
        }, 3200);
      }
    }
  };

  const togglePause = () => {
    const v = videoRefs.current[index];
    if (!v) return;
    const willPlay = v.paused;
    if (willPlay) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
    // Briefly flash the matching icon — keyed so a quick double-toggle
    // restarts the animation rather than ignoring the second tap.
    const id = ++burstId.current;
    setIconFlash({ id, kind: willPlay ? "play" : "pause" });
    window.setTimeout(() => {
      setIconFlash((prev) => (prev && prev.id === id ? null : prev));
    }, 600);
  };

  // Squash-and-spring the heart button — fires whenever a clip flips to liked
  // (button click or double-tap).
  const pulseHeart = () => {
    const btn = heartBtnRef.current;
    if (!btn) return;
    gsap.fromTo(
      btn,
      { scale: 1 },
      {
        keyframes: [
          { scale: 1.5, duration: 0.12, ease: "power2.out" },
          { scale: 1, duration: 0.42, ease: "back.out(3)" },
        ],
      },
    );
  };

  const toggleLike = () => {
    const wasLiked = liked.has(index);
    setLiked((s) => {
      const n = new Set(s);
      if (n.has(index)) n.delete(index);
      else n.add(index);
      return n;
    });
    if (!wasLiked) pulseHeart();
  };

  // Spawn a TikTok-style heart at panel-local (x, y) and mark the current
  // clip as liked. Caller is responsible for deciding when this fires
  // (e.g. a double-tap on the panel).
  const burstLikeAt = (x: number, y: number) => {
    const id = ++burstId.current;
    setBursts((prev) => [...prev, { id, x, y }]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 900);
    const wasLiked = liked.has(index);
    if (!wasLiked) {
      setLiked((s) => {
        const n = new Set(s);
        n.add(index);
        return n;
      });
      pulseHeart();
    }
  };

  // A tap on the video toggles play/pause. Two quick taps in the same spot
  // are treated as a like instead — the single-tap action is held in a 300ms
  // timer and cancelled if the second tap arrives. Press-and-drag scrubs
  // through clips: once vertical movement crosses a small threshold the tap
  // is cancelled and the reel follows the finger. Buttons (heart, comment,
  // move) are skipped so their own onClick handlers run cleanly.
  const SCROLL_DRAG_THRESHOLD = 6;
  const SCROLL_COMMIT_RATIO = 0.2;

  const onPanelDown = (e: React.PointerEvent) => {
    if (e.target instanceof Element && e.target.closest("button")) return;
    // Inside the comments sheet — leave the panel's drag/tap logic alone so
    // the user can scroll/tap inside the sheet. Native bubbling continues so
    // the CustomCursor's window-level pointermove listener still tracks.
    if (
      e.target instanceof Element &&
      e.target.closest("[data-focus-scroll-passthrough]")
    ) {
      return;
    }

    if (instructionsShown) {
      dismissInstructions();
      return;
    }

    const now = Date.now();
    const last = lastTap.current;
    const isDouble =
      now - last.t < 300 &&
      Math.abs(e.clientX - last.x) < 30 &&
      Math.abs(e.clientY - last.y) < 30;

    if (isDouble) {
      if (tapTimer.current !== null) {
        window.clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      burstLikeAt(e.clientX - rect.left, e.clientY - rect.top);
      lastTap.current = { t: 0, x: 0, y: 0 };
      return;
    }

    lastTap.current = { t: now, x: e.clientX, y: e.clientY };

    // Prime a drag — confirmed once the finger moves past the threshold.
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    scrollDrag.current = {
      active: true,
      confirmed: false,
      startX: e.clientX,
      startY: e.clientY,
      panelH: rect.height,
      pointerId: e.pointerId,
    };

    if (tapTimer.current !== null) window.clearTimeout(tapTimer.current);
    tapTimer.current = window.setTimeout(() => {
      tapTimer.current = null;
      if (!scrollDrag.current?.confirmed) togglePause();
    }, 310);
  };

  const onPanelMove = (e: React.PointerEvent) => {
    const sd = scrollDrag.current;
    if (!sd || !sd.active) return;
    const dy = e.clientY - sd.startY;
    if (!sd.confirmed) {
      if (Math.abs(dy) < SCROLL_DRAG_THRESHOLD) return;
      sd.confirmed = true;
      setScrollDragging(true);
      if (tapTimer.current !== null) {
        window.clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(sd.pointerId);
      } catch {}
    }
    setDragOffset(dy);
  };

  const onPanelUp = (e: React.PointerEvent) => {
    const sd = scrollDrag.current;
    if (!sd) return;
    scrollDrag.current = null;
    if (!sd.confirmed) return; // tap timer handles single-tap
    const dy = e.clientY - sd.startY;
    setScrollDragging(false);
    setDragOffset(0);
    const commit = sd.panelH * SCROLL_COMMIT_RATIO;
    if (dy < -commit) advance(1);
    else if (dy > commit) advance(-1);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(sd.pointerId);
    } catch {}
  };

  // Drag is only initiated from the dedicated move handle in the top-right.
  // The handle captures the pointer so dragging continues even after the
  // cursor leaves the button.
  const onMoveHandleDown = (e: React.PointerEvent) => {
    drag.current = { active: true, sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMoveHandleMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    setPos({ x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) });
  };
  const onMoveHandleUp = (e: React.PointerEvent) => {
    drag.current.active = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  // Play the active clip from the start; pause the rest. The toggle click
  // (or wheel/ended gesture before that) is the user gesture that lets it
  // autoplay unmuted. Held off while the instructions overlay is up.
  useEffect(() => {
    if (!on) return;
    if (instructionsShown) {
      videoRefs.current.forEach((v) => v?.pause());
      return;
    }
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [on, index, instructionsShown]);

  // Non-passive wheel listener so we can preventDefault and step through clips
  // without scrolling the page behind the panel. The lock is released only
  // after a 250 ms idle window, so a single trackpad gesture (with momentum
  // tail) advances exactly one clip instead of two or three.
  useEffect(() => {
    if (!on) return;
    const el = panelRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // If the wheel event originated inside a scrollable overlay (the
      // comments list), let the browser scroll it natively. We still stop
      // propagation so ScrollSmoother and the hero↔menu Observer on window
      // don't see it, but we DON'T preventDefault — that would kill the
      // native scroll inside the comments.
      const target = e.target as Element | null;
      if (target && target.closest("[data-focus-scroll-passthrough]")) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }
      // Stop the event from reaching ScrollSmoother and the hero↔menu
      // Observer on window — otherwise scrolling the reel also scrolls
      // the page or kicks off the hero transition.
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(d) < 4) return;

      if (wheelIdleTimer.current !== null) {
        window.clearTimeout(wheelIdleTimer.current);
      }
      wheelIdleTimer.current = window.setTimeout(() => {
        wheelLock.current = false;
        wheelIdleTimer.current = null;
      }, 250);

      if (wheelLock.current) return;
      wheelLock.current = true;
      advance(d > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // re-attach when index changes so advance() sees the fresh wrap boundary
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, index]);

  const isLiked = liked.has(index);

  // Only preload the active clip + its neighbours (with wrap). Everything
  // else is preload="none" so opening focus mode doesn't fire 10 metadata
  // fetches at once, and wrap-around doesn't churn the browser's media
  // pipeline.
  const lastIdx = playlist.length - 1;
  const prevIdx = index <= 0 ? lastIdx : index - 1;
  const nextIdx = index >= lastIdx ? 0 : index + 1;
  const preloadFor = (i: number) => {
    if (i === index) return "auto";
    if (i === prevIdx || i === nextIdx) return "metadata";
    return "none";
  };

  return (
    <>
      {/* toggle — pre-rendered WordArt PNGs (DoomScroll to enter, LockIn to
          exit) above the watch in the bottom-right stack. */}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? "Exit focus mode" : "Focus mode"}
        // Same width + right offset as the OpeningClock watch
        // (right-6 w-28 sm:w-32 — see app/page.tsx) so this button sits
        // horizontally centered directly above it. items-end pins the PNG
        // to the bottom of the box (rather than vertically centring it)
        // so the visible art hugs the watch instead of floating 50px above
        // it. object-contain still centres each PNG horizontally.
        className="fixed bottom-[15rem] right-6 z-[56] flex h-28 w-28 select-none items-end justify-center transition-transform hover:-translate-y-0.5 active:scale-95 sm:bottom-[17rem] sm:h-32 sm:w-32"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={on ? "/media/word%20art/LockIn.png" : "/media/FAMILY-FAM--ily-FOCUS-LockIn-DoomScroll-LockIn-Doo.png"}
          alt={on ? "Lock in — exit focus mode" : "Doom scroll — enter focus mode"}
          draggable={false}
          className="block h-full w-full object-contain"
        />
      </button>

      {/* video panel — reel-style stack, bottom-left to start. Drag is via
          the move handle in the top-right; tapping anywhere else toggles
          play/pause (or, double-tapped, fires the like burst). */}
      {on && (
        <div
          ref={panelRef}
          onPointerDown={onPanelDown}
          onPointerMove={onPanelMove}
          onPointerUp={onPanelUp}
          onPointerCancel={onPanelUp}
          data-cursor-target
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
          className="fixed bottom-4 left-4 z-[80] aspect-[9/16] w-48 touch-none overflow-hidden rounded-2xl bg-ink shadow-[0_12px_30px_rgba(0,0,0,0.5)] sm:w-64"
        >
          {/* vertical reel — translateY by index for the scroll animation,
              plus the live drag offset while the user is dragging */}
          <div
            className={`absolute inset-0 ${
              noAnim || scrollDragging
                ? ""
                : "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            }`}
            style={{
              transform: `translate3d(0, calc(${-index * 100}% + ${dragOffset}px), 0)`,
            }}
          >
            {playlist.map((src, i) => (
              <video
                key={src}
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={src}
                onEnded={() => i === index && advance(1)}
                className="pointer-events-none block h-full w-full object-cover"
                preload={preloadFor(i)}
                playsInline
                muted={i !== index}
              />
            ))}
          </div>

          {/* first-open instructions — covers the panel for ~3s, dismissed
              early by tapping anywhere on it */}
          {instructionsShown && (
            <div className="focus-instructions pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-ink/85 px-3 text-center text-cream backdrop-blur-sm">
              <div className="text-[10px] uppercase tracking-[0.3em] opacity-70">
                Focus mode
              </div>
              <ul className="space-y-2 text-sm leading-tight">
                <li>
                  <span className="opacity-60">Tap</span>{" "}
                  <span className="font-semibold">play / pause</span>
                </li>
                <li>
                  <span className="opacity-60">Double-tap</span>{" "}
                  <span className="font-semibold">like</span>
                </li>
                <li>
                  <span className="opacity-60">Scroll</span>{" "}
                  <span className="font-semibold">next clip</span>
                </li>
                <li>
                  <span className="opacity-60">Hold</span>{" "}
                  <span className="font-semibold">⤧ to drag</span>
                </li>
              </ul>
              <div className="mt-2 text-[10px] uppercase tracking-widest opacity-50">
                tap to dismiss
              </div>
            </div>
          )}

          {/* play/pause icon flash — centered in the panel, scales up + fades */}
          {iconFlash && (
            <div
              key={iconFlash.id}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              aria-hidden
            >
              <div className="focus-icon-flash grid h-20 w-20 place-items-center rounded-full bg-ink/55 text-cream backdrop-blur-sm">
                {iconFlash.kind === "play" ? (
                  // Triangle picked so its centroid sits exactly at (12, 12)
                  // — vertices (8,4), (8,20), (20,12).
                  <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor">
                    <path d="M8 4v16l12-8z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* double-tap heart bursts — pure visual, sit above the video */}
          {bursts.map((b) => (
            <svg
              key={b.id}
              viewBox="0 0 24 24"
              aria-hidden
              className="focus-heart-burst pointer-events-none absolute h-24 w-24 text-red-500 drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
              style={{ left: b.x, top: b.y }}
              fill="currentColor"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ))}

          {/* move handle — press-and-drag to reposition the panel */}
          <button
            type="button"
            onPointerDown={onMoveHandleDown}
            onPointerMove={onMoveHandleMove}
            onPointerUp={onMoveHandleUp}
            onPointerCancel={onMoveHandleUp}
            aria-label="Move panel"
            className="absolute right-2 top-2 grid h-9 w-9 cursor-grab place-items-center rounded-full bg-ink/70 text-cream backdrop-blur-sm transition-transform hover:scale-110 active:cursor-grabbing"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="5 9 2 12 5 15" />
              <polyline points="9 5 12 2 15 5" />
              <polyline points="15 19 12 22 9 19" />
              <polyline points="19 9 22 12 19 15" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="12" y1="2" x2="12" y2="22" />
            </svg>
          </button>

          {/* social rail — heart + comment, vertical on the right */}
          <div className="absolute bottom-16 right-2 flex flex-col items-center gap-3">
            <button
              ref={heartBtnRef}
              type="button"
              onClick={toggleLike}
              aria-pressed={isLiked}
              aria-label={isLiked ? "Unlike" : "Like"}
              className="grid h-10 w-10 place-items-center rounded-full bg-ink/60 text-cream backdrop-blur-sm transition-transform hover:scale-110 active:scale-90"
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-5 w-5 transition-colors ${isLiked ? "text-red-500" : "text-cream"}`}
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setCommentsOpen(true)}
              aria-label="Open comments"
              className="grid h-10 w-10 place-items-center rounded-full bg-ink/60 text-cream backdrop-blur-sm transition-transform hover:scale-110 active:scale-90"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </button>
          </div>

          {/* scroll-down indicator — bounces only on hover; click to advance */}
          <button
            type="button"
            onClick={() => advance(1)}
            aria-label="Next clip"
            className="group absolute bottom-2 left-1/2 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full bg-ink/60 text-cream backdrop-blur-sm transition-transform hover:scale-110"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 group-hover:animate-bounce"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* TikTok-style comments sheet — slides up from the bottom of the
              panel. The wrapper is always mounted so the sheet can animate
              out (translate-y-full) when commentsOpen flips back to false;
              pointer-events flip with it so it doesn't intercept clicks
              while hidden. Tap the dim backdrop or the X to close. */}
          <div
            aria-hidden={!commentsOpen}
            className={`absolute inset-0 z-30 ${
              commentsOpen ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            {/* Dim backdrop fades with the sheet */}
            <div
              onClick={() => setCommentsOpen(false)}
              className={`absolute inset-0 bg-ink/55 backdrop-blur-[2px] transition-opacity duration-300 ${
                commentsOpen ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Sheet — rounded top, slides up from below. We DON'T
                stopPropagation here: the CustomCursor tracks pointermove on
                window, so blocking propagation freezes the cursor over the
                sheet. The panel's pointerdown handler short-circuits on the
                data-focus-scroll-passthrough attribute instead, which keeps
                the reel's drag/tap inert without breaking other listeners. */}
            <div
              data-focus-scroll-passthrough
              className={`absolute bottom-0 left-0 right-0 flex h-[78%] flex-col overflow-hidden rounded-t-2xl bg-cream text-ink shadow-[0_-8px_24px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                commentsOpen ? "translate-y-0" : "translate-y-full"
              }`}
            >
              {/* Grab handle + header */}
              <div className="relative shrink-0 border-b border-ink/10 px-4 pb-2 pt-2">
                <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/25" aria-hidden />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {mockComments.length + userComments.length} comments
                  </span>
                  <button
                    type="button"
                    onClick={() => setCommentsOpen(false)}
                    aria-label="Close comments"
                    className="grid h-7 w-7 place-items-center rounded-full text-ink/70 transition-colors hover:bg-ink/10"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Comment list — public mock comments first, then the user's
                  own thread (stored locally so only THIS browser sees it)
                  with the cafe's reply tucked under each. */}
              <ul
                ref={commentsListRef}
                data-focus-scroll-passthrough
                className="flex-1 space-y-3.5 overflow-y-auto overscroll-contain px-4 py-3 text-[13px] leading-snug"
              >
                {mockComments.map((c) => (
                  <li key={c.id} className="flex gap-2.5">
                    <div
                      aria-hidden
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-cream"
                      style={{
                        backgroundColor: `hsl(${(c.id * 47) % 360} 65% 55%)`,
                      }}
                    >
                      {c.user[0]!.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[12px] font-semibold opacity-80">
                          @{c.user}
                        </span>
                        <span className="text-[11px] opacity-50">{c.time}</span>
                      </div>
                      <p className="mt-0.5 break-words">{c.text}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-center text-[10px] opacity-60">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="mt-0.5">{c.likes}</span>
                    </div>
                  </li>
                ))}

                {/* The user's own posts + cafe replies. Avatar is a "Y" chip
                    to read as "you"; the cafe replies are indented under each
                    user comment to read as a thread. */}
                {userComments.map((uc) => (
                  <li key={uc.id} className="space-y-2">
                    <div className="flex gap-2.5">
                      <div
                        aria-hidden
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/80 text-[11px] font-bold text-cream"
                      >
                        Y
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[12px] font-semibold opacity-80">
                            @{USER_HANDLE}
                          </span>
                          <span className="text-[11px] opacity-50">
                            {formatAgo(uc.ts)}
                          </span>
                        </div>
                        <p className="mt-0.5 break-words">{uc.text}</p>
                      </div>
                    </div>

                    {/* Cafe Mama's reply — indented, with a verified chip */}
                    {uc.reply && (
                      <div className="cm-reply-in ml-9 flex gap-2.5">
                        <div
                          aria-hidden
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold text-cream"
                          style={{ backgroundColor: "#FF1353" }}
                        >
                          CM
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="truncate text-[12px] font-semibold opacity-90">
                              @{CAFE_HANDLE}
                            </span>
                            <svg
                              viewBox="0 0 24 24"
                              aria-label="Verified"
                              className="h-3 w-3 shrink-0"
                              fill="#1d9bf0"
                            >
                              <path d="M22 12l-2.4-2.8.3-3.7-3.6-.8L14.4 1.5 12 3 9.6 1.5 7.7 4.7 4.1 5.5l.3 3.7L2 12l2.4 2.8-.3 3.7 3.6.8 1.9 3.2L12 21l2.4 1.5 1.9-3.2 3.6-.8-.3-3.7L22 12zm-11.3 4.5l-3.7-3.7 1.4-1.4 2.3 2.3 5-5 1.4 1.4-6.4 6.4z" />
                            </svg>
                            <span className="text-[11px] opacity-50">
                              {formatAgo(uc.reply.ts)}
                            </span>
                          </div>
                          <p className="mt-0.5 break-words">{uc.reply.text}</p>
                        </div>
                      </div>
                    )}

                    {/* "Cafe Mama is typing…" hint while the reply is in flight */}
                    {!uc.reply && (
                      <div className="ml-9 flex items-center gap-2 text-[11px] opacity-60">
                        <span
                          aria-hidden
                          className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-bold text-cream"
                          style={{ backgroundColor: "#FF1353" }}
                        >
                          CM
                        </span>
                        <span>@{CAFE_HANDLE} is typing…</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {/* Compose row — submit posts the user's comment to local state
                  (kept in localStorage, so only this browser sees it) and
                  queues a Cafe Mama reply after a short randomised delay. */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitComment();
                }}
                className="flex shrink-0 items-center gap-2 border-t border-ink/10 px-3 py-2"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink/15 text-[11px] font-bold text-ink/70" aria-hidden>
                  Y
                </div>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Add a comment…"
                  maxLength={240}
                  className="min-w-0 flex-1 rounded-full bg-ink/10 px-3 py-1.5 text-[12px] outline-none placeholder:text-ink/40"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
                  style={{ color: "#FF1353" }}
                >
                  Post
                </button>
              </form>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
