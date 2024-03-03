import * as echarts from "echarts";

export function echartsRendering(chartContainter, data, minMeasure, titleName,colorNum) {
  data = data.sort((a, b) => a - b)

  let statistics = {};
  let min = data[0];
  if (min < 0) {
    let closestDifference = Math.abs(data[0]);

    for (let i = 1; i < data.length; i++) {
      let difference = Math.abs(data[i]);

      if (difference < closestDifference) {
        min = data[i];
        closestDifference = difference;
      }
    }
  }
  min = Math.abs(Math.floor(min / minMeasure) * minMeasure)
  if (min === 0) min = minMeasure
  for (let i = 0; i < data.length; i++) {
    let range;
    if (min === 0.1) {
      range = (Math.floor(data[i] / min) * min).toFixed(1);
    } else {
      range = Math.floor(data[i] / min) * min;
    }
    if (statistics[range]) {
      statistics[range]++;
    } else {
      statistics[range] = 1;
    }
  }
  // x轴数据
  const xAxisData = Object.keys(statistics);
  // y轴数据
  const yAxisData = Object.values(statistics);

  const colors = [ '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
  let option = {
    color: colors[colorNum],
    title: {
      text: titleName,
      bottom: 0,
      left: "center",
    },
    xAxis: {
      type: "category",
      data: xAxisData,

    },
    yAxis: {
      type: "value",
      name: "Count",
    },
    series: [
      {
        type: "bar",
        data: yAxisData,
      },
    ],
  };
  const Chart = echarts.init(chartContainter);
  // const Chart = initECharts(chartContainter);
  Chart.setOption(option);
}
