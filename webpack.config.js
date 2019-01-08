const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const SassPlugin = require('sass-webpack-plugin');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin')


module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test:/\.scss$/,
                use:['style-loader','css-loader', 'sass-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ 
            title: 'eino', 
            template: require('html-webpack-template'),
            links: [{ rel: 'stylesheet', type: 'text/css', href: './index.css' }], 
            appMountId: 'app'
        }),
        new SassPlugin('./src/index.scss', false),
        new HtmlWebpackExternalsPlugin({
            externals: [
                {
                    module: 'planck',
                    entry: 'https://cdnjs.cloudflare.com/ajax/libs/planck-js/0.2.7/planck-with-testbed.js',
                    global: 'planck'
                },
                {
                    module: 'neataptic',
                    entry: 'https://wagenaartje.github.io/neataptic/cdn/1.4.7/neataptic.js',
                    global: 'neataptic'
                }
            ]
        })
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    externals: {
        planck: 'planck'
    },
    node: {
        child_process: 'empty'
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist')
    },
};
