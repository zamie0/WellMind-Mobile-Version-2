import type { InAppCategory, InAppItem } from '@/types/wellmind';
import {
  communityMeta,
  communityItems,
  volunteeringMeta,
  volunteeringItems,
  programsMeta,
  programsItems,
  selfcareMeta,
  selfcareItems,
  resourcesMeta,
  resourcesItems,
  eventsMeta,
  eventsItems,
  mentorshipMeta,
  mentorshipItems,
} from './categories';

export const INAPP_CATEGORIES: Array<{
  id: InAppCategory;
  name: string;
  description: string;
  icon: string;
  tileClassName?: string;
}> = [
  communityMeta,
  volunteeringMeta,
  programsMeta,
  selfcareMeta,
  resourcesMeta,
  eventsMeta,
  mentorshipMeta,
];

const SAMPLE_ITEMS: Record<InAppCategory, InAppItem[]> = {
  community: communityItems,
  volunteering: volunteeringItems,
  programs: programsItems,
  selfcare: selfcareItems,
  resources: resourcesItems,
  events: eventsItems,
  mentorship: mentorshipItems,
};

export const getItemsByCategory = (category: InAppCategory): InAppItem[] => {
  return SAMPLE_ITEMS[category] || [];
};

export const getCategoryById = (category: InAppCategory) => {
  return INAPP_CATEGORIES.find((c) => c.id === category) ?? null;
};

export const getItemById = (category: InAppCategory, itemId: string) => {
  const items = getItemsByCategory(category);
  return items.find((i) => i.id === itemId) ?? null;
};

