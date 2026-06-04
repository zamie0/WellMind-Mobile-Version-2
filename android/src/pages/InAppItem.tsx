import { Navigate, useParams } from 'react-router-dom';

const CATEGORY_ROUTES: Record<string, string> = {
  community: '/community',
  volunteering: '/volunteering',
  programs: '/programs',
  resources: '/resources',
  events: '/events',
  mentorship: '/mentorship',
  selfcare: '/self-assessment',
};

export const InAppItemPage = () => {
  const { category } = useParams();
  return <Navigate to={category ? CATEGORY_ROUTES[category] ?? '/' : '/'} replace />;
};

export default InAppItemPage;
