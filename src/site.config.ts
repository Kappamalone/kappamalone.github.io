import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  // Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
  author: "Uzman Zawahir",
  // Meta property used to construct the meta title property, found in src/components/BaseHead.astro L:11
  title: "Uzman's Corner",
  // Meta property used as the default description meta property
  description: "A blog to write about whatever cool things I do",
  // HTML lang property, found in src/layouts/Base.astro L:18
  lang: "en-GB",
  // Meta property, found in src/components/BaseHead.astro L:42
  ogLocale: "en_GB",
  // Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
  date: {
    locale: "en-GB",
    options: {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  },
  webmentions: {
    link: "",
  },
};

// Used to generate links in both the Header & Footer.
export const menuLinks: Array<{ title: string; path: string }> = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "Blog",
    path: "/posts/",
  },
  {
    title: "Resume",
    path: "https://docs.google.com/document/d/18ROt-yNcnmq2gU8oq0J8VpmqWYHx6-gCS0z0fhmsWMA/edit?usp=sharing",
  },
];
