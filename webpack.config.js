const webpack = require('webpack');
const path = require('path');



module.exports = {

  // optimization: {
  //   nodeEnv: 'production'
  // },
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
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
          }),
    ],
    resolve: {
        fallback: {
            crypto: false,
            "assert": require.resolve("assert/"),
            "stream": require.resolve("stream-browserify"),
            crypto: require.resolve("crypto-browserify"),
            stream: require.resolve("stream-browserify"),
            util: require.resolve("util"),
            assert: require.resolve("assert"),
            fs: false,
            process: false,
            path: false,
            zlib: false,
        },
        
        alias: { "stream": require.resolve("stream-browserify") }
       
    },
    entry: {
      mint: './src/mint.js',
      rarity: './src/rarity.js',
      campaign: './src/campaign.js',
      'campaign.submissions': './src/campaign.submissions.js'
    },
    output: {
      path: path.resolve(__dirname, 'docs/js'),
      publicPath: path.resolve(__dirname, 'docs'),
      filename: '[name].bundle.js'
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
