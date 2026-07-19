import fs from 'fs/promises';
import path from 'path';
import type {LoadContext, Plugin} from '@docusaurus/types';
import {parseProjectUrl} from './options';
import type {ResolvedDhubOptions} from './options';
import {buildManifest} from './manifest';

export const PLUGIN_NAME = 'docusaurus-plugin-dhub';

const {version: PLUGIN_VERSION} = require('../package.json') as {
  version: string;
};

export default function pluginDhub(
  _context: LoadContext,
  options: ResolvedDhubOptions,
): Plugin<undefined> {
  const parsed = parseProjectUrl(options.projectUrl);

  return {
    name: PLUGIN_NAME,

    getThemePath: () => '../lib/theme',
    getTypeScriptThemePath: () => '../src/theme',

    contentLoaded({actions}) {
      actions.setGlobalData({
        projectUrl: options.projectUrl,
        pathInRepo: options.pathInRepo,
        editLink: options.editLink,
        editLinkLabel: options.editLinkLabel,
        appUrl: parsed.appUrl,
        teamSlug: parsed.teamSlug,
        projectSlug: parsed.projectSlug,
      });
    },

    async postBuild(props) {
      if (!options.manifest) {
        return;
      }
      const manifest = buildManifest({
        plugins: props.plugins.map((plugin) => ({
          name: plugin.name,
          options: {id: (plugin.options as {id?: string}).id},
          content: plugin.content,
        })),
        siteConfig: {
          url: props.siteConfig.url,
          baseUrl: props.siteConfig.baseUrl,
          title: props.siteConfig.title,
        },
        i18n: {
          currentLocale: props.i18n.currentLocale,
          defaultLocale: props.i18n.defaultLocale,
        },
        options,
        parsed,
        pluginVersion: PLUGIN_VERSION,
      });
      await fs.writeFile(
        path.join(props.outDir, 'dhub.json'),
        `${JSON.stringify(manifest, null, 2)}\n`,
      );
    },
  };
}

export {validateOptions} from './options';
export type {
  DhubPluginOptions,
  ResolvedDhubOptions,
  ParsedProjectUrl,
} from './options';
export type {DhubManifest, ManifestRoute} from './manifest';
