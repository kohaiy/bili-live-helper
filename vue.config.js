module.exports = {
  lintOnSave: false,
  configureWebpack: {
    plugins: [
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('unplugin-auto-import/webpack')({
        // targets to transform
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/, /\.vue\?vue/, // .vue
          /\.md$/, // .md
        ],

        // global imports to register
        imports: [
          // presets
          'vue',
          // 'vue-router',
          // custom
          // {
          //   'axios': [
          //     // default imports
          //     ['default', 'axios'], // import { default as axios } from 'axios',
          //   ],
          // },
        ],

        // Generate corresponding .eslintrc-auto-import.json file.
        // eslint globals Docs - https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals
        // eslintrc: {
        //   enabled: false, // Default `false`
        //   filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
        //   globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
        // },

        // custom resolvers
        // see https://github.com/antfu/unplugin-auto-import/pull/23/
        resolvers: [
          /* ... */
        ],
      }),
    ],
  },
  pluginOptions: {
    electronBuilder: {
      mainProcessFile: './src/background/index.ts',
      mainProcessWatch: ['./src/background/**/**'],
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
