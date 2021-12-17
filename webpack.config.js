const webpack = require('webpack');
const path = require('path');



module.exports = {
    module: {
      rules: [
        {
       test: /\.m?js/,
       resolve: {
           fullySpecified: false
       }}
      ]
    },

    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
        })
    ],
    resolve: {
        fallback: {
            crypto: false,
            "assert": require.resolve("assert/"),
            "stream": require.resolve("stream-browserify")
        }
    },
    entry: './src/main.js',
    output: {
      path: path.resolve(__dirname, 'docs/js'),
      publicPath: path.resolve(__dirname, 'docs'),
      filename: 'bundle.js'
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'docs'),
      },
      compress: true,
      port: 9000,
  },


};
console.log(path.resolve(__dirname, '/docs/js'));
