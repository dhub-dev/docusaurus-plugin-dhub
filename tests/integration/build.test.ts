import {execFile, spawn} from 'node:child_process';
import {promisify} from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import {beforeAll, describe, expect, it} from 'vitest';

const execFileAsync = promisify(execFile);

const ROOT = path.resolve(__dirname, '../..');
const FIXTURE = path.join(ROOT, 'fixture');
const BUILD = path.join(FIXTURE, 'build');
const PROJECT_URL = 'https://app.dhub.dev/c/test-team/test-project';
/** The fixture's docs editUrl, from docusaurus.config.ts. */
const GITHUB_EDIT_URL =
  'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/';

function readBuiltHtml(...segments: string[]): string {
  return fs.readFileSync(path.join(BUILD, ...segments, 'index.html'), 'utf8');
}

/** Matches the anchor whether or not the HTML minifier stripped attribute quotes. */
function expectDhubLink(html: string, repoPath: string) {
  expect(html).toContain('dhub-edit-link');
  expect(html).toContain(`${PROJECT_URL}/${repoPath}`);
}

describe('fixture production build', () => {
  beforeAll(async () => {
    await execFileAsync('npm', ['run', 'build'], {cwd: ROOT});
    await execFileAsync('npm', ['run', 'build'], {
      cwd: FIXTURE,
      env: {...process.env},
    });
  });

  it('emits dhub.json with docs, blog, and pages routes', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(BUILD, 'dhub.json'), 'utf8'),
    );
    expect(manifest.version).toBe(1);
    expect(manifest.dhub).toEqual({
      appUrl: 'https://app.dhub.dev',
      teamSlug: 'test-team',
      projectSlug: 'test-project',
      projectUrl: PROJECT_URL,
    });
    expect(manifest.site.pathInRepo).toBe('fixture');

    expect(manifest.routes['/docs/next/intro']).toEqual({
      source: 'fixture/docs/intro.mdx',
      kind: 'doc',
      pluginId: 'default',
      version: 'current',
    });
    expect(manifest.routes['/docs/intro']).toEqual({
      source: 'fixture/versioned_docs/version-1.0.0/intro.mdx',
      kind: 'doc',
      pluginId: 'default',
      version: '1.0.0',
    });
    expect(manifest.routes['/blog/welcome']).toEqual({
      source: 'fixture/blog/2021-08-26-welcome/index.mdx',
      kind: 'blog',
      pluginId: 'default',
    });
    expect(manifest.routes['/']).toEqual({
      source: 'fixture/src/pages/index.tsx',
      kind: 'page',
      pluginId: 'default',
      format: 'jsx',
    });

    const kinds = Object.values(
      manifest.routes as Record<string, {kind: string}>,
    ).map((route) => route.kind);
    expect(kinds).toContain('doc');
    expect(kinds).toContain('blog');
    expect(kinds).toContain('page');
  });

  it('replaces the GitHub edit link on docs pages', () => {
    const html = readBuiltHtml('docs', 'next', 'intro');
    expectDhubLink(html, 'fixture/docs/intro.mdx');
    // 'replace' mode: the site's own edit link gives up the slot entirely
    expect(html).not.toContain(GITHUB_EDIT_URL);
    // …but Dhub occupies it, so the theme's edit-link styling still applies
    expect(html).toContain('theme-edit-this-page');
  });

  it('renders the Dhub edit link on versioned docs pages', () => {
    const html = readBuiltHtml('docs', 'intro');
    expectDhubLink(html, 'fixture/versioned_docs/version-1.0.0/intro.mdx');
  });

  it('renders the Dhub edit link on blog posts even without an editUrl', () => {
    const html = readBuiltHtml('blog', 'welcome');
    expectDhubLink(html, 'fixture/blog/2021-08-26-welcome/index.mdx');
  });

  it('does not render the Dhub edit link on blog list pages', () => {
    const html = readBuiltHtml('blog');
    expect(html).not.toContain('dhub-edit-link');
  });
});

describe("fixture built with editLink: 'alongside'", () => {
  const OUT_DIR = 'build-alongside';

  beforeAll(async () => {
    await execFileAsync('npm', ['run', 'build', '--', '--out-dir', OUT_DIR], {
      cwd: FIXTURE,
      env: {...process.env, DHUB_FIXTURE_EDIT_LINK: 'alongside'},
    });
  });

  it('keeps both edit links on docs pages', () => {
    const html = fs.readFileSync(
      path.join(FIXTURE, OUT_DIR, 'docs/next/intro/index.html'),
      'utf8',
    );
    expect(html).toContain('dhub-edit-link');
    expect(html).toContain(`${PROJECT_URL}/fixture/docs/intro.mdx`);
    expect(html).toContain(GITHUB_EDIT_URL);
  });
});

describe('fixture dev server', () => {
  it('compiles and serves a docs page', async () => {
    const port = 3457;
    const logPath = path.join(ROOT, 'tests/integration/.dev-server.log');
    const log = fs.openSync(logPath, 'w');
    const child = spawn(
      'npm',
      ['run', 'start', '--', '--no-open', '--port', String(port)],
      {
        cwd: FIXTURE,
        detached: true,
        stdio: ['ignore', log, log],
        // vitest sets NODE_ENV=test, which breaks the dev server bundler
        env: {...process.env, NODE_ENV: undefined},
      },
    );
    try {
      let ok = false;
      for (let i = 0; i < 90; i += 1) {
        try {
          const res = await fetch(`http://localhost:${port}/docs/next/intro`);
          if (res.status === 200) {
            ok = true;
            break;
          }
        } catch {
          // server not up yet
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      if (!ok) {
        // Surface the server log in the failure output
        console.error(fs.readFileSync(logPath, 'utf8'));
      }
      expect(ok).toBe(true);
    } finally {
      fs.closeSync(log);
      if (child.pid) {
        try {
          process.kill(-child.pid, 'SIGTERM');
        } catch {
          // already gone
        }
      }
    }
  });
});
