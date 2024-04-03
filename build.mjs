import { createWidgetContexts } from "./context.mjs";

const WATCH = process.argv.includes('--watch');

const contexts = await Promise.all([
  ...createWidgetContexts()
]);

if (WATCH) {

  for (const ctx of contexts) ctx.watch();

} else {

  for (const ctx of contexts) await ctx.rebuild();
  for (const ctx of contexts) ctx.dispose();

};
