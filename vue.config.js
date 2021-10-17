module.exports = {
  lintOnSave: false,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        appId: 'top.kohai.bili-live-helper',
        productName: '哔哩直播小助手',
        icon: './public/logo.png',
        copyright: 'Copyright © 2020 柯灰KOHAI',
        artifactName: `\${productName} Setup \${version}.\${ext}`,
        win: {
          icon: './public/logo.png',
          requestedExecutionLevel: 'highestAvailable',
        },
      },
    },
  },
}
