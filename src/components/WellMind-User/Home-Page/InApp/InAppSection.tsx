import { CategoryCard } from './CategoryCard';
import { INAPP_CATEGORIES } from './inAppData';
import { useNavigate } from 'react-router-dom';

export const InAppSection = () => {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-2">In-App & Community</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Explore resources, connect with others, and find support 💚
      </p>

      {/* Android-style: dense icon grid on mobile, expands on larger screens */}
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 sm:gap-4 md:grid-cols-6 lg:grid-cols-7">
        {INAPP_CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            icon={category.icon}
            name={category.name}
            description={category.description}
            tileClassName={category.tileClassName}
            onClick={() => navigate(`/inapp/${category.id}`)}
          />
        ))}
      </div>
    </section>
  );
};
