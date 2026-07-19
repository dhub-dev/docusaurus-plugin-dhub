import {siteSourceToRepoPath} from './common/paths';
import type {ParsedProjectUrl, ResolvedDhubOptions} from './options';
import type {
  BlogContent,
  DocsContent,
  ManifestPluginInput,
  PagesContent,
} from './contentTypes';

export type ManifestRoute = {
  source: string;
  kind: 'doc' | 'blog' | 'page';
  pluginId: string;
  version?: string;
  format?: 'jsx' | 'mdx';
};

export type DhubManifest = {
  version: 1;
  generator: string;
  dhub: {
    appUrl: string;
    teamSlug: string;
    projectSlug: string;
    projectUrl: string;
  };
  site: {
    url: string;
    baseUrl: string;
    title: string;
    pathInRepo: string;
    locale: string;
    defaultLocale: string;
  };
  routes: Record<string, ManifestRoute>;
};

// Plugin `name` fields are unscoped at runtime (e.g. "docusaurus-plugin-content-docs"),
// unlike their npm package names; accept both forms.
const DOCS_PLUGINS = new Set([
  'docusaurus-plugin-content-docs',
  '@docusaurus/plugin-content-docs',
]);
const BLOG_PLUGINS = new Set([
  'docusaurus-plugin-content-blog',
  '@docusaurus/plugin-content-blog',
]);
const PAGES_PLUGINS = new Set([
  'docusaurus-plugin-content-pages',
  '@docusaurus/plugin-content-pages',
]);

export function buildManifest(args: {
  plugins: readonly ManifestPluginInput[];
  siteConfig: {url: string; baseUrl: string; title: string};
  i18n: {currentLocale: string; defaultLocale: string};
  options: ResolvedDhubOptions;
  parsed: ParsedProjectUrl;
  pluginVersion: string;
  warn?: (message: string) => void;
}): DhubManifest {
  const {plugins, siteConfig, i18n, options, parsed, pluginVersion} = args;
  const warn = args.warn ?? ((message: string) => console.warn(message));
  const routes: Record<string, ManifestRoute> = {};
  let skippedNonSiteSources = 0;

  const setRoute = (permalink: string, entry: ManifestRoute) => {
    if (routes[permalink]) {
      warn(
        `[docusaurus-plugin-dhub] duplicate route "${permalink}" (${routes[permalink].source} vs ${entry.source}); keeping the latter`,
      );
    }
    routes[permalink] = entry;
  };

  const toRepoPath = (source: string): string | null => {
    const repoPath = siteSourceToRepoPath({
      source,
      pathInRepo: options.pathInRepo,
    });
    if (repoPath === null) {
      skippedNonSiteSources += 1;
    }
    return repoPath;
  };

  for (const plugin of plugins) {
    const pluginId = plugin.options.id ?? 'default';
    if (DOCS_PLUGINS.has(plugin.name)) {
      const content = plugin.content as DocsContent | undefined;
      for (const version of content?.loadedVersions ?? []) {
        for (const doc of version.docs) {
          if (doc.draft) {
            continue;
          }
          const source = toRepoPath(doc.source);
          if (source) {
            setRoute(doc.permalink, {
              source,
              kind: 'doc',
              pluginId,
              version: version.versionName,
            });
          }
        }
      }
    } else if (BLOG_PLUGINS.has(plugin.name)) {
      const content = plugin.content as BlogContent | undefined;
      for (const post of content?.blogPosts ?? []) {
        const source = toRepoPath(post.metadata.source);
        if (source) {
          setRoute(post.metadata.permalink, {source, kind: 'blog', pluginId});
        }
      }
    } else if (PAGES_PLUGINS.has(plugin.name)) {
      const content = plugin.content as PagesContent | undefined;
      for (const page of content ?? []) {
        const source = toRepoPath(page.source);
        if (source) {
          setRoute(page.permalink, {
            source,
            kind: 'page',
            pluginId,
            format: page.type,
          });
        }
      }
    }
  }

  if (skippedNonSiteSources > 0) {
    warn(
      `[docusaurus-plugin-dhub] skipped ${skippedNonSiteSources} route(s) whose source is outside the site directory`,
    );
  }

  return {
    version: 1,
    generator: `docusaurus-plugin-dhub@${pluginVersion}`,
    dhub: {
      appUrl: parsed.appUrl,
      teamSlug: parsed.teamSlug,
      projectSlug: parsed.projectSlug,
      projectUrl: options.projectUrl,
    },
    site: {
      url: siteConfig.url,
      baseUrl: siteConfig.baseUrl,
      title: siteConfig.title,
      pathInRepo: options.pathInRepo,
      locale: i18n.currentLocale,
      defaultLocale: i18n.defaultLocale,
    },
    routes,
  };
}
