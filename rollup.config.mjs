// Libs
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import gzip from 'rollup-plugin-gzip';
import nodeResolve from 'rollup-plugin-node-resolve';
import path from 'path';
import pkgConfig from './package.json' assert { type: 'json' };
import { uglify } from 'rollup-plugin-uglify';
import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin';
import nodeExternals from 'rollup-plugin-node-externals'

// Constants
const DIST = process.env.DIST || false;
const MIN = process.env.MIN || false;
const ESM = process.env.ESM || false

const banner = `/* Inspire Tree
 * @version ${pkgConfig.version}
 * ${pkgConfig.repository}
 * @copyright Copyright 2015 Helion3, and other contributors
 * @license Licensed under MIT
 *          see ${pkgConfig.repository}/blob/master/LICENSE
 */`;

const plugins = [
    optimizeLodashImports(),
    babel({
        exclude: 'node_modules/**'
    }),
    ...ESM ? [nodeExternals()] : [],
    nodeResolve({
        browser: true
    }),
    ...!ESM ? [commonjs({
        sourceMap: false,
        namedExports: {
            'node_modules/es6-promise/dist/es6-promise.js': ['Promise'],
            'node_modules/eventemitter2/lib/eventemitter2.js': ['EventEmitter2']
        }
    })] : [],
];

if (MIN) {
    plugins.push(uglify({
        output: {
            comments: /@license/
        }
    }));
    plugins.push(gzip());
}

export default {
    input: path.join('src', 'tree.js'),
    plugins: plugins,
    output: {
        file: path.join(ESM ? 'dist/esm' : DIST ? 'dist' : 'build', 'inspire-tree' + (MIN ? '.min' : '') + '.js'),
        format: ESM ? 'esm' : 'umd',
        name: 'InspireTree',
        banner: banner,
        globals: (name) => {
            const [, fnc] = name.match(/^lodash\/(.*)\.js$/i) || []
            if (!fnc) {
                return name
            }
            return `_.${fnc}`
        }
    },
    ...!ESM ? {
        external: [/^lodash/],
    } : {}
};
