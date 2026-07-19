const SITE_ALIAS = '@site/';

/**
 * Converts a Docusaurus content `source` (which uses the `@site/` alias for
 * the site directory) into a repo-root-relative path. Returns null for
 * sources outside the site dir (e.g. generated or plugin-provided content).
 */
export function siteSourceToRepoPath(args: {
  source: string;
  pathInRepo: string;
}): string | null {
  const {source, pathInRepo} = args;
  if (!source.startsWith(SITE_ALIAS)) {
    return null;
  }
  const sitePath = source.slice(SITE_ALIAS.length);
  return pathInRepo ? `${pathInRepo}/${sitePath}` : sitePath;
}

export function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/** Normalizes a pathInRepo option: strips `./` prefixes and slashes at both ends. */
export function normalizePathInRepo(input: string): string {
  return input
    .replace(/^(\.\/)+/, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
}
