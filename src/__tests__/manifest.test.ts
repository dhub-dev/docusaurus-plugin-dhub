import {describe, expect, it, vi} from 'vitest';
import {buildManifest} from '../manifest';
import type {ManifestPluginInput} from '../contentTypes';
import type {ResolvedDhubOptions} from '../options';

const options: ResolvedDhubOptions = {
  projectUrl: 'https://app.dhub.dev/c/acme/handbook',
  pathInRepo: 'website',
  editLink: true,
  editLinkLabel: 'Edit in Dhub',
  manifest: true,
};

const parsed = {
  appUrl: 'https://app.dhub.dev',
  teamSlug: 'acme',
  projectSlug: 'handbook',
};

const siteConfig = {
  url: 'https://docs.acme.com',
  baseUrl: '/',
  title: 'Acme Docs',
};

const i18n = {currentLocale: 'en', defaultLocale: 'en'};

function build(plugins: ManifestPluginInput[], warn?: (m: string) => void) {
  return buildManifest({
    plugins,
    siteConfig,
    i18n,
    options,
    parsed,
    pluginVersion: '0.1.0',
    warn: warn ?? (() => {}),
  });
}

describe('buildManifest', () => {
  it('maps docs routes across versions and plugin instances', () => {
    const manifest = build([
      {
        name: 'docusaurus-plugin-content-docs',
        options: {id: 'default'},
        content: {
          loadedVersions: [
            {
              versionName: 'current',
              docs: [
                {source: '@site/docs/intro.md', permalink: '/docs/next/intro'},
              ],
            },
            {
              versionName: '1.0.0',
              docs: [
                {
                  source: '@site/versioned_docs/version-1.0.0/intro.md',
                  permalink: '/docs/intro',
                },
              ],
            },
          ],
        },
      },
      {
        name: 'docusaurus-plugin-content-docs',
        options: {id: 'api'},
        content: {
          loadedVersions: [
            {
              versionName: 'current',
              docs: [{source: '@site/api/rest.md', permalink: '/api/rest'}],
            },
          ],
        },
      },
    ]);

    expect(manifest.routes).toEqual({
      '/docs/next/intro': {
        source: 'website/docs/intro.md',
        kind: 'doc',
        pluginId: 'default',
        version: 'current',
      },
      '/docs/intro': {
        source: 'website/versioned_docs/version-1.0.0/intro.md',
        kind: 'doc',
        pluginId: 'default',
        version: '1.0.0',
      },
      '/api/rest': {
        source: 'website/api/rest.md',
        kind: 'doc',
        pluginId: 'api',
        version: 'current',
      },
    });
  });

  it('skips draft docs', () => {
    const manifest = build([
      {
        name: '@docusaurus/plugin-content-docs',
        options: {},
        content: {
          loadedVersions: [
            {
              versionName: 'current',
              docs: [
                {
                  source: '@site/docs/wip.md',
                  permalink: '/docs/wip',
                  draft: true,
                },
              ],
            },
          ],
        },
      },
    ]);
    expect(manifest.routes).toEqual({});
  });

  it('maps blog and pages routes', () => {
    const manifest = build([
      {
        name: '@docusaurus/plugin-content-blog',
        options: {},
        content: {
          blogPosts: [
            {
              metadata: {
                source: '@site/blog/2026-01-01-hello/index.md',
                permalink: '/blog/hello',
              },
            },
          ],
        },
      },
      {
        name: '@docusaurus/plugin-content-pages',
        options: {},
        content: [
          {type: 'jsx', permalink: '/', source: '@site/src/pages/index.tsx'},
          {type: 'mdx', permalink: '/about', source: '@site/src/pages/about.mdx'},
        ],
      },
    ]);

    expect(manifest.routes).toEqual({
      '/blog/hello': {
        source: 'website/blog/2026-01-01-hello/index.md',
        kind: 'blog',
        pluginId: 'default',
      },
      '/': {
        source: 'website/src/pages/index.tsx',
        kind: 'page',
        pluginId: 'default',
        format: 'jsx',
      },
      '/about': {
        source: 'website/src/pages/about.mdx',
        kind: 'page',
        pluginId: 'default',
        format: 'mdx',
      },
    });
  });

  it('ignores unknown plugins and non-@site sources, warning once for the latter', () => {
    const warn = vi.fn();
    const manifest = build(
      [
        {name: 'some-other-plugin', options: {}, content: {whatever: true}},
        {
          name: '@docusaurus/plugin-content-docs',
          options: {},
          content: {
            loadedVersions: [
              {
                versionName: 'current',
                docs: [
                  {source: '/outside/site.md', permalink: '/docs/outside'},
                ],
              },
            ],
          },
        },
      ],
      warn,
    );
    expect(manifest.routes).toEqual({});
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toMatch(/skipped 1 route/);
  });

  it('warns on route collisions and keeps the last entry', () => {
    const warn = vi.fn();
    const manifest = build(
      [
        {
          name: '@docusaurus/plugin-content-docs',
          options: {},
          content: {
            loadedVersions: [
              {
                versionName: 'current',
                docs: [
                  {source: '@site/docs/a.md', permalink: '/same'},
                  {source: '@site/docs/b.md', permalink: '/same'},
                ],
              },
            ],
          },
        },
      ],
      warn,
    );
    expect(manifest.routes['/same']!.source).toBe('website/docs/b.md');
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/duplicate route/));
  });

  it('records site and dhub metadata', () => {
    const manifest = build([]);
    expect(manifest.version).toBe(1);
    expect(manifest.generator).toBe('docusaurus-plugin-dhub@0.1.0');
    expect(manifest.dhub).toEqual({
      appUrl: 'https://app.dhub.dev',
      teamSlug: 'acme',
      projectSlug: 'handbook',
      projectUrl: 'https://app.dhub.dev/c/acme/handbook',
    });
    expect(manifest.site).toEqual({
      url: 'https://docs.acme.com',
      baseUrl: '/',
      title: 'Acme Docs',
      pathInRepo: 'website',
      locale: 'en',
      defaultLocale: 'en',
    });
  });
});
