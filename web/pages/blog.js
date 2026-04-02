/** @jsxImportSource theme-ui */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { YEAR_GROUPS } from "../lib/blogArchive";

const BLOG_HERO_IMAGE = "/images/the%20advocatees.jpg";

const blogPageSx = {
  ".pageShell": {
    width: "100%",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "#111",
  },
  ".hero": {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    backgroundColor: "#111",
  },
  ".heroPanels": {
    position: "absolute",
    inset: 0,
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
  },
  ".heroPanel": {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#1b1b1b",
    transform: "translateY(101%)",
    animationName: "panelReveal",
    animationDuration: "1s",
    animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    animationFillMode: "forwards",
  },
  ".heroPanelImage": {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "400%",
    height: "100%",
    maxWidth: "none",
    objectFit: "cover",
    display: "block",
    opacity: 0,
    animationName: "imageFadeIn",
    animationDuration: "0.9s",
    animationTimingFunction: "ease-out",
    animationFillMode: "forwards",
  },
  ".heroPanelButton": {
    position: "relative",
    zIndex: 3,
    width: "100%",
    height: "100%",
    padding: "1.5rem 1.15rem 1.5rem 4rem",
    display: "flex",
    alignItems: "flex-end",
    border: 0,
    background: "transparent",
    textAlign: "left",
    color: "#f8f2e8",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  ".heroPanelButton:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  ".heroPanelText": {
    display: "grid",
    gridTemplateRows: "1.3rem 1.2rem 2.35rem",
    alignContent: "end",
    opacity: 0,
    width: "100%",
    minHeight: "4.85rem",
    transform: "translateY(0)",
    transition: "transform 0.35s ease",
    animation: "copyRise 0.9s ease-out forwards",
  },
  ".heroPanelButton:hover .heroPanelText": {
    transform: "translateY(-1.25rem)",
  },
  ".heroPanelLabel": {
    display: "block",
    fontFamily: "heading",
    fontSize: "1.1rem",
    lineHeight: 1.05,
    marginBottom: 0,
  },
  ".heroPanelRange": {
    display: "block",
    fontSize: "0.78rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "rgba(248, 242, 232, 0.78)",
    marginBottom: 0,
  },
  ".heroPanelArrow": {
    display: "inline-block",
    marginLeft: "0.35rem",
    opacity: 0,
    transform: "translateX(-4px)",
    transition: "opacity 0.25s ease, transform 0.25s ease",
  },
  ".heroPanelButton:hover .heroPanelArrow": {
    opacity: 1,
    transform: "translateX(0)",
  },
  ".heroPanelDescription": {
    display: "block",
    maxWidth: "15ch",
    fontSize: "0.84rem",
    lineHeight: 1.25,
    color: "rgba(248, 242, 232, 0.9)",
    opacity: 0,
    transform: "translateY(8px)",
    minHeight: 0,
    marginTop: 0,
    transition: "opacity 0.28s ease, transform 0.28s ease",
  },
  ".heroPanelButton:hover .heroPanelDescription": {
    opacity: 1,
    transform: "translateY(0)",
  },
  ".heroOverlay": {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.5) 100%)",
    pointerEvents: "none",
  },
  ".heroCopy": {
    position: "relative",
    zIndex: 2,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "4rem",
    color: "#f8f2e8",
    pointerEvents: "none",
  },
  ".heroHeading": {
    marginTop: "auto",
    marginBottom: "5.75rem",
    maxWidth: "42rem",
  },
  ".heroTitle": {
    margin: 0,
    fontFamily: "body",
    fontWeight: "500",
    fontSize: "clamp(2rem, 4.8vw, 4.4rem)",
    lineHeight: 0.98,
    letterSpacing: "-0.02em",
    whiteSpace: "nowrap",
    opacity: 0,
    animation: "copyRise 1s ease-out 1s forwards",
  },
  ".heroQuote": {
    marginTop: "0.85rem",
    maxWidth: "32rem",
    fontSize: "1.15rem",
    lineHeight: 1.3,
    opacity: 0,
    animation: "copyRise 1s ease-out 1.2s forwards",
  },
  "@media (max-width: 835px)": {
    ".hero": {
      minHeight: "100vh",
    },
    ".heroPanelButton": {
      padding: "1rem 0.55rem 1rem 1.5rem",
    },
    ".heroPanelLabel": {
      fontSize: "0.78rem",
    },
    ".heroPanelRange": {
      fontSize: "0.62rem",
    },
    ".heroPanelText": {
      gridTemplateRows: "1rem 0.95rem 2rem",
      minHeight: "3.95rem",
    },
    ".heroPanelDescription": {
      fontSize: "0.66rem",
      maxWidth: "14ch",
    },
    ".heroCopy": {
      minHeight: "100vh",
      padding: "1.5rem",
      justifyContent: "space-between",
    },
    ".heroHeading": {
      marginTop: "auto",
      marginBottom: "4.25rem",
    },
    ".heroQuote": {
      fontSize: "0.98rem",
      maxWidth: "22rem",
    },
    ".heroTitle": {
      whiteSpace: "normal",
      fontSize: "clamp(1.8rem, 8vw, 3rem)",
    },
  },
};

export async function getStaticProps() {
  return {
    props: {},
  };
}

export default function Blog() {
  const heroImage = BLOG_HERO_IMAGE;
  const panelDelays = ["0.08s", "0.22s", "0.36s", "0.5s"];

  return (
    <div sx={blogPageSx}>
      <Head>
        <title>Blog - The Harvard Advocate</title>
        <meta
          name="description"
          content="A visual landing page for The Harvard Advocate blog archive."
        />
      </Head>

      <div className="pageShell">
        <section className="hero">
          <div className="heroPanels">
            {YEAR_GROUPS.map((group, index) => (
              <div
                className="heroPanel"
                key={group.key}
                style={{ animationDelay: panelDelays[index] }}
              >
                {heroImage ? (
                  <img
                    className="heroPanelImage"
                    src={heroImage}
                    alt="The Advocate Blog hero"
                    style={{
                      left: `${index * -100}%`,
                      top: "0",
                      animationDelay: panelDelays[index],
                    }}
                  />
                ) : null}
                <Link
                  className="heroPanelButton"
                  href={`/blog/${group.key}`}
                  prefetch={false}
                >
                  <span
                    className="heroPanelText"
                    style={{ animationDelay: `${1.1 + index * 0.12}s` }}
                  >
                    <span className="heroPanelLabel">
                      {group.label}
                      <span className="heroPanelArrow">→</span>
                    </span>
                    <span className="heroPanelRange">{group.rangeLabel}</span>
                    <span className="heroPanelDescription">
                      {group.description}
                    </span>
                  </span>
                </Link>
              </div>
            ))}
          </div>
          <div className="heroOverlay" />
          <div className="heroCopy">
            <div className="heroHeading">
              <h1 className="heroTitle">The Advocate Blog</h1>
              <p className="heroQuote">
                A record of voices, moments, and ideas still unfolding.
              </p>
            </div>
          </div>
        </section>

        <style jsx>{`
          @keyframes panelReveal {
            from {
              transform: translateY(101%);
            }
            to {
              transform: translateY(0%);
            }
          }

          @keyframes imageFadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes copyRise {
            from {
              opacity: 0;
              transform: translateY(24px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
