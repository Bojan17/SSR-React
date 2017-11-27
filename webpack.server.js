const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.js');
const webpackNodeExternals = require('webpack-node-externals');

const config = {
  //Inform webpack that we're building a bundle
  //for nodeJS, rather than browser
  target: 'node',

  //Tell webpack the root file of our server app
  entry: './src/index.js',
  //Tell webpack where to put generated output file
  output:{
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build')
  },

  //if library is in node_modules dont bundle it in our server side bundle
  externals: [webpackNodeExternals()]
};

module.exports = merge(baseConfig, config);
