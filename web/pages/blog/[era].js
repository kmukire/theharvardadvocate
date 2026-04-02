/** @jsxImportSource theme-ui */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  YEAR_GROUPS,
  getSortedBlogPosts,
  getYearGroupByKey,
  getPostsForYearGroup,
} from "../../lib/blogArchive";

const ALL_POSTS_FILTER_KEY = "all";
const CLOCK_YEAR_STEP_MS = 460;
const CLOCK_FINAL_HOLD_MS = 380;
const PAPER_BACKGROUND = "#ffffff";
const INK = "#1c1916";
const INK_STRONG = "#161310";
const INK_SOFT = "rgba(28, 25, 22, 0.78)";
const INK_MUTED = "rgba(28, 25, 22, 0.62)";
const INK_FAINT = "rgba(28, 25, 22, 0.54)";
const LINE = "rgba(28, 25, 22, 0.14)";
const LINE_STRONG = "rgba(28, 25, 22, 0.24)";
const BLOG_ARCHIVE_CONTEXT_KEY = "blog-archive-context";
const HERO_IMAGE_WARM_TIMEOUT_MS = 900;
const PRIMARY_FILTERS = [
  {
    key: ALL_POSTS_FILTER_KEY,
    label: "All posts",
    description: "Every post in this era.",
  },
  {
    key: "Writing",
    label: "Writing",
    description: "Writing and lyric essay posts in this era.",
  },
  {
    key: "Art",
    label: "Art",
    description: "Art and multimedia pieces in this era.",
  },
  {
    key: "Essays",
    label: "Essays",
    description: "Review-driven and critical essays in this era.",
  },
  {
    key: "Events",
    label: "Events",
    description: "Event coverage and interviews in this era.",
  },
  {
    key: "Archive",
    label: "Archive",
    description: "Legacy archive posts in this era.",
  },
];

const warmedPostTargets = new Set();

function buildClockSequence(group, direction = "forward") {
  if (!group) {
    return {
      turns: 0,
      labels: [],
    };
  }

  if (group.endYear === Infinity) {
    return {
      turns: 4,
      labels: [
        { value: String(group.startYear), stepOffset: 0 },
        { value: `${group.startYear}-Present`, stepOffset: 3 },
      ],
    };
  }

  const years = Array.from(
    { length: Math.max(group.endYear - group.startYear + 1, 1) },
    (_, index) => group.startYear + index
  );
  const orderedYears = direction === "backward" ? [...years].reverse() : years;

  return {
    turns: years.length,
    labels: orderedYears.map((year, index) => ({
      value: orderedYears.slice(0, index + 1).join(", "),
      stepOffset: index,
    })),
  };
}

const eraPageSx = {
  ".pageShell": {
    minHeight: "100vh",
    backgroundColor: PAPER_BACKGROUND,
  },
  ".pageWrap": {
    position: "relative",
    width: "100%",
    maxWidth: "82rem",
    margin: "0 auto",
    padding: "3.25rem 4rem 6rem",
    minHeight: "100vh",
    backgroundColor: PAPER_BACKGROUND,
    color: INK,
    overflow: "hidden",
  },
  ".pageWrap.isLeavingForward": {
    animation: "eraSlideForward 0.34s ease forwards",
  },
  ".pageWrap.isLeavingBackward": {
    animation: "eraSlideBackward 0.34s ease forwards",
  },
  ".arrivalWash": {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.88) 58%, rgba(255, 255, 255, 0) 100%)",
    pointerEvents: "none",
    zIndex: 0,
    animation: "arrivalWashFade 0.95s ease forwards",
  },
  ".backLink": {
    position: "relative",
    zIndex: 1,
    display: "inline-block",
    marginBottom: "1.05rem",
    color: INK_SOFT,
    textDecoration: "none",
    fontFamily: "heading",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: "0.82rem",
    opacity: 0,
    animation: "contentLift 0.8s ease forwards",
    animationDelay: "0.18s",
  },
  ".backLink:hover": {
    color: INK,
  },
  ".heroBlock": {
    position: "relative",
    zIndex: 1,
    maxWidth: "36rem",
    marginBottom: "0.9rem",
    opacity: 0,
    animation: "contentLift 0.9s ease forwards",
    animationDelay: "0.28s",
  },
  ".title": {
    margin: 0,
    fontSize: "clamp(1.7rem, 3vw, 2.45rem)",
    lineHeight: 0.98,
    color: INK_STRONG,
  },
  ".archiveHeader": {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "minmax(0, 10rem) minmax(0, 1fr)",
    gap: "1.25rem",
    alignItems: "start",
    paddingTop: "0.2rem",
    marginBottom: "1.42rem",
    opacity: 0,
    animation: "contentLift 0.9s ease forwards",
    animationDelay: "0.42s",
  },
  ".archiveLabel": {
    margin: 0,
    fontFamily: "body",
    fontStyle: "italic",
    fontSize: "1.02rem",
    lineHeight: 1.2,
    color: INK_MUTED,
  },
  ".archiveControls": {
    display: "grid",
    gap: "0.4rem",
  },
  ".filterTabs": {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.18rem 0.72rem",
  },
  ".filterTab": {
    appearance: "none",
    border: 0,
    borderBottom: "1px solid transparent",
    borderRadius: 0,
    backgroundColor: "transparent",
    color: INK_SOFT,
    opacity: 0.72,
    padding: "0 0 0.18rem",
    fontFamily: "body",
    fontSize: "0.98rem",
    lineHeight: 1,
    cursor: "pointer",
    transition: "color 0.18s ease, border-color 0.18s ease, opacity 0.18s ease",
  },
  ".filterTab:hover": {
    color: INK,
    opacity: 0.9,
    borderBottomColor: INK_FAINT,
  },
  ".filterTab.isActive": {
    color: INK,
    opacity: 1,
    fontWeight: 500,
    borderBottomColor: INK,
  },
  ".filterMeta": {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "minmax(0, 10rem) minmax(0, 1fr)",
    gap: "1.25rem",
    alignItems: "start",
    marginBottom: "2.05rem",
    opacity: 0,
    animation: "contentLift 0.9s ease forwards",
    animationDelay: "0.54s",
  },
  ".filterMetaLabel": {
    margin: 0,
    fontFamily: "body",
    fontStyle: "italic",
    fontSize: "1rem",
    lineHeight: 1.2,
    color: INK_SOFT,
  },
  ".filterSummary": {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.45rem 0.8rem",
    color: INK_SOFT,
    fontSize: "1rem",
    lineHeight: 1.4,
  },
  ".filterSummaryItem": {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
  },
  ".postsGrid": {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    columnGap: 0,
    rowGap: "0",
    borderTop: `1px solid ${LINE}`,
  },
  ".postCard": {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: "0.52rem",
    aspectRatio: "1 / 0.78",
    minHeight: "16.75rem",
    padding: "1.15rem 1rem 1.2rem",
    opacity: 0,
    transform: "translateY(18px)",
    animation: "cardLift 0.42s ease forwards",
    textDecoration: "none",
    color: INK,
  },
  ".postCard::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "0.8rem",
    right: "0.8rem",
    height: "1px",
    backgroundColor: LINE,
    opacity: 0,
  },
  ".postCard:nth-of-type(n + 4)::before": {
    opacity: 1,
  },
  ".postCard::after": {
    content: '""',
    position: "absolute",
    top: "0.85rem",
    bottom: "0.85rem",
    left: 0,
    width: "1px",
    backgroundColor: LINE,
    opacity: 0,
  },
  ".postCard:not(:nth-of-type(3n + 1))::after": {
    opacity: 1,
  },
  ".postMeta": {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.2rem",
    color: INK,
    fontSize: "0.8rem",
    lineHeight: 1.18,
    fontStyle: "italic",
    fontFamily: "body",
    marginTop: "-0.18rem",
  },
  ".postTitle": {
    margin: 0,
    maxWidth: "15ch",
    fontFamily: 'Canela, "EB Garamond", serif',
    fontWeight: 500,
    fontSize: "clamp(1.18rem, 1.42vw, 1.52rem)",
    lineHeight: 0.98,
    letterSpacing: "-0.02em",
    color: INK_STRONG,
  },
  ".postExcerpt": {
    margin: 0,
    width: "100%",
    maxWidth: "none",
    fontFamily: "body",
    fontSize: "0.92rem",
    lineHeight: 1.42,
    color: INK_SOFT,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: "4",
    WebkitBoxOrient: "vertical",
    textOverflow: "ellipsis",
    marginTop: "0.15rem",
  },
  ".postAuthor": {
    margin: "0.72rem 0 0",
    fontFamily: "heading",
    fontSize: "0.84rem",
    lineHeight: 1.1,
    color: INK,
  },
  ".postFooter": {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.3rem 0.65rem",
    paddingTop: 0,
  },
  ".postCategory": {
    fontFamily: "body",
    fontStyle: "italic",
    fontSize: "0.86rem",
    lineHeight: 1,
    color: INK_FAINT,
  },
  ".postTags": {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.45rem",
  },
  ".postTag": {
    display: "inline-flex",
    alignItems: "center",
    padding: 0,
    border: 0,
    fontSize: "0.82rem",
    letterSpacing: "0.01em",
    color: INK_MUTED,
  },
  ".emptyState": {
    position: "relative",
    zIndex: 1,
    maxWidth: "36rem",
    color: INK_MUTED,
    opacity: 0,
    animation: "contentLift 0.9s ease forwards",
    animationDelay: "0.64s",
  },
  ".eraTimeline": {
    position: "relative",
    zIndex: 1,
    marginTop: "0.4rem",
    marginBottom: "1.15rem",
    paddingTop: "0.35rem",
    paddingBottom: "0.5rem",
    opacity: 0,
    animation: "contentLift 0.9s ease forwards",
    animationDelay: "0.38s",
  },
  ".eraTimelineHeader": {
    display: "block",
    marginBottom: "0.7rem",
  },
  ".eraTimelineLabel": {
    margin: 0,
    fontFamily: "body",
    fontStyle: "italic",
    fontSize: "0.92rem",
    color: INK_MUTED,
  },
  ".eraTimelineTrack": {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "1.05rem",
    alignItems: "end",
  },
  ".eraTimelineItem": {
    position: "relative",
    display: "grid",
    gap: "0.24rem",
    textDecoration: "none",
    color: INK,
    cursor: "pointer",
  },
  ".eraTimelineLine": {
    width: "82%",
    height: "1px",
    backgroundColor: "rgba(28, 25, 22, 0.08)",
    transformOrigin: "left center",
    transition: "transform 0.24s ease, background-color 0.24s ease",
  },
  ".eraTimelineDot": {
    width: "0.18rem",
    height: "0.18rem",
    borderRadius: "999px",
    border: "1px solid rgba(28, 25, 22, 0.14)",
    backgroundColor: "rgba(28, 25, 22, 0.08)",
    transition:
      "transform 0.24s ease, background-color 0.24s ease, border-color 0.24s ease",
  },
  ".eraTimelineText": {
    display: "grid",
    gap: "0.1rem",
  },
  ".eraTimelineName": {
    fontFamily: "heading",
    fontSize: "0.92rem",
    lineHeight: 1,
  },
  ".eraTimelineRange": {
    fontSize: "0.72rem",
    fontStyle: "italic",
    color: INK_FAINT,
  },
  ".eraTimelineItem:hover .eraTimelineLine": {
    transform: "scaleX(1.01)",
    backgroundColor: "rgba(28, 25, 22, 0.14)",
  },
  ".eraTimelineItem:hover .eraTimelineDot": {
    transform: "translateX(1px)",
    borderColor: "rgba(28, 25, 22, 0.18)",
    backgroundColor: "rgba(28, 25, 22, 0.16)",
  },
  ".eraTimelineItem.isCurrent": {
    cursor: "default",
  },
  ".eraTimelineItem.isCurrent .eraTimelineLine": {
    backgroundColor: "rgba(28, 25, 22, 0.16)",
    transform: "scaleX(1)",
  },
  ".eraTimelineItem.isCurrent .eraTimelineDot": {
    borderColor: "rgba(28, 25, 22, 0.22)",
    backgroundColor: "rgba(28, 25, 22, 0.2)",
    transform: "translateX(1px)",
  },
  ".eraTimelineItem.isCurrent .eraTimelineRange": {
    color: INK_SOFT,
  },
  ".clockTransition": {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PAPER_BACKGROUND,
    opacity: 0,
    pointerEvents: "none",
    zIndex: 30,
    transition: "opacity 0.22s ease",
  },
  ".clockTransition.isActive": {
    opacity: 1,
  },
  ".clockTransitionSweep": {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.88) 38%, rgba(255, 255, 255, 1) 100%)",
    transform: "translateX(-100%)",
  },
  ".clockTransition.isActive .clockTransitionSweep": {
    animation: "clockSweep 0.56s cubic-bezier(0.22, 1, 0.36, 1) forwards",
  },
  ".clockFace": {
    position: "relative",
    width: "4.5rem",
    height: "4.5rem",
    borderRadius: "999px",
    border: `1px solid ${LINE_STRONG}`,
    backgroundColor: "rgba(255, 255, 255, 0.34)",
  },
  ".clockFace::before": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "0.26rem",
    height: "0.26rem",
    borderRadius: "999px",
    backgroundColor: INK,
    transform: "translate(-50%, -50%)",
  },
  ".clockHand": {
    position: "absolute",
    top: "0.5rem",
    left: "50%",
    width: "1px",
    height: "1.75rem",
    backgroundColor: INK,
    transformOrigin: "center calc(100% - 1px)",
    transform: "translateX(-50%) rotate(0turn)",
  },
  ".clockHandShort": {
    top: "1.15rem",
    height: "1.1rem",
    width: "1.5px",
  },
  ".clockTransition.isActive .clockHand": {
    animationName: "clockAdvance",
    animationTimingFunction: "cubic-bezier(0.55, 0.08, 0.38, 0.96)",
    animationFillMode: "forwards",
  },
  ".clockTransition.isDropping .clockFace": {
    animation: "clockDrop 0.36s cubic-bezier(0.22, 1, 0.36, 1) forwards",
  },
  ".clockYear": {
    position: "absolute",
    top: "calc(50% + 4.35rem)",
    left: "50%",
    transform: "translateX(-50%)",
    fontFamily: "heading",
    fontSize: "0.86rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: INK_SOFT,
    opacity: 0,
    transition: "opacity 0.18s ease",
  },
  ".clockTransition.isActive .clockYear": {
    opacity: 1,
  },
  "@media (max-width: 835px)": {
    ".pageWrap": {
      padding: "2.1rem 1.25rem 4rem",
    },
    ".heroBlock": {
      marginBottom: "0.75rem",
    },
    ".backLink": {
      marginBottom: "0.88rem",
    },
    ".archiveHeader": {
      gridTemplateColumns: "1fr",
      gap: "1rem",
      marginBottom: "1.24rem",
    },
    ".filterMeta": {
      gridTemplateColumns: "1fr",
      gap: "0.75rem",
      marginBottom: "1.75rem",
    },
    ".filterTab": {
      fontSize: "0.9rem",
    },
    ".postsGrid": {
      gridTemplateColumns: "1fr",
      borderTop: `1px solid ${LINE}`,
    },
    ".postCard": {
      paddingInline: 0,
      aspectRatio: "auto",
      minHeight: 0,
      padding: "1.2rem 0 1.3rem",
    },
    ".postCard::before": {
      left: 0,
      right: 0,
    },
    ".postCard:nth-of-type(n + 4)::before": {
      opacity: 0,
    },
    ".postCard:nth-of-type(n + 2)::before": {
      opacity: 1,
    },
    ".postCard::after": {
      opacity: 0,
    },
    ".eraTimeline": {
      marginTop: "0.55rem",
      marginBottom: "0.95rem",
    },
    ".eraTimelineHeader": {
      display: "block",
    },
    ".eraTimelineTrack": {
      gridTemplateColumns: "1fr",
      gap: "0.8rem",
    },
    ".eraTimelineItem": {
      gridTemplateColumns: "1.2rem minmax(0, 1fr)",
      alignItems: "center",
      gap: "0.5rem",
    },
    ".eraTimelineLine": {
      width: "1px",
      height: "100%",
      minHeight: "1.6rem",
      justifySelf: "center",
      transformOrigin: "center top",
    },
    ".eraTimelineItem:hover .eraTimelineLine": {
      transform: "scaleY(1.06)",
    },
    ".eraTimelineDot": {
      position: "absolute",
      top: "0.58rem",
      left: "0.44rem",
    },
    ".eraTimelineItem:hover .eraTimelineDot": {
      transform: "translateY(2px)",
    },
    ".eraTimelineItem.isCurrent .eraTimelineDot": {
      transform: "translateY(3px)",
    },
    ".eraTimelineText": {
      minHeight: 0,
    },
    ".postTitle": {
      maxWidth: "100%",
      fontSize: "clamp(1.18rem, 6vw, 1.4rem)",
    },
    ".postExcerpt": {
      maxWidth: "100%",
      width: "100%",
      fontSize: "0.98rem",
      WebkitLineClamp: "4",
    },
  },
};

export async function getStaticPaths() {
  return {
    paths: YEAR_GROUPS.map((group) => ({
      params: { era: group.key },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const group = getYearGroupByKey(params.era);
  const posts = getSortedBlogPosts();
  const filteredPosts = getPostsForYearGroup(posts, group);

  return {
    props: {
      group,
      posts: filteredPosts,
    },
  };
}

export default function BlogEraPage({ group, posts }) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState(ALL_POSTS_FILTER_KEY);
  const [timelineDirection, setTimelineDirection] = useState(null);
  const [clockDirection, setClockDirection] = useState(1);
  const [clockTurns, setClockTurns] = useState(0);
  const [isClockTransitioning, setIsClockTransitioning] = useState(false);
  const [clockLabels, setClockLabels] = useState([]);
  const [activeClockYear, setActiveClockYear] = useState("");
  const [isClockDropping, setIsClockDropping] = useState(false);
  const filteredPosts =
    activeFilter === ALL_POSTS_FILTER_KEY
      ? posts
      : posts.filter((post) => post.primaryCategory === activeFilter);

  const activeFilterConfig =
    PRIMARY_FILTERS.find((filter) => filter.key === activeFilter) ||
    PRIMARY_FILTERS[0];
  const currentGroupIndex = YEAR_GROUPS.findIndex(
    (yearGroup) => yearGroup.key === group.key
  );
  const filteredPostLabel = filteredPosts.length === 1 ? "post" : "posts";

  const warmPostDestination = (post) => {
    if (!post) {
      return;
    }

    const href = `/blog/post/${post.slug}`;

    if (!warmedPostTargets.has(href)) {
      warmedPostTargets.add(href);
      router.prefetch(href);
    }

    if (post.imageUrl && !warmedPostTargets.has(post.imageUrl)) {
      warmedPostTargets.add(post.imageUrl);
      const image = new Image();
      image.src = post.imageUrl;
    }
  };

  const waitForHeroImage = async (imageUrl) => {
    if (typeof window === "undefined" || !imageUrl) {
      return;
    }

    await new Promise((resolve) => {
      let didFinish = false;
      const image = new Image();

      const finish = () => {
        if (didFinish) {
          return;
        }

        didFinish = true;
        resolve();
      };

      const timeoutId = window.setTimeout(finish, HERO_IMAGE_WARM_TIMEOUT_MS);

      image.onload = () => {
        window.clearTimeout(timeoutId);
        finish();
      };

      image.onerror = () => {
        window.clearTimeout(timeoutId);
        finish();
      };

      image.src = imageUrl;

      if (image.complete) {
        window.clearTimeout(timeoutId);
        finish();
      } else if (typeof image.decode === "function") {
        image.decode().then(
          () => {
            window.clearTimeout(timeoutId);
            finish();
          },
          () => {
            window.clearTimeout(timeoutId);
            finish();
          }
        );
      }
    });
  };

  const handlePostClick = async (event, post) => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0 ||
      isClockTransitioning
    ) {
      return;
    }

    event.preventDefault();
    warmPostDestination(post);
    window.sessionStorage.setItem(
      BLOG_ARCHIVE_CONTEXT_KEY,
      JSON.stringify({
        slug: post.slug,
        groupKey: group.key,
        filter: activeFilter,
      })
    );
    await waitForHeroImage(post.imageUrl);
    router.push(`/blog/post/${post.slug}`);
  };

  useEffect(() => {
    const queryFilter =
      typeof router.query.filter === "string" ? router.query.filter : null;
    const nextFilter = PRIMARY_FILTERS.some(
      (filter) => filter.key === queryFilter
    )
      ? queryFilter
      : ALL_POSTS_FILTER_KEY;

    setActiveFilter(nextFilter);
    setTimelineDirection(null);
    setClockDirection(1);
    setClockTurns(0);
    setIsClockTransitioning(false);
    setClockLabels([]);
    setActiveClockYear("");
    setIsClockDropping(false);
  }, [group.key, router.query.filter]);

  useEffect(() => {
    if (!isClockTransitioning || !clockLabels.length) {
      return undefined;
    }

    const yearStepMs = CLOCK_YEAR_STEP_MS;
    const finalHoldMs = CLOCK_FINAL_HOLD_MS;

    setActiveClockYear(clockLabels[0].value);
    setIsClockDropping(false);

    const timers = clockLabels.map(({ value, stepOffset }) =>
      window.setTimeout(() => {
        setActiveClockYear(value);
      }, stepOffset * yearStepMs)
    );

    timers.push(
      window.setTimeout(() => {
        setIsClockDropping(true);
      }, Math.max(clockTurns - 1, 0) * yearStepMs + finalHoldMs)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [clockLabels, clockTurns, isClockTransitioning]);

  const handleTimelineClick = (event, nextGroup) => {
    if (
      nextGroup.key === group.key ||
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0 ||
      isClockTransitioning
    ) {
      return;
    }

    event.preventDefault();

    const nextGroupIndex = YEAR_GROUPS.findIndex(
      (yearGroup) => yearGroup.key === nextGroup.key
    );
    const direction =
      nextGroupIndex > currentGroupIndex ? "forward" : "backward";
    const { turns, labels } = buildClockSequence(nextGroup, direction);
    const dropStartMs =
      Math.max(turns - 1, 0) * CLOCK_YEAR_STEP_MS + CLOCK_FINAL_HOLD_MS;

    setTimelineDirection(direction);
    setClockDirection(direction === "backward" ? -1 : 1);
    setClockLabels(labels);
    setClockTurns(turns);
    setIsClockTransitioning(true);
    setActiveClockYear("");
    setIsClockDropping(false);

    window.setTimeout(() => {
      setIsClockDropping(true);
    }, dropStartMs);

    window.setTimeout(() => {
      router.push(`/blog/${nextGroup.key}`).catch(() => {
        setIsClockTransitioning(false);
        setIsClockDropping(false);
        setTimelineDirection(null);
      });
    }, dropStartMs + 20);
  };

  return (
    <div sx={eraPageSx}>
      <Head>
        <title>{group.label} - The Advocate Blog</title>
        <meta
          name="description"
          content={`${group.label} archive page for The Advocate Blog.`}
        />
      </Head>

      <div className="pageShell">
        <div
          className={`clockTransition${isClockTransitioning ? " isActive" : ""}${
            isClockDropping ? " isDropping" : ""
          }`}
          aria-hidden="true"
        >
          <div className="clockTransitionSweep" />
          <div className="clockFace">
            <div
              className="clockHand"
              style={{
                animationDuration: `${
                  (Math.max(clockTurns, 1) * CLOCK_YEAR_STEP_MS) / 1000
                }s`,
                animationIterationCount: 1,
                "--clock-rotation": `${clockTurns * clockDirection}turn`,
              }}
            />
            <div
              className="clockHand clockHandShort"
              style={{
                animationDuration: `${
                  (Math.max(clockTurns, 1) * CLOCK_YEAR_STEP_MS) / 1000
                }s`,
                animationIterationCount: 1,
                "--clock-rotation": `${clockTurns * 12 * clockDirection}turn`,
              }}
            />
          </div>
          <div className="clockYear">{activeClockYear}</div>
        </div>
        <div
          className={`pageWrap${
            timelineDirection
              ? ` isLeaving${
                  timelineDirection === "forward" ? "Forward" : "Backward"
                }`
              : ""
          }`}
        >
          <div className="arrivalWash" aria-hidden="true" />
          <Link className="backLink" href="/blog">
            Back to home
          </Link>

          <section className="heroBlock">
            <h1 className="title">{group.label}</h1>
          </section>

          <nav className="eraTimeline" aria-label="Switch archive era">
            <div className="eraTimelineHeader">
              <p className="eraTimelineLabel">Archive timeline</p>
            </div>
            <div className="eraTimelineTrack">
              {YEAR_GROUPS.map((timelineGroup) => {
                const isCurrent = timelineGroup.key === group.key;

                return (
                  <Link
                    key={timelineGroup.key}
                    href={`/blog/${timelineGroup.key}`}
                    prefetch={false}
                    className={`eraTimelineItem${
                      isCurrent ? " isCurrent" : ""
                    }`}
                    aria-current={isCurrent ? "page" : undefined}
                    onClick={(event) =>
                      handleTimelineClick(event, timelineGroup)
                    }
                  >
                    <span className="eraTimelineLine" aria-hidden="true" />
                    <span className="eraTimelineDot" aria-hidden="true" />
                    <span className="eraTimelineText">
                      <span className="eraTimelineName">
                        {timelineGroup.label}
                      </span>
                      <span className="eraTimelineRange">
                        {timelineGroup.rangeLabel}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <section>
            <div className="archiveHeader">
              <p className="archiveLabel">Filter this era</p>
              <div className="archiveControls">
                <div
                  className="filterTabs"
                  role="tablist"
                  aria-label={`${group.label} category filters`}
                >
                  {PRIMARY_FILTERS.map((filter) => {
                    const isActive = filter.key === activeFilter;

                    return (
                      <button
                        key={filter.key}
                        type="button"
                        className={`filterTab${isActive ? " isActive" : ""}`}
                        onClick={() => setActiveFilter(filter.key)}
                        role="tab"
                        aria-selected={isActive}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="filterMeta">
              <p className="filterMetaLabel">Current filter</p>
              <div className="filterSummary">
                <span className="filterSummaryItem">
                  <strong>{activeFilterConfig.label}</strong>
                </span>
                <span className="filterSummaryItem">
                  {filteredPosts.length} {filteredPostLabel}
                </span>
                <span className="filterSummaryItem">
                  {activeFilterConfig.description}
                </span>
              </div>
            </div>

            {filteredPosts.length ? (
              <div className="postsGrid" key={`${group.key}-${activeFilter}`}>
                {filteredPosts.map((post, index) => (
                    <Link
                      className="postCard"
                      key={`${activeFilter}-${post.id}`}
                      href={`/blog/post/${post.slug}`}
                      onMouseEnter={() => warmPostDestination(post)}
                      onFocus={() => warmPostDestination(post)}
                      onTouchStart={() => warmPostDestination(post)}
                      onClick={(event) => handlePostClick(event, post)}
                      style={{ animationDelay: `${0.12 + index * 0.045}s` }}
                    >
                      <div className="postMeta">
                        <span>{`${post.formattedDate} - ${post.primaryCategory}`}</span>
                      </div>
                      <h2 className="postTitle">{post.title}</h2>
                      <p className="postExcerpt">{post.excerpt}</p>
                      <p className="postAuthor">By {post.author}</p>
                      {post.secondaryTags.length ? (
                        <div className="postFooter">
                          <div className="postTags" aria-label="Secondary tags">
                            {post.secondaryTags.map((tag, tagIndex) => (
                              <span className="postTag" key={`${post.id}-${tag}`}>
                                {tagIndex ? ` / ${tag}` : tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="postFooter" aria-hidden="true" />
                      )}
                    </Link>
                ))}
              </div>
            ) : (
              <p className="emptyState">
                No posts were found for this category in {group.label}.
              </p>
            )}

          </section>
        </div>
      </div>
      <style jsx>{`
        @keyframes arrivalWashFade {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes contentLift {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardLift {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes eraSlideForward {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(36px);
          }
        }

        @keyframes eraSlideBackward {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-24px);
          }
        }

        @keyframes clockSweep {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0%);
          }
        }

        @keyframes clockAdvance {
          from {
            transform: translateX(-50%) rotate(0turn);
          }
          to {
            transform: translateX(-50%) rotate(var(--clock-rotation));
          }
        }

        @keyframes clockDrop {
          from {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          to {
            opacity: 0;
            transform: translateY(44vh) rotate(22deg);
          }
        }
      `}</style>
    </div>
  );
}
