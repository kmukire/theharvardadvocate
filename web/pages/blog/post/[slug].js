/** @jsxImportSource theme-ui */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-danger */
/* eslint-disable react/no-unknown-property */
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  getBlogPostBySlug,
  getSortedBlogPosts,
  isUsableBlogImageUrl,
} from "../../../lib/blogArchive";

const PAPER = "#ffffff";
const INK = "#161310";
const INK_SOFT = "rgba(22, 19, 16, 0.78)";
const LINE = "#000000";
const BLOG_ARCHIVE_CONTEXT_KEY = "blog-archive-context";

function hasValidImage(post, hasImageLoadFailure = false) {
  if (hasImageLoadFailure) {
    return false;
  }

  return isUsableBlogImageUrl(post?.imageUrl);
}

const blogPostPageSx = {
  ".heroStage": {
    position: "relative",
    width: "100%",
    height: "100vh",
    minHeight: "36rem",
    overflow: "hidden",
    backgroundColor: PAPER,
  },
  ".heroMedia": {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center center",
    backgroundSize: "cover",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    transform: "scale(1.015)",
  },
  ".heroShade": {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.16) 100%)",
    pointerEvents: "none",
  },
  ".heroPrompt": {
    position: "absolute",
    right: "1.4rem",
    bottom: "1.25rem",
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: "heading",
    fontSize: "0.76rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  ".heroArchiveLink": {
    position: "absolute",
    left: "1.4rem",
    bottom: "1.25rem",
    color: "rgba(255, 255, 255, 0.9)",
    textDecoration: "none",
    fontFamily: "heading",
    fontSize: "0.76rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  ".heroArchiveLink:hover": {
    color: "#ffffff",
  },
  ".pageShell": {
    minHeight: "100vh",
    backgroundColor: PAPER,
    color: INK,
    padding: "2.5rem 1.5rem 5rem",
  },
  ".pageShell.hasHero": {
    marginTop: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: "2.5rem",
  },
  ".pageWrap": {
    width: "100%",
    maxWidth: "42rem",
    margin: "0 auto",
  },
  ".metaLine": {
    margin: 0,
    fontSize: "1.02rem",
    lineHeight: 1.25,
    color: INK,
  },
  ".title": {
    margin: "0.7rem 0 0",
    fontFamily: 'Canela, "EB Garamond", serif',
    fontSize: "clamp(1.55rem, 3.2vw, 2.05rem)",
    lineHeight: 0.94,
    letterSpacing: "-0.03em",
  },
  ".authorLine": {
    margin: "0.75rem 0 0",
    fontSize: "1.1rem",
    lineHeight: 1.2,
    color: INK,
  },
  ".dividerRow": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    paddingBottom: "0.55rem",
    marginTop: "2rem",
    borderBottom: `1px solid ${LINE}`,
  },
  ".shareButton": {
    appearance: "none",
    border: 0,
    padding: 0,
    background: "transparent",
    fontFamily: "body",
    fontSize: "1rem",
    lineHeight: 1,
    color: INK_SOFT,
    cursor: "pointer",
  },
  ".shareButton:hover": {
    color: INK,
  },
  ".shareBackLink": {
    color: INK_SOFT,
    textDecoration: "none",
    fontFamily: "body",
    fontSize: "1rem",
    lineHeight: 1,
  },
  ".shareBackLink:hover": {
    color: INK,
  },
  ".body": {
    marginTop: "1.1rem",
    fontSize: "1.1rem",
    lineHeight: 1.62,
    color: INK,
  },
  ".body p": {
    marginTop: 0,
    marginBottom: "1.65rem",
  },
  ".body a": {
    color: INK,
    textDecorationThickness: "1px",
    textUnderlineOffset: "0.12em",
  },
  ".body em": {
    fontStyle: "italic",
  },
  ".body strong": {
    fontWeight: 600,
  },
  ".body h1, .body h2, .body h3, .body h4": {
    fontFamily: 'Canela, "EB Garamond", serif',
    fontWeight: 500,
    lineHeight: 1.05,
    marginTop: "2.1rem",
    marginBottom: "0.8rem",
  },
  ".body blockquote": {
    margin: "2rem 0",
    paddingLeft: "1.1rem",
    borderLeft: `2px solid ${LINE}`,
    color: INK_SOFT,
    fontStyle: "italic",
  },
  ".body img": {
    display: "block",
    maxWidth: "100%",
    height: "auto",
    margin: "2rem auto",
  },
  ".body iframe": {
    width: "100%",
    minHeight: "24rem",
    border: 0,
    marginBottom: "1.5rem",
  },
  ".body figcaption": {
    marginTop: "-0.8rem",
    marginBottom: "1.8rem",
    fontSize: "0.96rem",
    lineHeight: 1.4,
    color: INK_SOFT,
    textAlign: "center",
  },
  ".shareStatus": {
    margin: "0.45rem 0 0",
    fontSize: "0.9rem",
    color: INK_SOFT,
    textAlign: "right",
  },
  ".bottomArchiveLink": {
    display: "inline-block",
    marginTop: "1.1rem",
    color: INK_SOFT,
    textDecoration: "none",
    fontFamily: "body",
    fontSize: "1rem",
    lineHeight: 1.2,
    fontWeight: 700,
  },
  ".bottomArchiveLink:hover": {
    color: INK,
  },
  "@media (max-width: 700px)": {
    ".heroStage": {
      minHeight: "28rem",
      height: "84vh",
    },
    ".heroPrompt": {
      right: "1rem",
      bottom: "1rem",
      fontSize: "0.68rem",
    },
    ".heroArchiveLink": {
      left: "1rem",
      bottom: "1rem",
      fontSize: "0.68rem",
    },
    ".pageShell": {
      padding: "1.85rem 1.1rem 4rem",
    },
    ".pageShell.hasHero": {
      marginTop: 0,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      paddingTop: "1.85rem",
    },
    ".metaLine": {
      fontSize: "0.95rem",
    },
    ".authorLine": {
      fontSize: "1rem",
    },
    ".dividerRow": {
      marginTop: "1.55rem",
      paddingBottom: "0.45rem",
      alignItems: "flex-start",
    },
    ".body": {
      marginTop: "1rem",
      fontSize: "1.02rem",
      lineHeight: 1.65,
    },
    ".body iframe": {
      minHeight: "14rem",
    },
    ".bottomArchiveLink": {
      marginTop: "0.85rem",
    },
  },
};

export async function getStaticPaths() {
  return {
    paths: getSortedBlogPosts().map((post) => ({
      params: { slug: post.slug },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
  };
}

export default function BlogPostPage({ post }) {
  const router = useRouter();
  const [shareStatus, setShareStatus] = useState("");
  const [hasImageLoadFailure, setHasImageLoadFailure] = useState(false);
  const showHero = hasValidImage(post, hasImageLoadFailure);
  const description = `${post.title} by ${post.author} for The Harvard Advocate blog.`;
  const articleUrl = `https://theharvardadvocate.com/blog/post/${post.slug}`;
  const imageOrigin = showHero ? new URL(post.imageUrl).origin : null;
  const archiveHref = post.group ? `/blog/${post.group.key}` : "/blog";

  useEffect(() => {
    setHasImageLoadFailure(false);
  }, [post.slug, post.imageUrl]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus("Link copied");
      window.setTimeout(() => setShareStatus(""), 1800);
    } catch (error) {
      setShareStatus("Copy failed");
      window.setTimeout(() => setShareStatus(""), 1800);
    }
  };

  const handleBackToArchive = (event) => {
    event.preventDefault();

    let archiveContext = {
      slug: post.slug,
      groupKey: post.group?.key || null,
      filter: "all",
    };

    if (typeof window !== "undefined") {
      const savedContext = window.sessionStorage.getItem(BLOG_ARCHIVE_CONTEXT_KEY);

      if (savedContext) {
        try {
          const parsedContext = JSON.parse(savedContext);

          if (parsedContext?.slug === post.slug) {
            archiveContext = {
              ...archiveContext,
              ...parsedContext,
            };
          }
        } catch (error) {
          // Keep the default archive context if stored data is malformed.
        }
      }
    }
    const targetGroup = archiveContext.groupKey || post.group?.key;
    const targetFilter = archiveContext.filter || "all";
    const query =
      targetFilter && targetFilter !== "all"
        ? `?filter=${encodeURIComponent(targetFilter)}`
        : "";

    router.push(targetGroup ? `/blog/${targetGroup}${query}` : `/blog`);
  };

  return (
    <div sx={blogPostPageSx}>
      <Head>
        <title>{`${post.title} - The Advocate Blog`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={articleUrl} />
        {imageOrigin ? (
          <>
            <link rel="preconnect" href={imageOrigin} />
            <link rel="dns-prefetch" href={imageOrigin} />
          </>
        ) : null}
        {showHero ? (
          <link rel="preload" as="image" href={post.imageUrl} />
        ) : null}
      </Head>

      {showHero ? (
        <section
          className="heroStage"
          aria-hidden="true"
        >
          <img
            className="heroMedia"
            src={post.imageUrl}
            alt={post.title}
            loading="eager"
            fetchpriority="high"
            decoding="sync"
            onError={() => setHasImageLoadFailure(true)}
          />
          <div className="heroShade" />
          <Link
            className="heroArchiveLink"
            href={archiveHref}
            onClick={handleBackToArchive}
          >
            Back to archive
          </Link>
          <div className="heroPrompt">Scroll to read</div>
        </section>
      ) : null}

      <div className={`pageShell${showHero ? " hasHero" : ""}`}>
        <div className="pageWrap">
          <header>
            <p className="metaLine">{`${post.formattedDate} • ${post.primaryCategory}`}</p>
            <h1 className="title">{post.title}</h1>
            <p className="authorLine">By {post.author}</p>
          </header>

          <div className="dividerRow">
            {showHero ? (
              <div />
            ) : (
              <Link
                className="shareBackLink"
                href={archiveHref}
                onClick={handleBackToArchive}
              >
                Back to Archive
              </Link>
            )}
            <button
              type="button"
              className="shareButton"
              onClick={handleShare}
            >
              Share
            </button>
          </div>
          {shareStatus ? <p className="shareStatus">{shareStatus}</p> : null}

          <article
            className="body"
            dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
          />
          <Link
            className="bottomArchiveLink"
            href={archiveHref}
            onClick={handleBackToArchive}
          >
            Back to Archive
          </Link>
        </div>
      </div>
    </div>
  );
}
