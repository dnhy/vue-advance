import esbuild from "esbuild";
import minimist from "minimist";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const args = minimist(process.argv.slice(2));
const format = args["f"] || "iife";
const target = args._[0] || "reactivity";
const IIFENameMap = {
  reactivity: "VueReactivity",
};

esbuild
  .context({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),
    bundle: true, //所有模块打包到一起，打包成esm-browser
    sourcemap: true,
    format,
    globalName: IIFENameMap[target],
    platform: "browser",
  })
  .then((ctx) => {
    ctx.watch();
  });
