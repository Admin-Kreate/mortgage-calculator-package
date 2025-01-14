const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    library: "MortgageCalculator",
    libraryTarget: "umd",
    umdNamedDefine: true,
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
      },
      // {
      //   test: /\.(png|jpe?g|gif|svg)$/i,
      //   use: [
      //     {
      //       loader: "file-loader",
      //       options: {
      //         name: "[path][name].[ext]",
      //       },
      //     },
      //   ],
      // },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "styles.css",
    }),
    new HtmlWebpackPlugin({
      template: "./src/test-webpage.html", // Path to your test HTML file
    }),
  ],
  mode: "production",
  devtool: "source-map",
  devServer: {
    port: 8080,
    hot: true,
  },
  performance: {
    hints: "warning",
    maxAssetSize: 612000, // Adjust as per your requirements (e.g., 500 KiB)
    maxEntrypointSize: 1024000, // Adjust as per your requirements (e.g., 1 MiB)
  },
};
