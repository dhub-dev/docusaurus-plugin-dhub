import {describe, expect, it} from 'vitest';
import {normalizePluginOptions} from '@docusaurus/utils-validation';
import {parseProjectUrl, validateOptions} from '../options';
import type {DhubPluginOptions} from '../options';

function validate(options: DhubPluginOptions) {
  return validateOptions({
    validate: normalizePluginOptions,
    options,
  });
}

describe('parseProjectUrl', () => {
  it('parses a canonical project URL', () => {
    expect(parseProjectUrl('https://app.dhub.dev/c/acme-docs/handbook')).toEqual(
      {
        appUrl: 'https://app.dhub.dev',
        teamSlug: 'acme-docs',
        projectSlug: 'handbook',
      },
    );
  });

  it('accepts a trailing slash', () => {
    expect(
      parseProjectUrl('https://app.dhub.dev/c/acme-docs/handbook/'),
    ).toEqual({
      appUrl: 'https://app.dhub.dev',
      teamSlug: 'acme-docs',
      projectSlug: 'handbook',
    });
  });

  it('accepts non-default hosts (self-hosted / local dev)', () => {
    expect(parseProjectUrl('http://localhost:3000/c/t/p')).toEqual({
      appUrl: 'http://localhost:3000',
      teamSlug: 't',
      projectSlug: 'p',
    });
  });

  it('rejects URLs with extra path segments (a file URL, not a project URL)', () => {
    expect(() =>
      parseProjectUrl('https://app.dhub.dev/c/acme/handbook/docs/intro.md'),
    ).toThrow(/must look like/);
  });

  it('rejects non-/c/ paths', () => {
    expect(() => parseProjectUrl('https://app.dhub.dev/t/acme')).toThrow(
      /must look like/,
    );
  });

  it('rejects invalid URLs', () => {
    expect(() => parseProjectUrl('not a url')).toThrow(/not a valid URL/);
  });
});

describe('validateOptions', () => {
  it('applies defaults', () => {
    expect(
      validate({projectUrl: 'https://app.dhub.dev/c/acme/handbook'}),
    ).toEqual({
      // Docusaurus injects the plugin instance id during normalization
      id: 'default',
      projectUrl: 'https://app.dhub.dev/c/acme/handbook',
      pathInRepo: '',
      editLink: 'replace',
      editLinkLabel: 'Edit in Dhub',
      manifest: true,
    });
  });

  it.each(['replace', 'alongside'] as const)(
    'accepts editLink: %s',
    (mode) => {
      expect(
        validate({
          projectUrl: 'https://app.dhub.dev/c/acme/handbook',
          editLink: mode,
        }).editLink,
      ).toBe(mode);
    },
  );

  it('accepts editLink: false', () => {
    expect(
      validate({
        projectUrl: 'https://app.dhub.dev/c/acme/handbook',
        editLink: false,
      }).editLink,
    ).toBe(false);
  });

  it('rejects an unknown editLink mode', () => {
    expect(() =>
      validate({
        projectUrl: 'https://app.dhub.dev/c/acme/handbook',
        // @ts-expect-error — deliberately invalid
        editLink: 'both',
      }),
    ).toThrow(/editLink/);
  });

  it('strips the trailing slash from projectUrl', () => {
    expect(
      validate({projectUrl: 'https://app.dhub.dev/c/acme/handbook/'}).projectUrl,
    ).toBe('https://app.dhub.dev/c/acme/handbook');
  });

  it('normalizes pathInRepo', () => {
    expect(
      validate({
        projectUrl: 'https://app.dhub.dev/c/acme/handbook',
        pathInRepo: './website/',
      }).pathInRepo,
    ).toBe('website');
  });

  it('rejects a missing projectUrl', () => {
    expect(() => validate({} as DhubPluginOptions)).toThrow(/projectUrl/);
  });

  it('rejects a malformed projectUrl', () => {
    expect(() =>
      validate({projectUrl: 'https://app.dhub.dev/nope'}),
    ).toThrow();
  });
});
