import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

/** Compile real modules, replacing only browser persistence at the test boundary. */
export async function tsLoader(stubs = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'nyx-learning-'));
  const cache = new Map();
  async function compile(url) {
    if (cache.has(url.href)) return cache.get(url.href);
    const target = pathToFileURL(join(directory, `${cache.size}.mjs`)).href;
    cache.set(url.href, target);
    let source = stubs[url.pathname.split('/src/')[1]];
    if (source === undefined) {
      source = ts.transpileModule(await readFile(url, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
      const imports = [...source.matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/g)];
      for (const match of imports) {
        const specifier = match[1];
        const replacement = specifier.startsWith('@/') ? await compile(new URL(`../../src/${specifier.slice(2)}.ts`, import.meta.url))
          : specifier.startsWith('.') ? await compile(new URL(`${specifier}.ts`, url)) : import.meta.resolve(specifier);
        source = source.replaceAll(`'${specifier}'`, `'${replacement}'`).replaceAll(`"${specifier}"`, `"${replacement}"`);
      }
    }
    await writeFile(fileURLToPath(target), source, 'utf8');
    return target;
  }
  return { load: async (path) => import(await compile(new URL(`../../src/${path}.ts`, import.meta.url))), cleanup: () => rm(directory, { recursive: true, force: true }) };
}
