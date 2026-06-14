import { useGlobalSearchParams, usePathname } from 'expo-router';
import { useEffect } from 'react';

import { buildHistoryRoute, recordRoute } from '../utils/navigationHistory';

export function NavigationHistoryTracker() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    recordRoute(buildHistoryRoute(pathname, params));
  }, [params, pathname]);

  return null;
}
