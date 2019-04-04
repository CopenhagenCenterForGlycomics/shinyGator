const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    'SeqViewer': [ './js/SeqViewer.js' ],
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/inst/htmlwidgets'
  },
  plugins: [
    new CompressionPlugin(),
    new TerserPlugin({
      parallel: true,
      terserOptions: {
        ecma: 6,
      },
      sourceMap: true,
    })
  ],
  devServer: {
   contentBase: path.join(__dirname, "/"),
   compress: true,
   port: 3000,
 },
  module: {
    rules: [{
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', {
              modules: false,
              corejs: "core-js@2",
              useBuiltIns: 'entry',
              targets: {
                browsers: [
                  'Chrome >= 60',
                  'Safari >= 10.1',
                  'iOS >= 10.3',
                  'Firefox >= 54',
                  'Edge >= 15',
                ],
              },
            }],
          ],
        },
      },
    }],
  },
};