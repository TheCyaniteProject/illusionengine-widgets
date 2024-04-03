import { context } from 'esbuild';
import fs from 'fs/promises';
import { existsSync } from 'fs';

/** @type import("esbuild").Plugin */
const copyHtmlPlugin = {
  name: "HTMLPlugin",
  setup(pluginBuild) {
    pluginBuild.onLoad({ filter: /.*\.[tj]sx?/ }, async ({ path }) => {
      const { outdir, outbase } = pluginBuild.initialOptions;
      try {
        const [, filepath, filename] = path
          .replace(process.cwd(), '.') //make path relative
          .replaceAll(/\\+/g, '/') //convert windows path to unix
          .split(/(.*)\/(.*)/); //split into path and filename [<empty string>, path, filename]

        const destinationPath = `${outdir}`;
        const htmlFilename = `${filename.split(/(.*)\..*/)[1]}.html`;
        if (!existsSync(`${filepath}/${htmlFilename}`)) return;
        await fs.mkdir(destinationPath, { recursive: true });
        await fs.copyFile(`${filepath}/${htmlFilename}`, `${destinationPath}/${htmlFilename}`);
        return { watchFiles: [`${filepath}/${htmlFilename}`] };
      } catch (e) { console.log(e); };
    });
  }
};

/** @type import("esbuild").Plugin */
const copyWidgetPlugin = {
  name: "HTMLPlugin",
  setup(pluginBuild) {

    pluginBuild.onEnd(async () => {
      const {
        entryPoints: [widgetGlob],
        outdir,
        outbase
      } = pluginBuild.initialOptions;

      const [, path] = widgetGlob.split(/(.*)\/.*/);
      const widgetJson = `${path}/widget.json`;
      const destinationPath = `${outdir}`;

      if (!existsSync(widgetJson)) return;
      await fs.mkdir(destinationPath, { recursive: true, });
      await fs.copyFile(widgetJson, `${destinationPath}/widget.json`);
    });
  }
};

const widgets = [
  "booty",
  "clock",
  "duckwidget",
  "widget"
].map(dir => [dir, `${dir}/*.ts`]);

export const createWidgetContexts = (prefix = '') => widgets.map(([widget, path]) => context({
  entryPoints: [
    `./${prefix}${prefix ? '/' : ''}${path}`
  ],
  plugins: [copyHtmlPlugin, copyWidgetPlugin],
  outdir: `./build/${widget}`,
  bundle: true,
  loader: {
    '.gif': 'file',
    '.json': 'file'
  },
  format: 'esm',
  platform: 'browser',
  // minify: !WATCH,
  logLevel: 'info'
}));