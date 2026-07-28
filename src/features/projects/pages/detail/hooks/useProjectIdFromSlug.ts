import { useQuery } from '@tanstack/react-query';
import projectsService from '../../../services/projects.service';
import { extractIdMatcher } from '../../../../../lib/slug';

/** Resuelve el slug de la URL (`/projects/:slug`) al id real del proyecto. */
export function useProjectIdFromSlug(slug: string | undefined) {
  const matcher = slug ? extractIdMatcher(slug) : null;

  const query = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: () => projectsService.getAll(),
    enabled: !!matcher,
  });

  const id = query.data?.find((p) => p.id === matcher || p.id.startsWith(matcher!))?.id ?? null;
  const notFound = query.isSuccess && !id;

  return { id, isLoading: query.isLoading, notFound };
}
