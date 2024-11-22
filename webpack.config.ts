import path from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
  entry: './src/handlers/index.ts',  // Ange din huvudfil här
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
};

export default config;
