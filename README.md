# docusaurus-plugin-dhub

Docusaurus integration for [Dhub](https://dhub.dev/docusaurus) — a visual editor for Docusaurus sites.

The plugin does two things:

1. **"Edit in Dhub" links** — adds an edit link to every docs page and blog post that opens that exact source file in the Dhub visual editor. Works alongside your existing GitHub "Edit this page" link, and also on sites (or blog instances) that have no `editUrl` configured.
2. **`dhub.json` manifest** — at build time, writes a manifest into your build output that maps every route (docs, blog, pages — including versioned docs) to its repo-relative source file. This lets Dhub resolve any URL on your live site to the exact file behind it.

## Requirements

- Docusaurus **3.5 or later** with the classic theme (`@docusaurus/preset-classic` or `@docusaurus/theme-classic`).
- A [Dhub](https://dhub.dev/docusaurus) project connected to your site's repository.

## Installation

```bash
npm install docusaurus-plugin-dhub
```

Then add the plugin to `docusaurus.config.js` / `docusaurus.config.ts`:

```ts
export default {
  // ...
  plugins: [
    [
      'docusaurus-plugin-dhub',
      {
        // Copy this from the Dhub editor address bar:
        projectUrl: 'https://app.dhub.dev/c/your-team/your-project',
      },
    ],
  ],
};
```

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `projectUrl` | `string` | **required** | Your Dhub project URL, e.g. `https://app.dhub.dev/c/your-team/your-project`. Copy it from the Dhub editor address bar. |
| `pathInRepo` | `string` | `''` | Path of the Docusaurus site inside your repository, for monorepos. E.g. `'website'` if your site lives in `website/`. Leave empty when the site is at the repo root. |
| `editLink` | `'replace'` \| `'alongside'` \| `false` | `'replace'` | How the edit link appears. See below. |
| `editLinkLabel` | `string` | `'Edit in Dhub'` | Label of the edit link. |
| `manifest` | `boolean` | `true` | Emit `dhub.json` into the build output. |

### Edit link modes

By default Dhub **takes over** the theme's existing "Edit this page" slot: one
link, in the place your theme already puts it, with the usual icon and styling.
Your `editUrl` link is not rendered.

```ts
editLink: 'alongside',
```

renders both instead. Use it on public open-source sites, where contributors
without access to your Dhub project still need the GitHub fork-and-PR path.

On sites (or blog instances) with no `editUrl` configured the theme renders no
edit slot at all, so the Dhub link is added on its own row below the footer.

### Monorepo example

If your repo looks like this:

```
my-repo/
├── packages/…
└── website/          ← the Docusaurus site
    ├── docs/
    └── docusaurus.config.ts
```

set `pathInRepo: 'website'` so edit links and the manifest point at `website/docs/…` (paths in Dhub are always repo-root-relative).

## The `dhub.json` manifest

Every production build writes `<build output>/dhub.json`:

```jsonc
{
  "version": 1,
  "generator": "docusaurus-plugin-dhub@0.1.0",
  "dhub": {
    "appUrl": "https://app.dhub.dev",
    "teamSlug": "your-team",
    "projectSlug": "your-project",
    "projectUrl": "https://app.dhub.dev/c/your-team/your-project"
  },
  "site": {
    "url": "https://docs.example.com",
    "baseUrl": "/",
    "title": "Example Docs",
    "pathInRepo": "website",
    "locale": "en",
    "defaultLocale": "en"
  },
  "routes": {
    "/docs/intro": {
      "source": "website/docs/intro.md",
      "kind": "doc",
      "pluginId": "default",
      "version": "current"
    },
    "/blog/welcome": {
      "source": "website/blog/welcome.md",
      "kind": "blog",
      "pluginId": "default"
    }
  }
}
```

Notes:

- Versioned docs map to their `versioned_docs/…` sources; the docs version is recorded per route.
- Multi-instance docs/blog plugins are supported (`pluginId` records the instance).
- Draft docs and generated pages (category indexes, tag pages, list pages) are omitted.
- On i18n sites, each locale's build output gets its own `dhub.json`.

## Customization

The edit link carries a stable `dhub-edit-link` CSS class:

```css
.dhub-edit-link {
  font-weight: 600;
}
```

For deeper customization, swizzle the components (`DhubEditLink`, the `DocItem/Footer` and `BlogPostItem/Footer` wrappers) — TypeScript sources ship with the package:

```bash
npm run swizzle docusaurus-plugin-dhub DhubEditLink -- --typescript --eject
```

## Limitations

- Requires the classic theme; sites built on other themes are not supported yet.
- The edit link is rendered for every visitor, like the conventional "Edit this page" link. It only opens the editor for people with access to your Dhub project; everyone else is asked to sign in.
- Visitors who are signed out land on the Dhub dashboard after signing in, not on the file they clicked through from. Set `editLink: false` if that matters more to you than the shortcut for your team.

## Development

```bash
npm install        # installs the plugin + the fixture site workspace
npm run build      # compiles node + theme code to lib/
npm test           # unit tests
npm run test:integration   # builds the fixture site, asserts dhub.json + rendered links
```

## License

MIT
