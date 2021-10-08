module.exports = {
  lintOnSave: false,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: 'bili 直播小助手',
        artifactName: `\${productName} Setup \${version}.\${ext}`,
        win: {
          icon: './public/logo.png',
          requestedExecutionLevel: 'highestAvailable',
        },
      },
    },
  },
}
