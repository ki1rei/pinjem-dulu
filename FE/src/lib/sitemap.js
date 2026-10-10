import fs from 'fs';
import path from 'path';

const SKIP_GROUPS = new Set(['(peminjam)', '(pj)']);

/**
 * Crawl folder app untuk rute publik.
 * Mengabaikan grup dashboard, API, dan folder internal.
 */
export function getAppRoutes(baseDir = 'src/app') {
  const absoluteBaseDir = path.resolve(process.cwd(), baseDir);
  const routes = [];

  function crawl(currentDir, currentRoute = '') {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory()) {
        const name = item.name;

        if (name.startsWith('_') || name === 'api' || SKIP_GROUPS.has(name)) continue;

        const nextRouteSegment = name.startsWith('(') && name.endsWith(')') ? '' : name;
        const nextRoute = path.join(currentRoute, nextRouteSegment);

        crawl(path.join(currentDir, name), nextRoute);
      } else if (item.isFile() && (item.name === 'page.jsx' || item.name === 'page.js')) {
        let normalizedRoute = currentRoute.replace(/\\/g, '/');

        if (!normalizedRoute || normalizedRoute === '.') {
          normalizedRoute = '/';
        } else {
          if (!normalizedRoute.startsWith('/')) {
            normalizedRoute = '/' + normalizedRoute;
          }
          if (normalizedRoute.endsWith('/')) {
            normalizedRoute = normalizedRoute.slice(0, -1);
          }
        }

        if (!routes.includes(normalizedRoute)) {
          routes.push(normalizedRoute);
        }
      }
    }
  }

  if (fs.existsSync(absoluteBaseDir)) {
    crawl(absoluteBaseDir);
  }

  return routes;
}
