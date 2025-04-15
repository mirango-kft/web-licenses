import path from "path";
import type { Options as RollupPluginOptions, Dependency } from "rollup-plugin-license";

const acceptableLicenses = [
  { name: "AFL" },
  { name: "Apache" },
  { name: "0BSD", exact: true },
  { name: "BSD" },
  { name: "CC0" },
  { name: "CC-BY-3.0" },
  { name: "CC-BY-4.0" },
  { name: "ISC" },
  { name: "MIT" },
  { name: "MS-PL" },
  { name: "W3C", exact: true },
  { name: "WTFPL" },
];

function isAcceptableLicense(licenseName: string) {
  return acceptableLicenses.some((license) =>
    license.exact ? license.name === licenseName : licenseName.startsWith(license.name)
  );
}

const seeOnGithub = (packageName: string, file = "LICENSE") =>
  `See the license at: https://github.com/${packageName}/blob/master/${file}`;

const sharedKnownLicenseTypes: Record<string, string> = {
  // Dual-licensed under MPL-2.0 and Apache-2.0, we use the Apache-2.0 license
  dompurify: "Apache-2.0",

  // These have the MIT license in the repo but they're missing from the package.json file
  decko: "MIT",
  stickyfill: "MIT",
};

const sharedKnownLicenseTexts: Record<string, string> = {
  imurmurhash: seeOnGithub("jensyt/imurmurhash-js"),
  "is-in-browser": seeOnGithub("tuxsudo/is-in-browser"),
  theming: seeOnGithub("cssinjs/theming", "README.md"),
  "@emotion/memoize": seeOnGithub("emotion-js/emotion", "packages/memoize/LICENSE"),
  "@emotion/is-prop-valid": seeOnGithub("emotion-js/emotion", "packages/is-prop-valid/LICENSE"),
  "react-number-format": seeOnGithub("s-yadav/react-number-format", "MIT-LICENSE.txt"),
  "html-parse-stringify2": seeOnGithub("locize/html-parse-stringify2", "README.md"),
  "redux-batched-subscribe": seeOnGithub("tappleby/redux-batched-subscribe"),
  "redux-devtools-extension": seeOnGithub("zalmoxisus/redux-devtools-extension"),
  "@microsoft/signalr": seeOnGithub("dotnet/aspnetcore", "LICENSE.txt"),
  isarray: seeOnGithub("juliangruber/isarray"),
  "popper.js": seeOnGithub("popperjs/popper-core", "LICENSE.md"),
  "react-select": seeOnGithub("JedWatson/react-select"),
  "toggle-selection": seeOnGithub("sudodoki/toggle-selection"),
  "styled-components": seeOnGithub("styled-components/styled-components"),
  "@redocly/react-dropdown-aria": seeOnGithub("Redocly/react-dropdown-aria", "LICENSE.md"),

  // The license is explicitly specified as MIT but the text is missing from the README. The author seems inactive
  // but it should be OK to use as everything points towards this being an MIT library
  "raf-schd": seeOnGithub("alexreardon/raf-schd", "README.md"),
};

const sharedExcludedPackages = [
  // Commercial license
  "devextreme",
  "@devexpress/dx-core",
  "@devexpress/dx-grid-core",
  "@devexpress/dx-react-core",
  "@devexpress/dx-react-grid",
  "@devexpress/dx-react-grid-material-ui",
  "devexpress-gantt",
];

export interface MirangoLicenseOptions {
  additionalExcludedPackages: string[];
  additionalKnownLicenses: Record<string, string>;
  additionalKnownLicenseTexts: Record<string, string>;
}

export function makeRollupLicensePluginOptions(
  outputPath: string,
  outputFile: string,
  {
    additionalExcludedPackages = [],
    additionalKnownLicenses = {},
    additionalKnownLicenseTexts = {},
  }: Partial<MirangoLicenseOptions>
): RollupPluginOptions {
  const licenseOverrides = { ...sharedKnownLicenseTypes, ...additionalKnownLicenses };
  const knownLicenseTexts = { ...sharedKnownLicenseTexts, ...additionalKnownLicenseTexts };
  const excludedPackages = new Set([...sharedExcludedPackages, ...additionalExcludedPackages]);
  const getWithFallback = (
    dependency: Dependency,
    mappings: Record<string, string>,
    fallback: keyof Dependency
  ) => dependency.name && (mappings[dependency.name] ?? dependency[fallback]);

  return {
    sourcemap: true,
    banner: `@preserve Additional licenses are found in ${outputFile}`,
    thirdParty: {
      output: {
        file: path.join(outputPath, outputFile),
        template(dependencies) {
          return dependencies
            .map((dependency) => {
              const licenseText = getWithFallback(dependency, knownLicenseTexts, "licenseText");
              return `${dependency.name} - ${dependency.license}\n${licenseText}`;
            })
            .join("\n\n");
        },
      },
      allow: {
        test(dependency) {
          if (dependency.name && excludedPackages.has(dependency.name)) {
            return true;
          }

          const licenseName = getWithFallback(dependency, licenseOverrides, "license");
          return licenseName != null && isAcceptableLicense(licenseName);
        },
        failOnViolation: false,
      },
    },
  };
}

export function makeWebpackLicensePluginOptions({
  additionalExcludedPackages = [],
  additionalKnownLicenses = {},
  additionalKnownLicenseTexts = {},
}: Partial<MirangoLicenseOptions> = {}) {
  const knownLicenseTypes = { ...sharedKnownLicenseTypes, ...additionalKnownLicenses };
  const knownLicenseTexts = { ...sharedKnownLicenseTexts, ...additionalKnownLicenseTexts };
  const excludedPackages = new Set([...sharedExcludedPackages, ...additionalExcludedPackages]);
  return {
    addBanner: true,
    renderBanner: (fileName: string) => `/* @preserve Additional licenses are found in: ${fileName} */`,
    outputFilename: "[name].[hash].licenses.txt",
    licenseTypeOverrides: knownLicenseTypes,
    licenseTextOverrides: knownLicenseTexts,
    unacceptableLicenseTest: (licenseName: string) => !isAcceptableLicense(licenseName),
    handleUnacceptableLicense: (packageName: string, licenseType: string) => {
      throw new Error(`Forbidden license '${licenseType}' found for package '${packageName}'`);
    },
    handleMissingLicenseType: (packageName: string) => {
      throw new Error(`Missing license for '${packageName}'`);
    },
    excludedPackageTest: (packageName: string) => excludedPackages.has(packageName),
  };
}
