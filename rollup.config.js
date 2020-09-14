import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "./src/index.ts",
  output: [{ file: "dist/index.js", format: "cjs" }],
  plugins: [
    terser(),
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    typescript({ cacheRoot: ".cache" }),
  ],
};
