import { LicenseWebpackPlugin } from "license-webpack-plugin";
import webpack from "webpack";

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

const sharedKnownLicenseTypes = {
  // Dual-licensed under MPL-2.0 and Apache-2.0, we use the Apache-2.0 license
  "dompurify": "Apache-2.0",
  
  // These have the MIT license in the repo but they're missing from the package.json file
  "decko": "MIT",
  "stickyfill": "MIT",
};

const sharedKnownLicenseTexts = {
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

export function makeMirangoLicensePlugin({
  additionalExcludedPackages = [],
  additionalKnownLicenses = {},
  additionalKnownLicenseTexts = {},
}: Partial<MirangoLicenseOptions> = {}) {
  const knownLicenseTypes = { ...sharedKnownLicenseTypes, ...additionalKnownLicenses };
  const knownLicenseTexts = { ...sharedKnownLicenseTexts, ...additionalKnownLicenseTexts };
  const excludedPackages = new Set([...sharedExcludedPackages, ...additionalExcludedPackages]);
  return (new LicenseWebpackPlugin({
    addBanner: true,
    renderBanner: (fileName) => `/* @preserve Additional licenses are found in: ${fileName} */`,
    outputFilename: "[name].[hash].licenses.txt",
    licenseTypeOverrides: knownLicenseTypes,
    licenseTextOverrides: knownLicenseTexts,
    unacceptableLicenseTest: (licenseName) => !isAcceptableLicense(licenseName),
    handleUnacceptableLicense: (packageName, licenseType) => {
      throw new Error(`Forbidden license '${licenseType}' found for package '${packageName}'`);
    },
    handleMissingLicenseType: (packageName) => {
      throw new Error(`Missing license for '${packageName}'`);
    },
    excludedPackageTest: (packageName) => excludedPackages.has(packageName),
  }) as unknown) as webpack.Plugin;
}
