import { motion } from 'framer-motion';

interface CategoryCardProps {
  icon: string;
  name: string;
  description?: string;
  tileClassName?: string;
  onClick: () => void;
}

export const CategoryCard = ({ icon, name, description, tileClassName, onClick }: CategoryCardProps) => {
  return (
    <motion.button
      // Hover is nice on desktop, but Android/touch relies on press feedback.
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      type="button"
      className="group flex w-full flex-col items-center gap-2 text-center select-none"
    >
      <div
        className={[
          'relative grid aspect-square w-full place-items-center overflow-hidden rounded-[22px] border border-input/70 bg-card shadow-soft transition-all',
          'active:shadow-sm',
          tileClassName ?? '',
        ].join(' ')}
      >
        {/* Subtle sheen always visible (more Android-like than hover-only). */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/25" />
        <div className="relative text-3xl leading-none">{icon}</div>
      </div>

      <div className="min-h-[2.25rem]">
        <h3 className="text-sm font-semibold leading-tight text-foreground">{name}</h3>
        {description ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </motion.button>
  );
};
