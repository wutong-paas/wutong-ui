## 环境要求

- Node.js > 6.x

## 编码规范
- 遵循eslint规范代码
- 通过Prettier格式化代码
### eslint 配置
- vscode或webstore搜索扩展 eslint 插件集成
- vscode或webstore搜索扩展 Prettier 格式化代码
#### vscode 配置
```
"editor.tabSize": 2,
  "eslint.validate": [
      "javascript", 
      "vue",
      "html",
      "typescript",
      "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
  },
  "files.autoSave": "off",
  "editor.formatOnSave": false,
  "editor.formatOnPaste": false,
  "editor.suggestSelection": "first","automaticallyOverrodeDefaultValue",
  "eslint.codeAction.showDocumentation": {
      "enable": true
  },
  "[vue-html]": {
      "editor.formatOnSave": true,
      "editor.formatOnPaste": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
      "editor.formatOnSave": true,
      "editor.formatOnPaste": true
  },
  "[typescriptreact]": {
      "editor.formatOnSave": true,
      "editor.formatOnPaste": true
  },
```

### 目录命名

- 能直观的感受当前目录文件的作用
- 以小驼峰方式命名

### 页面命名
- 能直观的感受当前文件的作用
- 以小驼峰方式命名

### 组件命名
- 能直观的感受当前组件的用途
- 组件命名尽量是多个单词的，避免跟html元素或标签冲突
- 大写开头
- 组件以文件夹方式封装，内部文件以小驼峰方式命名

### 图片命名
- 图片文件夹一般遵从页面或者模块命名,如：login/）
- 图片不可随意命名，且严禁使用0，1，等数字直接命名图片。
- 图片命名可遵循：用途+描述，多个单词用下划线隔开，如：login_icon.png,pwd_icon.png
- 10k以下图片建议放置assets/img下（webpack打包时直接转为base64嵌入）
- 大图且不常更换的图片放置public/img下
- 可用css编写的样式严禁使用图片
- 国际化图片，后缀使用简体-cn,英文-en,繁体-tw
```
│   ├── assets/               
│   │   ├── img/                          # 图片
│   │   │    ├── common/                  # 公共图片
│   │   │    │    ├── default_avatar.png  # 默认头像
│   │   │    ├── login/                   # 登录模块
│   │   │    │    ├── login1.png          # 登录模块图片
│   │   │    │    ├── login_icon-en.png      
│   │   │    │    ├── login_icon-cn.png     
│   │   │    │    ├── login_icon-tw.png      
│   │   │    ├── userInfo/                   # 用户中心模块的图片
```
### 项目路由
- 普通路由(非动态多级)命名，可以直接使用页面组件的命名。
- 动态多级路由，遵循：用途或作用或功能。
```
/user/personal/infomaition  用户中心 -> 个人中心 -> 个人信息
/user/company/infomaition  用户中心 -> 企业中心 -> 企业信息
```

### 语义化

语义的HTML结构，有助于机器搜索，保证代码可读性。

常见的标签语义

| 标签           | 语义       |
| -------------- | ---------- |
| `<p>`          | 段落       |
| `<h1,2,3>`     | 标题       |
| `<ul>`         | 无序列表   |
| `<ol>`         | 有序列表   |
| `<blockquote>` | 大段引用   |
| `<cite>`       | 一般引用   |
| `<b>`          | 为样式加粗 |
| `<strong>`     | 为强调加粗 |
| `<i>`          | 为样式倾斜 |
| `<em>`         | 为强调倾斜 |
| `<code>`       | 代码标识   |
| ……             | ……         |

例如：

- h1 大标题，一般用于banner背景，一个页面有且只有一个
- h2 章节标题，可以有多个
- h3 章节内的文章标题
- h4,h5,h6 小标题/副标题
- p 段落

```
├── h1---文章大标题
│   ├── h2--- 这里是一个节点
│   │   ├──h3--- 节点内的文章标题
│   │   │   ├── h4,h5,h6--- 副标题/作者等信息
│   │   │   ├── p---段落
│   ├── h2--- 这里是一个节点
│   │   ├──h3--- 节点内的文章标题
│   │   │   ├── h4,h5,h6--- 副标题/作者等信息
│   │   │   ├── p---段落   
```
### 注释规范
```vue
<!-- 头部 -->
<view class="header">
  <!-- LOGO -->
  <image class="logo"></image>
  <!-- /LOGO -->
  <!-- 详情 -->
  <view class="detail"> </view>
  <!-- /详情 -->
</view>
<!-- /头部 -->
```

- 变量命名：小驼峰命名
- 参数名：小驼峰命名
- 函数名：小驼峰命名
- 方法/属性名：小驼峰命名
- 类名开头大写
- 私有属性、变量和方法以下划线 _ 开头。
- 常量名：全部使用大写+下划线
- 由多个单词组成的缩写词，在命名中，根据当前命名法和出现的位置，所有字母的大小写与首字母的大小写保持一致。
- 语义
  - 变量应当使用名词，尽量符合当时语义
  - boolean类型应当使用 is , has 等开头
  - 点击事件命名方式：tap + onClick()

```
let loadingModules = {};

const HTML_ENTITY = {};

function stringFormat(theBells) {}

function insertHTML(element, html) {}

function Engine(options) {}
```



### React编写顺序

```React
// todo
```

## Getting started
```bush
// install dependencies
npm install

// develop
npm run start
```

## Build
```bush
npm run build
```

## 发布
- 使用docker进行项目发布
- 1登录
- 2打包
- 3推送

```
sudo docker login swr.cn-east-3.myhuaweicloud.com -u cn-east-3@FUZQYLMGNPQ6TDCKYRGB -p 83b65f12b6db88427629272f856896099c702b4838f7b8834daefd67fad94013
1. yarn build 
2. docker build & docker push
```

## License
[MIT](http://opensource.org/licenses/MIT)

## 项目介绍
```
1、项目为其它开发人员搭建
```

### 环境配置
```
1、env为常用环境配置文件
2、Dockerfile|docker-entrypoint 复制其它项目过来，未做修改
3、r无格式文件为命令，复制其它项目，未做修改
5、cypress.json，复制其它项目，未做修改
6、.travis.yml，复制其它项目，未做修改
7、其它配置见 vue.config

```
#### 目录结构

```
├── vue.config.js/              # webpack 配置文件；
├── config/                     # 与项目构建相关的常用的配置选项；
│   ├── index.js                # 主配置文件
│
├── src/
│   ├── main.js                 # webpack 的入口文件；
│   ├── App.vue                 # APP页面入口
│   ├── assets/                 # 共用的代码以外的资源，如：图片、图标、视频 等；
│   ├── api/                    # 网络模块，如：接口；
│   ├── router/                 # 路由模块
│   ├── I18n/                   # 国际化模块
│   ├── view/                   # 单页页面
│   ├── directive/              # 指令
│   ├── vuex/                   # 组件共享状态
│   ├── libs/                   # 工具
│   ├── components/             # 共用的组件；； 这里的存放的组件应该都是展示组件
│   │   ├── base/               # 基本组件，如：共用的弹窗组件，loading加载组件，提示组件。
│   │   ├── common/             # 共用的全局组件，封装的导航条，底部组件等等
│   │   ├── temp/               # 模板组件，如：相同的页面封装成一个组件。
│   │   ├── uItemp/             # UI组件，如：项目中特定的按钮，消息数字，等等一些样式可以封装成组件的。
│   ├── utils/                 # 共用的资源，如：常用的图片、图标，共用的组件、模块、样式，常量文件等等；
│   │   ├── compatible/         # 兼容模块，如：适合App和微信各种接口的模块；
│   │   ├── extension/          # 已有类的扩展模块，如：对 Array 类型进行扩展的模块；
│   │   ├── libraries/          # 存放自己封装的或者引用的库；
│   │   ├── tools/              # 自己封装的一些工具
│   │   ├── constant.js         # 存放js的常量；
│   │   ├── constant.scss       # 存放scss的常量；
│   │   └── ...
│   └── view/                   # 存放项目业务代码；
│       ├── App.vue             # app 的根组件；
├── public/                     # 纯静态资源，该目录下的文件不会被webpack处理，该目录会被拷贝到输出目录下；
├── .babelrc                    # babel 的配置文件
├── .editorconfig               # 编辑器的配置文件；可配置如缩进、空格、制表类似的参数；
├── .eslintrc.js                # eslint 的配置文件
├── .eslintignore               # eslint 的忽略规则
├── .gitignore                  # git的忽略配置文件
├── .postcssrc.js               # postcss 的配置文件
├── package.json                # npm包配置文件，里面定义了项目的npm脚本，依赖包等信息
└── README.md                   # 项目信息文档
```

### package包介绍
包名|介绍|备注
:---:|:---:|:---:
@antv/g6|图可视化引擎|https://g6.antv.vision/zh
clipboard|一种将文本复制到剪贴板的现代方法|https://clipboardjs.com/
codemirror|在线编辑代码，风格包括js, java, php, c++等等100多种语言|https://codemirror.net/
countup|数值动画效果|https://inorganik.github.io/countUp.js/
cropperjs|裁剪图片并上传|https://fengyuanchen.github.io/cropperjs/
~~dayjs~~|处理时间和日期|和moment重复了
echarts|图表|http://echarts.apache.org/
html2canvas|项目中生成截图|https://html2canvas.hertzen.com/
~~insert-css~~|插入样式|已删除
iview|ui组件|https://iview.github.io/
iview-area|城市级联组件，数据包含中国的省(直辖市)、市、县区和乡镇街|https://iview.github.io/iview-area/
js-cookie|cookie|https://www.npmjs.com/package/js-cookie
js-md5|md5|github.com/emn178/js-md5
moment|处理时间和日期|https://momentjs.com/
mqtt|mqtt协议方式是发布/订阅者模式|https://www.npmjs.com/package/mqtt
simplemde|markown编辑器|https://simplemde.com/
sortablejs|功能强大的JavaScript 拖拽库|http://sortablejs.github.io/Sortable/
tree-table-vue|表格树，antd有该功能，因为ivew功能不全而安装|https://www.npmjs.com/package/tree-table-vue
v-org-tree|组织结构树组件，有点类式思维导图|
vue|核心模块
vue-draggable-resizable|可拖拽缩放的组件|https://www.npmjs.com/package/vue-draggable-resizable
vue-draggable-resizable-gorkys|拖拽组件使用时，在提供的方法上添加自定义的参数|https://www.npmjs.com/package/vue-draggable-resizable-gorkys
vue-giant-tree|基于ztree封装的Vue树形组件|https://www.npmjs.com/package/vue-giant-tree
vue-i18n|国际化
vue-json-viewer|简单易用的json内容展示组件|https://github.com/chenfengjw163/vue-json-viewer
vue-particles|粒子特效|https://vue-particles.netlify.app/
vue-router|路由
vuedraggable|基于sortablejs拖拽功能|https://www.itxst.com/vue-draggable/tutorial.html
vuex|vue数据共享
wangeditor|富文本|https://www.wangeditor.com/
xlsx|导出excel的工具|https://sheetjs.com/
axios|接口调用
chai|单元测试， 断言库|http://chaijs.com/
mockjs|模拟数据|http://mockjs.com/
vue-clipboard2|复制内容至剪切板|https://www.npmjs.com/package/vue-clipboard2

Copyright (c) 2021-present, talkweb
