const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const SassPlugin = require('sass-webpack-plugin');

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
            inject: false,
            template: require('html-webpack-template'),
            links: [{ rel: 'stylesheet', type: 'text/css', href: './index.css' }], 
            appMountId: 'app'
        }),
        new SassPlugin('./src/index.scss', false),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist')
    },
};
