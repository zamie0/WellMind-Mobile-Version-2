import { motion } from 'framer-motion';
import { X, ExternalLink, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { InAppCategory } from '@/types/wellmind';
import { INAPP_CATEGORIES, getItemsByCategory } from './inAppData';
import { useNavigate } from 'react-router-dom';

interface CategoryModalProps {
  category: InAppCategory | null;
  onClose: () => void;
}

export const CategoryModal = ({ category, onClose }: CategoryModalProps) => {
  if (!category) return null;

  const navigate = useNavigate();
  const categoryInfo = INAPP_CATEGORIES.find((c) => c.id === category);
  const items = getItemsByCategory(category);

  if (!categoryInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-card shadow-lg"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-input/70 bg-card p-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {categoryInfo.icon} {categoryInfo.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{categoryInfo.description}</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-full p-2 hover:bg-muted transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3 p-6">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-input/70 bg-muted/40 p-8 text-center">
              <p className="text-muted-foreground">No items available yet. Check back soon!</p>
            </div>
          ) : (
            items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group rounded-3xl border border-input/70 bg-background p-5 transition-all active:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      {item.isPremium && (
                        <div className="flex items-center gap-1 rounded-full bg-coral/10 px-2 py-1">
                          <Lock className="h-3 w-3 text-coral" />
                          <span className="text-xs font-semibold text-coral">Premium</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
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
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    variant={item.link ? 'default' : 'secondary'}
                    size="sm"
                    className="shrink-0"
                    asChild={!!item.link}
                    onClick={!item.link ? () => {
                      onClose();
                      navigate(`/inapp/${category}/items/${item.id}`);
                    } : undefined}
                  >
                    {item.link ? (
                      <a
                        href={item.link}
                        className="flex items-center gap-2"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="flex items-center gap-2">Open</span>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-input/70 bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Explore more resources and opportunities in the WellMind app
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
