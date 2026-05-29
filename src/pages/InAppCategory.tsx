import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { InAppCategory } from '@/types/wellmind';
import { getCategoryById, getItemsByCategory } from '@/components/WellMind-User/Home-Page/InApp/inAppData';

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

export const InAppCategoryPage = () => {
  const navigate = useNavigate();
  const { category: rawCategory } = useParams();

  const category = useMemo(() => {
    if (!isInAppCategory(rawCategory)) return null;
    return rawCategory;
  }, [rawCategory]);

  const categoryInfo = category ? getCategoryById(category) : null;
  const items = category ? getItemsByCategory(category) : [];

  if (!category || !categoryInfo) {
    return (
      <div className="min-h-screen bg-background flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">In-App</h1>
        </div>

        <div className="flex-1 p-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Category not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-2xl">{categoryInfo.icon}</span>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-foreground leading-tight">{categoryInfo.name}</h1>
          <p className="text-xs text-muted-foreground line-clamp-1">{categoryInfo.description}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-10">
        {items.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/inapp/${category}/items/${item.id}`)}
            className="w-full text-left rounded-2xl border border-border bg-card p-4 transition active:bg-muted/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-foreground truncate">{item.title}</h2>
                  {item.isPremium ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-coral/10 px-2 py-0.5">
                      <Lock className="h-3 w-3 text-coral" />
                      <span className="text-[11px] font-semibold text-coral">Premium</span>
                    </span>
                  ) : null}
                  {item.link ? <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" /> : null}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                {item.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
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
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default InAppCategoryPage;

