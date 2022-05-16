const GoogleFontsPlugin = require("@beyonk/google-fonts-webpack-plugin");

module.exports = {
  publicPath: process.env.DEPLOY ? '././' : '/',
  lintOnSave: false,
  pluginOptions: {
    express: {
      shouldServeApp: true,
      serverDir: '.'
    }
  },
  configureWebpack: {
    plugins: [
      new GoogleFontsPlugin({
        fonts: [
          { family: "Inter", variants: ["500"] }
        ],
        local: false
      })
    ]
  }
};
