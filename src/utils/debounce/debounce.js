//防抖的函数
export default function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    //这里利用了闭包
    clearTimeout(timeout);

    if (immediate) {
      //立即执行
      let callNow = !timeout;
      //如果是第一次点的话，timeout是没有值的

      timeout = setTimeout(function () {
        timeout = null;
      }, wait);

      if (callNow) {
        func();
      }
    }
    else {
      //不会立即执行
      timeout = setTimeout(func(), wait);
    }
  }
}
