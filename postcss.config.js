
module.exports = {
  plugins: {
      "autoprefixer": {
          overrideBrowserslist: ['Android >= 4.0', 'iOS >= 7']
      },
      "postcss-pxtorem": {
          "rootValue": 14,	// 这里设置转换rem的倍数，假设需要设置的宽度为60px，那么转换后就是60/16=3.75rem
          "propList": ["*"]
      }
  }
}

