/**
 * Minimal structural mirrors of the content shapes loaded by the official
 * Docusaurus content plugins — only the fields the manifest reads. Kept
 * structural (rather than importing plugin types) so the manifest builder
 * stays decoupled from plugin internals and easy to unit-test.
 */

export type DocsDoc = {
  source: string;
  permalink: string;
  draft?: boolean;
};

export type DocsVersion = {
  versionName: string;
  docs: DocsDoc[];
};

export type DocsContent = {loadedVersions: DocsVersion[]};

export type BlogContent = {
  blogPosts: {metadata: {source: string; permalink: string}}[];
};

export type PageMeta = {
  type: 'jsx' | 'mdx';
  permalink: string;
  source: string;
};

export type PagesContent = PageMeta[];

export type ManifestPluginInput = {
  name: string;
  options: {id?: string};
  content: unknown;
};
