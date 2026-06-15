import { router } from 'expo-router';

const MAX_HISTORY_LENGTH = 50;
const FALLBACK_ROUTE = '/(tabs)';

let routeHistory: string[] = [];

function stringifyParam(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function isPathParam(pathname: string, value: string) {
  return pathname.split('/').some(segment => segment === value);
}

function stripQuery(route: string) {
  return route.split('?')[0];
}

function normalizeHistoryRoute(route: string) {
  return route === '/' ? FALLBACK_ROUTE : route;
}

function getHierarchicalFallback(route: string) {
  const pathname = stripQuery(normalizeHistoryRoute(route));

  if (pathname.includes('/perfil/ticket')) return '/perfil/wallet';
  if (pathname.includes('/perfil/wallet')) return '/perfil/profile';
  if (pathname.includes('/perfil/profile')) return '/(tabs)';
  if (pathname.includes('/perfil/edit-profile')) return '/perfil/profile';
  if (pathname.includes('/perfil/security')) return '/perfil/profile';
  if (pathname.includes('/perfil/notifications-settings')) return '/perfil/profile';
  if (pathname.includes('/friends/') || pathname.includes('/friends/friend-profile')) {
    return '/(tabs)/friends';
  }
  if (pathname.includes('/addfriend')) return '/(tabs)/friends';
  if (pathname.includes('/qrcode-scan')) return '/perfil/profile';
  if (pathname.includes('/event-details/')) return '/(tabs)';
  if (pathname.includes('/activity-details/')) return '/(tabs)';
  if (pathname.includes('/onboarding/step3')) return '/onboarding/step2';
  if (pathname.includes('/onboarding/step2')) return '/onboarding/step1';

  return FALLBACK_ROUTE;
}

export function buildHistoryRoute(
  pathname: string | null | undefined,
  params: Record<string, string | string[] | undefined>,
) {
  if (!pathname) {
    return '';
  }

  if (pathname === '/') {
    return FALLBACK_ROUTE;
  }

  const query = Object.entries(params)
    .filter(([, value]) => {
      if (value === undefined || value === '') {
        return false;
      }

      const normalizedValue = stringifyParam(value as string | string[]);
      return !isPathParam(pathname, normalizedValue);
    })
    .map(([key, value]) => {
      const normalizedValue = stringifyParam(value as string | string[]);
      return `${encodeURIComponent(key)}=${encodeURIComponent(normalizedValue)}`;
    })
    .sort()
    .join('&');

  return query ? `${pathname}?${query}` : pathname;
}

export function recordRoute(route: string) {
  if (!route) {
    return;
  }

  route = normalizeHistoryRoute(route);

  const currentRoute = normalizeHistoryRoute(routeHistory[routeHistory.length - 1] ?? '');

  if (route === currentRoute) {
    return;
  }

  const previousRoute = normalizeHistoryRoute(routeHistory[routeHistory.length - 2] ?? '');

  if (route === previousRoute) {
    routeHistory.pop();
    return;
  }

  const existingIndex = routeHistory.lastIndexOf(route);

  if (existingIndex !== -1) {
    routeHistory.splice(existingIndex, 1);
  }

  routeHistory.push(route);

  if (routeHistory.length > MAX_HISTORY_LENGTH) {
    routeHistory = routeHistory.slice(-MAX_HISTORY_LENGTH);
  }
}

export function navigateToPreviousRoute(fallbackRoute = FALLBACK_ROUTE) {
  const currentRoute = normalizeHistoryRoute(routeHistory[routeHistory.length - 1] ?? '');

  while (
    routeHistory.length > 1 &&
    normalizeHistoryRoute(routeHistory[routeHistory.length - 2] ?? '') === currentRoute
  ) {
    routeHistory.splice(routeHistory.length - 2, 1);
  }

  const previousRoute = normalizeHistoryRoute(routeHistory[routeHistory.length - 2] ?? '');

  if (previousRoute && previousRoute !== currentRoute) {
    routeHistory.pop();
    router.replace(normalizeHistoryRoute(previousRoute) as never);
    return;
  }

  const resolvedFallbackRoute =
    fallbackRoute === FALLBACK_ROUTE && currentRoute
      ? getHierarchicalFallback(currentRoute)
      : fallbackRoute;

  router.replace(resolvedFallbackRoute as never);
}
