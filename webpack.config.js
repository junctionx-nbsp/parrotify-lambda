const path = require("path")
const slsw = require("serverless-webpack")
const WebpackOnBuildPlugin = require("on-build-webpack")
const { chmodSync } = require("fs")

// from https://github.com/serverless-heaven/serverless-webpack/issues/205
function fixExecutablePermissions(stats) {
  for (const filename in stats.compilation.assets) {
    if (filename.endsWith("ffmpeg")) {
      const basePath = stats.compilation.outputOptions.path
      const fullPath = `${basePath}/${filename}`
      chmodSync(fullPath, "755")
    }
  }
}

const entries = {}
Object.keys(slsw.lib.entries).forEach(
  key => (entries[key] = ["./source-map-install.js", slsw.lib.entries[key]])
)

module.exports = {
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  entry: entries,
  devtool: "source-map",
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js"
  },
  target: "node",
  node: {
    __dirname: true,
  },
  plugins: [
    new WebpackOnBuildPlugin(fixExecutablePermissions),
  ],
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      { test: /ffmpeg$/, loader: "file-loader", options: { name: "[path][name]" } }
    ]
  }
}
