import {usePluginData} from '@docusaurus/useGlobalData';
import type {DhubEditLinkMode} from '../../options';
import {joinUrl, siteSourceToRepoPath} from '../../common/paths';

export type DhubPluginData = {
  projectUrl: string;
  pathInRepo: string;
  editLink: DhubEditLinkMode;
  editLinkLabel: string;
  appUrl: string;
  teamSlug: string;
  projectSlug: string;
};

export type DhubEditTarget = {
  href: string;
  label: string;
  mode: 'replace' | 'alongside';
};

/**
 * Resolves a page source into a Dhub editor link, or null when no link should
 * be rendered — the edit link is disabled, there is no source in context, or
 * the source lives outside the site directory (a non-`@site/` path, which we
 * cannot map to a repo file).
 */
export function useDhubEditUrl(source: string | null): DhubEditTarget | null {
  const data = usePluginData('docusaurus-plugin-dhub') as DhubPluginData;
  if (!data || data.editLink === false || !source) {
    return null;
  }
  const repoPath = siteSourceToRepoPath({
    source,
    pathInRepo: data.pathInRepo,
  });
  if (!repoPath) {
    return null;
  }
  return {
    href: joinUrl(data.projectUrl, repoPath),
    label: data.editLinkLabel,
    mode: data.editLink,
  };
}
