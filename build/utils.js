//build文件下的utils.js文件
const px2remLoader = {
  loader: 'px2rem-loader',
  options: {
      remUnit: 192
  }
}

//build文件下的utils.js文件
const loaders = options.usePostCSS ?
[cssLoader, postcssLoader, px2remLoader] : [cssLoader, px2remLoader]
