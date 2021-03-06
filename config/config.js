import defaultSettings from '../src/defaultSettings';
import routerConfig from './router.config';

let publcPath = '/static/dists/';
if (process.env.SEPARATION === 'true') {
  publcPath = `/`;
}
const isHistory = process.env.ROUTE_MODE === 'history';

export default {
  history: isHistory ? 'browser' : 'hash',
  publicPath: publcPath,
  hash: !isHistory,
  plugins: [
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: {
          hmr: true
        },
        dynamicImport: {
          loadingComponent: './components/PageLoading/index',
          webpackChunkName: true,
          level: 3
        },
        locale: {
          // default false
          enable: false,
          // default zh-CN
          default: 'zh-CN',
          // default true, when it is true, will use `navigator.language` overwrite default
          baseNavigator: false
        }
      }
    ]
  ],
  ignoreMomentLocale: true,
  theme: {
    'card-actions-background': defaultSettings.primaryColor,
    'primary-color': defaultSettings.primaryColor
  },
  lessLoaderOptions: {
    javascriptEnabled: true
  },
  disableDynamicImport: true,

  routes: routerConfig,
  proxy: {
    '/console/proxy': {
      target: 'http://wutong-adaptor.wt-system:8080',
      pathRewrite: {
        '^/console/proxy/(.*)$': '/$1'
      },
      changeOrigin: true
    },
    '/console': {
      target: 'http://wutong-console.wt-system:8888',
      changeOrigin: true
    },
    '/data': {
      target: 'http://wutong-console.wt-system:8888',
      changeOrigin: true
    },
    '/static/www': {
      target: 'http://wutong-console.wt-system:8888',
      changeOrigin: true
    }
  }
};
