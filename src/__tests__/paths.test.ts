import {describe, expect, it} from 'vitest';
import {
  joinUrl,
  normalizePathInRepo,
  siteSourceToRepoPath,
} from '../common/paths';

describe('siteSourceToRepoPath', () => {
  it('strips @site/ when the site is at the repo root', () => {
    expect(
      siteSourceToRepoPath({source: '@site/docs/intro.md', pathInRepo: ''}),
    ).toBe('docs/intro.md');
  });

  it('prepends pathInRepo for monorepo sites', () => {
    expect(
      siteSourceToRepoPath({
        source: '@site/docs/intro.md',
        pathInRepo: 'website',
      }),
    ).toBe('website/docs/intro.md');
  });

  it('handles versioned docs sources', () => {
    expect(
      siteSourceToRepoPath({
        source: '@site/versioned_docs/version-1.0.0/intro.md',
        pathInRepo: 'website',
      }),
    ).toBe('website/versioned_docs/version-1.0.0/intro.md');
  });

  it('handles i18n sources', () => {
    expect(
      siteSourceToRepoPath({
        source: '@site/i18n/fr/docusaurus-plugin-content-docs/current/intro.md',
        pathInRepo: '',
      }),
    ).toBe('i18n/fr/docusaurus-plugin-content-docs/current/intro.md');
  });

  it('returns null for non-@site sources', () => {
    expect(
      siteSourceToRepoPath({source: '/generated/foo.md', pathInRepo: ''}),
    ).toBeNull();
  });
});

describe('joinUrl', () => {
  it('joins without duplicate slashes', () => {
    expect(joinUrl('https://app.dhub.dev/c/t/p/', '/docs/intro.md')).toBe(
      'https://app.dhub.dev/c/t/p/docs/intro.md',
    );
    expect(joinUrl('https://app.dhub.dev/c/t/p', 'docs/intro.md')).toBe(
      'https://app.dhub.dev/c/t/p/docs/intro.md',
    );
  });
});

describe('normalizePathInRepo', () => {
  it('strips ./ prefix and surrounding slashes', () => {
    expect(normalizePathInRepo('./website/')).toBe('website');
    expect(normalizePathInRepo('/website')).toBe('website');
    expect(normalizePathInRepo('website')).toBe('website');
    expect(normalizePathInRepo('')).toBe('');
    expect(normalizePathInRepo('apps/docs')).toBe('apps/docs');
  });
});
