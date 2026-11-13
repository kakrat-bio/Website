import { TOPICS, type Topic } from "@/types/content";

export type TopicMeta = {
  slug: Topic;
  label: string;
  description: string;
  /** One wry line shown as the lead under the heading on the topic page. Not used for metadata. */
  tagline: string;
};

/** Static editorial config for the fixed topic taxonomy. */
export const TOPIC_META: Record<Topic, TopicMeta> = {
  "science-technology": {
    slug: "science-technology",
    label: "Science & Technology",
    description: "Discovery, biotechnology, engineering, and the technologies reshaping the world.",
    tagline: "The breakthrough, the fine print, and the mouse it actually worked in.",
  },
  "business-innovation": {
    slug: "business-innovation",
    label: "Business & Innovation",
    description: "Entrepreneurship, strategy, companies, and how new ideas become real.",
    tagline: "Where a good idea meets a pitch deck, a regulator and a bank balance.",
  },
  "culture-ideas": {
    slug: "culture-ideas",
    label: "Culture & Ideas",
    description: "Philosophy, storytelling, language, culture, and the ideas behind how we live.",
    tagline: "Language, family, politics and other arguments nobody wins.",
  },
};

export const ALL_TOPICS: TopicMeta[] = TOPICS.map((t) => TOPIC_META[t]);

export function getTopicMeta(slug: string): TopicMeta | undefined {
  return (TOPIC_META as Record<string, TopicMeta>)[slug];
}
