import blogPosts from "../data/blog-export.json";

export const YEAR_GROUPS = [
  {
    key: "early",
    label: "Early Blog",
    rangeLabel: "2012-2014",
    startYear: 2012,
    endYear: 2014,
    description: "Notes, essays, and early archive posts.",
  },
  {
    key: "expansion",
    label: "Expansion",
    rangeLabel: "2015-2017",
    startYear: 2015,
    endYear: 2017,
    description: "A growing blog with wider voices and forms.",
  },
  {
    key: "transition",
    label: "Transition",
    rangeLabel: "2018-2020",
    startYear: 2018,
    endYear: 2020,
    description: "A period of change across tone, format, and focus.",
  },
  {
    key: "recent",
    label: "Recent",
    rangeLabel: "2021-Present",
    startYear: 2021,
    endYear: Infinity,
    description: "The newest work from the current era of the blog.",
  },
];

const PRIMARY_CATEGORY_PRIORITY = [
  {
    primaryCategory: "Writing",
    matches: ["Writing", "Lyric essay", "Fiction"],
  },
  {
    primaryCategory: "Art",
    matches: ["Art", "Multi-media", "Photo"],
  },
  {
    primaryCategory: "Essays",
    matches: ["Review essay"],
  },
  {
    primaryCategory: "Events",
    matches: ["Event", "Interview"],
  },
  {
    primaryCategory: "Archive",
    matches: ["Uncategorized", "Archives"],
  },
];

const SECONDARY_TAG_LABELS = {
  Distortion: "Distortion",
  "Themed Post": "Themed",
  Moonshine: "Moonshine",
  "Multi-media": "Multimedia",
  Interview: "Interview",
  "Review essay": "Review",
};

function stripHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanBodyHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<\/?center[^>]*>/gi, "")
    .replace(/<span[^>]*class="embed-youtube"[^>]*>/gi, "")
    .replace(/<p[^>]*class="wpa[^"]*"[\s\S]*?<\/p>/gi, "")
    .replace(/\(\s*function\(g\)\{g\.__ATA[\s\S]*?\}\)\(window\);?/gi, "")
    .replace(/<span[^>]*id="more-[^"]*"[^>]*><\/span>/gi, "")
    .replace(/<a\b[^>]*>\s*<\/a>/gi, "")
    .replace(/<\/?div[^>]*>/gi, "")
    .replace(/<(p|div)[^>]*>\s*<\/\1>/gi, "")
    .replace(/<p[^>]*>\s*(?:<br\s*\/?>|&nbsp;|\s)*<\/p>/gi, "")
    .replace(/<p[^>]*>\s*(?:<br\s*\/?>\s*){2,}/gi, "<p>")
    .replace(/<\/?span[^>]*>/gi, "")
    .replace(/\s(?:class|style|id|width|height|frameborder|type|allowfullscreen|rel|title)="[^"]*"/gi, "")
    .replace(/https?:\/\/(?:www\.)?theharvardadvocate\.com\/blog\/post\/([^/"?#]+)\/?/gi, "/blog/post/$1")
    .replace(/https?:\/\/(?:www\.)?theadvocateblog\.net\/\d{4}\/\d{2}\/\d{2}\/([^/"?#]+)\/?/gi, "/blog/post/$1")
    .replace(/http:\/\/theadvocateblogdotnet\.files\.wordpress\.com\//gi, "https://theadvocateblogdotnet.files.wordpress.com/")
    .replace(/http:\/\/www\.youtube\.com\//gi, "https://www.youtube.com/")
    .replace(/href="\/?blog\/post\/([^"]+)"/gi, 'href="/blog/post/$1"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildExcerpt(html, maxLength = 220) {
  const plainText = stripHtml(html)
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\b(?:www\.)\S+/gi, " ")
    .replace(/\b\/media\/[^\s]+/gi, " ")
    .replace(/\b\S+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?\S*)?/gi, " ")
    .replace(
      /^(?:image|photo|artwork|illustration)\s+courtesy\s+of[^.?!]*[.?!]?\s*/i,
      ""
    )
    .replace(
      /^(?:image|photo|artwork|illustration)\s+by[^.?!]*[.?!]?\s*/i,
      ""
    )
    .replace(/^(?:image|photo|artwork|illustration)\s*:\s*/i, "")
    .replace(/^\W+/, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength).trim()}...`;
}

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

function buildImageUrl(imagePath) {
  if (!imagePath || typeof imagePath !== "string") {
    return null;
  }

  const trimmedPath = imagePath.trim();

  if (!trimmedPath) {
    return null;
  }

  if (trimmedPath.startsWith("http")) {
    return trimmedPath;
  }

  if (trimmedPath.startsWith("/")) {
    return `https://blog.theharvardadvocate.com${trimmedPath}`;
  }

  return null;
}

function decodeHtmlEntities(value = "") {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function normalizeExtractedImageUrl(rawUrl = "") {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }

  const src = decodeHtmlEntities(rawUrl.trim());

  if (src.startsWith("http")) {
    return src;
  }

  if (src.startsWith("/")) {
    return `https://blog.theharvardadvocate.com${src}`;
  }

  return src;
}

export function isUsableBlogImageUrl(url = "") {
  if (!url || typeof url !== "string") {
    return false;
  }

  const decodedUrl = decodeHtmlEntities(url.trim());

  if (
    !decodedUrl ||
    decodedUrl.startsWith("blob:") ||
    decodedUrl.toLowerCase() === "null" ||
    decodedUrl.toLowerCase() === "undefined"
  ) {
    return false;
  }

  if (decodedUrl.startsWith("/media/")) {
    return true;
  }

  if (/\.(?:jpg|jpeg|png|gif|webp|svg|avif)(?:[?#].*)?$/i.test(decodedUrl)) {
    return true;
  }

  try {
    const parsedUrl = new URL(decodedUrl, "https://blog.theharvardadvocate.com");
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes("files.wordpress.com")) {
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
}

function extractFirstImageUrl(html = "") {
  const linkedImageMatch = html.match(
    /<a[^>]+href="([^"]+)"[^>]*>\s*<img[^>]+src="([^"]+)"/i
  );

  if (linkedImageMatch) {
    const linkedHref = normalizeExtractedImageUrl(linkedImageMatch[1]);
    const imageSrc = normalizeExtractedImageUrl(linkedImageMatch[2]);

    if (isUsableBlogImageUrl(linkedHref)) {
      return linkedHref;
    }

    if (isUsableBlogImageUrl(imageSrc)) {
      return imageSrc;
    }

    return null;
  }

  const match = html.match(/<img[^>]+src="([^"]+)"/i);

  if (!match || !match[1]) {
    return null;
  }

  const imageSrc = normalizeExtractedImageUrl(match[1]);

  return isUsableBlogImageUrl(imageSrc) ? imageSrc : null;
}

function removeBodyImages(html = "") {
  return html
    .replace(/<figure[\s\S]*?<\/figure>/gi, "")
    .replace(/<p[^>]*>\s*<a[^>]*>\s*<img[^>]*>\s*<\/a>\s*<\/p>/gi, "")
    .replace(/<p[^>]*>\s*<img[^>]*>\s*<\/p>/gi, "")
    .replace(/<a[^>]*>\s*<img[^>]*>\s*<\/a>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<(p|div)[^>]*>\s*(?:<br\s*\/?>|\s|&nbsp;)*<\/\1>/gi, "");
}

function splitRawCategories(categoryName = "") {
  return categoryName
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function normalizeBlogCategories(categoryName = "") {
  const categories = splitRawCategories(categoryName);
  const categorySet = new Set(categories);

  const matchedPrimary =
    PRIMARY_CATEGORY_PRIORITY.find(({ matches }) =>
      matches.some((label) => categorySet.has(label))
    ) || PRIMARY_CATEGORY_PRIORITY[PRIMARY_CATEGORY_PRIORITY.length - 1];

  const { primaryCategory, matches } = matchedPrimary;
  const primaryLabels = new Set(matches);
  const secondaryTags = categories.reduce((tags, label) => {
    if (label === "Uncategorized" || primaryLabels.has(label)) {
      return tags;
    }

    const displayLabel = SECONDARY_TAG_LABELS[label];

    if (!displayLabel || tags.includes(displayLabel)) {
      return tags;
    }

    return [...tags, displayLabel];
  }, []);

  return {
    primaryCategory,
    secondaryTags,
  };
}

function normalizeBlogPostBase(post) {
  const rawCategory = post.category_name || "";
  const { primaryCategory, secondaryTags } = normalizeBlogCategories(rawCategory);
  const cleanedBodyHtml = cleanBodyHtml(post.body || "");
  const bodyImageUrl = extractFirstImageUrl(cleanedBodyHtml);
  const pathImageUrl = buildImageUrl(post.image_path);

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    author: post.author_name || "The Harvard Advocate",
    authorSlug: post.author_slug || null,
    rawCategory,
    primaryCategory,
    secondaryTags,
    created: post.created,
    year: new Date(post.created).getFullYear(),
    formattedDate: formatDate(post.created),
    excerpt: buildExcerpt(cleanedBodyHtml),
    imageUrl: bodyImageUrl || (isUsableBlogImageUrl(pathImageUrl) ? pathImageUrl : null),
    imageCaption: post.image_caption || null,
    themeName: post.theme_name || "",
  };
}

export function normalizeBlogPost(post) {
  const bodyHtml = cleanBodyHtml(post.body);
  const bodyImageUrl = extractFirstImageUrl(bodyHtml);
  const pathImageUrl = buildImageUrl(post.image_path);
  const leadImageUrl =
    bodyImageUrl || (isUsableBlogImageUrl(pathImageUrl) ? pathImageUrl : null);

  return {
    ...normalizeBlogPostBase(post),
    imageUrl: leadImageUrl,
    bodyHtml: leadImageUrl ? removeBodyImages(bodyHtml).trim() : bodyHtml,
  };
}

export function getSortedBlogPosts() {
  return [...blogPosts]
    .sort((a, b) => new Date(b.created) - new Date(a.created))
    .map((post) => normalizeBlogPostBase(post));
}

export function getYearGroupByKey(key) {
  return YEAR_GROUPS.find((group) => group.key === key) || null;
}

export function getPostsForYearGroup(posts, group) {
  if (!group) {
    return [];
  }

  return posts.filter(
    (post) => post.year >= group.startYear && post.year <= group.endYear
  );
}

export function getBlogPostBySlug(slug) {
  if (!slug) {
    return null;
  }

  const rawPost = blogPosts.find((post) => post.slug === slug);

  if (!rawPost) {
    return null;
  }

  const normalizedPost = normalizeBlogPost(rawPost);
  const group =
    YEAR_GROUPS.find(
      (yearGroup) =>
        normalizedPost.year >= yearGroup.startYear &&
        normalizedPost.year <= yearGroup.endYear
    ) || null;

  return {
    ...normalizedPost,
    group,
  };
}
