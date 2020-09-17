# @mirango/web-licenses

A Webpack plugin factory using the [license-webpack-plugin](https://www.npmjs.com/package/license-webpack-plugin) to enforce
Mirango's licensing guidelines at build time. It does the following things:

1. Contains a list of acceptable license types and checks them at build time. All unknown licenses are going to be rejected
2. Ignores commercial packages that Mirango has a license for
3. Uses a shared list of hand-vetted packages that are either missing their license type of license text from the distributed version of their NPM package

## Usage

### Basic usage

The package is used to create a regular Webpack plugin:

```ts
import { makeMirangoLicensePlugin } from "@mirango/web-licenses";

export const config: webpack.Configuration = {
  plugins: [makeMirangoLicensePlugin()],
};
```

### Configuring for production

Beacuse license checking is slow and license changes are infrequent, it might be preferable to only configure the plugin when Webpack
is making a production bundle:

```ts
import { makeMirangoLicensePlugin } from "@mirango/web-licenses";

const isProduction = process.ENV.NODE_ENV === "production";
const isTruthy = <T>(value: T | null | undefined | false): value is T => !!value;

export const config: webpack.Configuration = {
  plugins: [isProduction && makeMirangoLicensePlugin()].filter(isTruthy),
};
```

### Advanced usage

The plugin accepts some additonal options to add various kinds of exclusions to the predefined ones. An example:

```ts
export const config: webpack.Configuration = {
  plugins: [
    makeMirangoLicensePlugin({
      additionalExcludedPackages: ["my-internal-project"],
      additonalKnownLicenses: {
        "my-package": "MIT",
      },
      additionalKnownLicenseTexts: {
        "my-package": "For the full license, see: https://github.com/my-organization/my-package",
      },
    });
  ],
}
```
