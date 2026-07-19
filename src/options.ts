import {Joi} from '@docusaurus/utils-validation';
import type {OptionValidationContext} from '@docusaurus/types';
import {normalizePathInRepo} from './common/paths';

export type DhubEditLinkMode = 'replace' | 'alongside' | false;

export type DhubPluginOptions = {
  /** Dhub project URL, e.g. https://app.dhub.dev/c/my-team/my-project — copy it from the Dhub editor address bar. */
  projectUrl: string;
  /** Path of the Docusaurus site inside the repo, e.g. "website" for monorepos. Default: "" (site at repo root). */
  pathInRepo?: string;
  /**
   * How the "Edit in Dhub" link appears on docs pages and blog posts.
   * - `'replace'` (default): Dhub takes over the theme's edit-link slot; the
   *   site's own "Edit this page" link is not rendered.
   * - `'alongside'`: both links are rendered next to each other, preserving a
   *   GitHub fork-and-PR path for contributors without Dhub access.
   * - `false`: no edit link.
   */
  editLink?: DhubEditLinkMode;
  /** Label of the edit link. Default: "Edit in Dhub". */
  editLinkLabel?: string;
  /** Emit dhub.json (route → source manifest) into the build output. Default: true. */
  manifest?: boolean;
};

export type ResolvedDhubOptions = Required<DhubPluginOptions>;

export type ParsedProjectUrl = {
  appUrl: string;
  teamSlug: string;
  projectSlug: string;
};

const PROJECT_PATH_RE = /^\/c\/([^/]+)\/([^/]+)\/?$/;

export function parseProjectUrl(projectUrl: string): ParsedProjectUrl {
  let url: URL;
  try {
    url = new URL(projectUrl);
  } catch {
    throw new Error(
      `[docusaurus-plugin-dhub] projectUrl is not a valid URL: "${projectUrl}"`,
    );
  }
  const match = url.pathname.match(PROJECT_PATH_RE);
  if (!match) {
    throw new Error(
      `[docusaurus-plugin-dhub] projectUrl must look like https://app.dhub.dev/c/{team}/{project} — copy it from the Dhub editor address bar. Got: "${projectUrl}"`,
    );
  }
  return {appUrl: url.origin, teamSlug: match[1]!, projectSlug: match[2]!};
}

const optionsSchema = Joi.object<ResolvedDhubOptions>({
  projectUrl: Joi.string()
    .required()
    .custom((value: string) => {
      parseProjectUrl(value);
      return value.replace(/\/+$/, '');
    }),
  pathInRepo: Joi.string()
    .allow('')
    .default('')
    .custom((value: string) => normalizePathInRepo(value)),
  editLink: Joi.alternatives()
    .try(Joi.string().valid('replace', 'alongside'), Joi.boolean().valid(false))
    .default('replace')
    .messages({
      'alternatives.match':
        '[docusaurus-plugin-dhub] editLink must be "replace", "alongside", or false.',
    }),
  editLinkLabel: Joi.string().default('Edit in Dhub'),
  manifest: Joi.boolean().default(true),
});

export function validateOptions({
  validate,
  options,
}: OptionValidationContext<
  DhubPluginOptions,
  ResolvedDhubOptions
>): ResolvedDhubOptions {
  return validate(optionsSchema, options);
}
