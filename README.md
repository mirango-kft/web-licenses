# @mirango/web-licenses

A bundler plugin helper for enforcing Mirango's licensing policies at build time. This package provides utility functions that generate configuration options for popular license management plugins in both Webpack and Rollup. It leverages [webpack-license-plugin](https://www.npmjs.com/package/webpack-license-plugin) and [rollup-plugin-license](https://www.npmjs.com/package/rollup-plugin-license) to ensure all third-party dependencies meet our licensing guidelines.

The tool performs the following tasks:
- **License Validation:** Checks that dependency licenses are acceptable based on a curated list of approved license types. Both exact matches and prefix-based validations are supported.
- **Exclusions:** Automatically skips commercial and internally licensed packages and any known packages that have already been vetted.
- **Overrides:** Applies shared license type and license text overrides for packages with missing or incomplete license metadata. These defaults can be extended to suit project-specific needs.

## Installation

Ensure that you have the necessary license plugins installed along with this package:

```bash
npm install @mirango/web-licenses webpack-license-plugin rollup-plugin-license
```

or

```bash
yarn add @mirango/web-licenses webpack-license-plugin rollup-plugin-license
```

## Usage

### Webpack

Integrate the license check into your Webpack build by creating a new instance of the license plugin with the generated options:

```ts
import WebpackLicensePlugin from 'webpack-license-plugin';
import { makeWebpackLicensePluginOptions } from '@mirango/web-licenses';

export const config: webpack.Configuration = {
  plugins: [
    new WebpackLicensePlugin(
      makeWebpackLicensePluginOptions()
    )
  ],
};
```

#### Production-Only Configuration

Because license scanning can be time-intensive and the dependencies change infrequently, you might prefer to run this check only on production builds:

```ts
import WebpackLicensePlugin from 'webpack-license-plugin';
import { makeWebpackLicensePluginOptions } from '@mirango/web-licenses';

const isProduction = process.env.NODE_ENV === 'production';

export const config: webpack.Configuration = {
  plugins: isProduction ? [new WebpackLicensePlugin(makeWebpackLicensePluginOptions())] : [],
};
```

### Rollup

For Rollup projects, use the provided helper function to configure the license plugin. Provide the output directory and file name where the license information will be saved:

```ts
import license from 'rollup-plugin-license';
import { makeRollupLicensePluginOptions } from '@mirango/web-licenses';

export default {
  plugins: [
    license(
      makeRollupLicensePluginOptions('dist', 'licenses.txt')
    )
  ],
};
```

## Advanced Configuration

Both the Webpack and Rollup helper functions accept an options object to further customize the behavior. You can extend the built-in settings by specifying:
- `additionalExcludedPackages`: An array of package names to exclude from the license check.
- `additionalKnownLicenses`: A mapping from package names to their approved license types.
- `additionalKnownLicenseTexts`: A mapping from package names to custom license text or links, used when the package’s license text is missing or incomplete.

For example, in a Webpack configuration:

```ts
import WebpackLicensePlugin from 'webpack-license-plugin';
import { makeWebpackLicensePluginOptions } from '@mirango/web-licenses';

export const config: webpack.Configuration = {
  plugins: [
    new WebpackLicensePlugin(
      makeWebpackLicensePluginOptions({
        additionalExcludedPackages: ['my-internal-project'],
        additionalKnownLicenses: {
          'my-package': 'MIT',
        },
        additionalKnownLicenseTexts: {
          'my-package': 'For the full license, see: https://github.com/my-organization/my-package',
        },
      })
    )
  ],
};
```