import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { InAppCategory } from '@/types/wellmind';
import { getCategoryById, getItemById } from '@/components/WellMind-User/Home-Page/InApp/inAppData';

const CATEGORIES: InAppCategory[] = [
  'community',
  'volunteering',
  'programs',
  'selfcare',
  'resources',
  'events',
  'mentorship',
];

function isInAppCategory(value: string | undefined): value is InAppCategory {
  return !!value && (CATEGORIES as string[]).includes(value);
}

export const InAppItemPage = () => {
  const navigate = useNavigate();
  const { category: rawCategory, itemId } = useParams();

  const category = useMemo(() => {
    if (!isInAppCategory(rawCategory)) return null;
    return rawCategory;
  }, [rawCategory]);

  const categoryInfo = category ? getCategoryById(category) : null;
  const item = category && itemId ? getItemById(category, itemId) : null;

  if (!category || !categoryInfo || !item) {
    return (
      <div className="min-h-screen bg-background flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Item</h1>
        </div>
        <div className="flex-1 p-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Item not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => navigate(`/inapp/${category}`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-2xl">{categoryInfo.icon}</span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground leading-tight">{categoryInfo.name}</p>
          <h1 className="text-lg font-semibold text-foreground leading-tight line-clamp-1">{item.title}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">About</h2>
            {item.isPremium ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-coral/10 px-2 py-0.5">
                <Lock className="h-3 w-3 text-coral" />
                <span className="text-[11px] font-semibold text-coral">Premium</span>
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.description}</p>

          {item.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full bg-muted/60 px-2 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </motion.div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="text-base font-semibold text-foreground">Action</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {item.link
              ? 'Open the official page for this activity/resource.'
              : 'This item is available in-app. You can start from here.'}
          </p>

          <div className="mt-4 flex gap-3">
            {item.link ? (
              <Button asChild className="flex-1">
                <a href={item.link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                  Open link
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button className="flex-1" onClick={() => navigate('/peer')}>
                Start now
              </Button>
            )}
            <Button variant="outline" className="flex-1" onClick={() => navigate(`/inapp/${category}`)}>
              Back to list
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InAppItemPage;

