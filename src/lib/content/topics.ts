import { TOPICS, type Topic } from "@/types/content";

export type TopicMeta = {
  slug: Topic;
  label: string;
  description: string;
};

/** Static editorial config for the fixed topic taxonomy. */
export const TOPIC_META: Record<Topic, TopicMeta> = {
  science: {
    slug: "science",
    label: "Science",
    description: "Reporting and essays on discovery, research, and the natural world.",
  },
  biotechnology: {
    slug: "biotechnology",
    label: "Biotechnology",
    description: "The science and business of engineering biology.",
  },
  entrepreneurship: {
    slug: "entrepreneurship",
    label: "Entrepreneurship",
    description: "Building companies, and the ideas behind them.",
  },
  technology: {
    slug: "technology",
    label: "Technology",
    description: "How technology is built, and what it changes.",
  },
  storytelling: {
    slug: "storytelling",
    label: "Storytelling",
    description: "Narrative nonfiction, fiction, and the craft of telling a story.",
  },
  philosophy: {
    slug: "philosophy",
    label: "Philosophy",
    description: "Ideas about how to think, live, and reason.",
  },
  ideas: {
    slug: "ideas",
    label: "Ideas",
    description: "Essays that don't fit neatly anywhere else.",
  },
};

export const ALL_TOPICS: TopicMeta[] = TOPICS.map((t) => TOPIC_META[t]);

export function getTopicMeta(slug: string): TopicMeta | undefined {
  return (TOPIC_META as Record<string, TopicMeta>)[slug];
}
