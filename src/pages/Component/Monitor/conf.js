import { useRef, useEffect } from 'react';
import { formatTime } from '@/components/TwComponents/TwTimePicker/conf';
import moment from 'moment';
import * as echarts from 'echarts';

export const overviewList = [
  // {
  //   title: '总请求数',
  //   number: '3.07',
  //   unit: 'k'
  // },
  // {
  //   title: '平均响应时间',
  //   number: '1.02',
  //   unit: 's'
  // },
  {
    title: 'CPU用量',
    number: '10',
    unit: 'm',
    flag: 'cpu_usage'
  },
  {
    title: 'CPU使用率',
    number: '90.01',
    unit: '%',
    flag: 'cpu_rate'
  },
  {
    title: '内存用量',
    number: '546.29',
    unit: 'MB',
    flag: 'memory_usage'
  },
  {
    title: '内存使用率',
    number: '54.23',
    unit: '%',
    flag: 'memory_rate'
  }
];

export const tabList = [
  {
    label: '概览',
    isOutlink: false,
    key: 'overview',
    isHide: true
  },
  {
    label: '物理资源监控',
    isOutlink: false,
    key: 'resource'
  },
  {
    label: '调用链查询',
    isOutlink: true,
    key: 'trace'
  },
  {
    label: '日志',
    isOutlink: true,
    key: 'log'
  }
];

// 折线图颜色列表
const colorList = [
  '#2467F6',
  '#00CC78',
  '#018DA5',
  '#81DAEA',
  '#67DDAB',
  '#0C9B8A',
  '#02187B',
  '#164DE5',
  '#1E89EF',
  '#00BAFF',
  '#707D9F'
];

// 折线图x轴时间格式对象
const timeFormat = {
  minute: 'mm:ss',
  hour: 'HH:mm:ss',
  day: 'MM-DD HH:mm'
};

// echarts配置生成函数
export const getLineOption = (
  { seriesData, timestamps, yAxis, flag, name, unit } = {},
  timekey
) => {
  //将时间戳处理成对应的格式
  timestamps =
    timestamps &&
    timestamps.map(item =>
      moment(item).format(
        timekey === 'custom'
          ? 'YYYY-MM-DD HH:mm:ss'
          : timeFormat[formatTime[timekey].unit]
      )
    );
  //对数据进行处理，小于1的浮点数额外处理
  seriesData = seriesData.map(i => {
    if (i.data) {
      i.data = i.data.map(n => {
        if (n > 1) {
          return Math.round(n);
        }
        return toFixedFloatNumber(n);
      });
    }
    return i;
  });
  //基础配置
  const baseConfig = {
    color: ['#21CCFF'],
    legend: {
      icon: 'circle',
      top: 0,
      right: flag === 'response' || flag === 'request' ? '2%' : '5%',
      itemWidth: 6,
      itemHeight: 6,
      itemGap: 16,
      textStyle: {
        fontSize: 14,
        color: '#1D2129'
      },
      formatter: function(name) {
        if (name?.length > 10) name = name.slice(-5);
        return name;
      }
    },
    grid: {
      left: '1%',
      right: flag === 'response' || flag === 'request' ? '2%' : '5%',
      bottom: '4%',
      top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisTick: {
        interval: 0,
        length: 1,
        alignWithLabel: true
      },
      axisLabel: {
        show: true,
        fontSize: '12',
        color: '#86909C',
        interval: 'auto'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(0,0,0,0.16)'
        }
      },
      // data: echartsData.xData,
      data:
        timestamps ||
        [...new Array(5)].map((_item, index) =>
          moment()
            .add(index, 'day')
            .format('MM-DD HH:MM')
        )
    },
    yAxis: {
      type: 'value',
      // max: value => {
      //   return value;
      // },
      splitNumber: flag === 'response' ? 5 : flag === 'request' ? 6 : 3,
      axisLabel: {
        show: true,
        fontSize: '12',
        color: '#86909C',
        formatter:
          flag === 'response' || flag === 'request'
            ? '{value}ms'
            : `{value}${unit}`
      },
      splitLine: {
        lineStyle: {
          //type: [3, 6],
          color: '#E4E8F0'
          //dashOffset: 2
        }
      }
    }
  };
  // tooltip配置
  let tooltipConfig = (tooltipConfig = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#525b75',
      borderColor: '#525b75', // 修改背景颜色
      textStyle: {
        color: '#FFFFFF'
      }, // 修改字体颜色
      formatter: function(params) {
        //使用formatter函数修改需要的样式
        // console.log(params, 'ddd');
        let str = '';
        if (
          Object.prototype.toString.call(seriesData[0]) === '[object Object]'
        ) {
          params.map((item, index) => {
            str += `<div>
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 6px; background: ${
                index > 9 ? colorList[10] : colorList[index]
              }; marginRight: 4px"></span> 
              <span>${item?.seriesName}：</span> ${item?.value} ${unit}
            <div>`;
          });
        }
        const content =
          Object.prototype.toString.call(seriesData[0]) === '[object Object]'
            ? str
            : `<div>
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 6px; background: #06C77F; marginRight: 4px"></span> 
              <span>${params[0]?.seriesName}：</span> ${params[0]?.value}
              ${flag === 'response' || flag === 'request' ? 'ms' : unit}
            <div>`;
        const render = `
          <div>
            <div>
              ${params[0]?.axisValueLabel}
            <div>
            ${content}
          </div>`;

        return render;
      }
    }
  });

  // seriesData配置
  let seriesCofig = {};
  if (seriesData && seriesData[0] && typeof seriesData[0] === 'number') {
    seriesCofig = {
      series: [
        {
          name: name || '-',
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          type: 'line',
          data: seriesData,
          zlevel: 1,
          z: 1,
          itemStyle: {
            color: '#06C77F'
          },
          smooth: true,
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  // 折线图颜色渐变
                  offset: 0,
                  color: 'rgba(6, 199, 127, 0.4)'
                },
                {
                  offset: 1,
                  color: 'rgba(6, 199, 127, 0)'
                }
              ])
            }
          }
        }
      ]
    };
  }
  if (
    seriesData &&
    seriesData[0] &&
    Object.prototype.toString.call(seriesData[0]) === '[object Object]'
  ) {
    seriesCofig.series = seriesData.map(({ instance, data }, index) => {
      return {
        name: instance || '-',
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        type: 'line',
        data,
        zlevel: 1,
        z: 1,
        itemStyle: {
          color: index > 9 ? colorList[10] : colorList[index]
        },
        emphasis: {
          focus: 'series'
        },
        smooth: true,
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                // 折线图颜色渐变
                offset: 0,
                color:
                  index > 9 ? `${colorList[10]}40` : `${colorList[index]}40 `
              },
              {
                offset: 1,
                color:
                  index > 9 ? `${colorList[10]}00` : `${colorList[index]}00`
              }
            ])
          }
        }
      };
    });
  }
  //总配置
  return { ...tooltipConfig, ...baseConfig, ...seriesCofig };
};

export const chartsInfoList = [
  {
    flag: 'request',
    name: '请求数',
    seriesData: [900, 700, 1200, 500, 840]
  },
  {
    flag: 'response',
    name: '响应时间',
    seriesData: [3.5, 3.1, 0, 0, 3.4],
    unit: 'ms'
  }
];

/**
 * @description  hooks for batch create && init charts by echarts
 * @param {chartsInfoList}
 * @returns {chartsInstance}
 * @author  Leon
 */
export const useCharts = (listData, timekey) => {
  const chartsInstance = useRef([]);
  //init
  useEffect(() => {
    if (listData) {
      createChartsInstance();
      window.onresize = handleResize;
    }
  }, [listData]);

  //window resize event
  const handleResize = () => {
    if (chartsInstance.current.length > 0)
      chartsInstance.current.forEach(instance => instance.resize());
  };

  //created charts instance
  const createChartsInstance = () => {
    if (chartsInstance.current.length > 0) {
      chartsInstance.current.forEach(item => {
        item.dispose();
      });
    }
    listData.forEach(item => {
      const { flag, timestamps, seriesData } = item;
      if (timestamps?.length !== 0 && seriesData?.length !== 0) {
        const instance = echarts.init(document.getElementById(item.flag));
        instance.setOption(getLineOption(item, timekey));
        chartsInstance.current.push(instance);
      }
    });
    if (chartsInstance.current.length > 0)
      chartsInstance.current.forEach(item => {
        tooltipLinkAge(item, chartsInstance.current.filter(i => i !== item));
      });
  };

  //图表联动
  const tooltipLinkAge = (currentInstance, othersInstance) => {
    currentInstance.getZr()?.on('mousemove', params => {
      const pointInPixel = [params.offsetX, params.offsetY];
      // 判断当前鼠标移动的位置是否在图表中
      if (currentInstance.containPixel('grid', pointInPixel)) {
        //使用 convertFromPixel方法 转换像素坐标值到逻辑坐标系上的点。获取点击位置对应的x轴数据的索引值
        const pointInGrid = currentInstance.convertFromPixel(
          { seriesIndex: 0 },
          pointInPixel
        );
        // x轴数据的索引值
        const xIndex = pointInGrid[0];
        // 使用getOption() 获取图表的option
        const op = currentInstance.getOption();
        // 获取当前点击位置要的数据
        const xDate = op.xAxis[0].data[xIndex];
        // 这里不直接用params.dataIndex是因为可能两个图表X轴的月份数据点不一致
        const dataIndex = currentInstance
          .getOption()
          .xAxis[0].data.findIndex(x => x === xDate);
        othersInstance.forEach(element => {
          element.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            // echarts版本是4.8.0，用name而不用dataIndex时，不知道为什么tooltip不显示，所以这里用dataIndex
            // name: params.name
            dataIndex
          });
        });
      } else {
        othersInstance.forEach(element => {
          element.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            // echarts版本是4.8.0，用name而不用dataIndex时，不知道为什么tooltip不显示，所以这里用dataIndex
            // name: params.name
            dataIndex: -1
          });
        });
      }
    });
  };

  return { listData };
};

const toFixedFloatNumber = number => {
  if (!number || number === 0) {
    return number;
  }
  //转化为 string list
  const str = String(number);
  const strList = str.split('');
  let resultString = '';
  //找到第一个大于0的下标
  let firstIndex = -1;
  if (strList.length > 0) {
    for (const [index, i] of Object.entries(strList)) {
      if (Number(i) > 0) {
        firstIndex = Number(index);
        break;
      }
    }
  }
  //进行截取，取浮点数firstIndex后面的两位数
  if (firstIndex !== -1) {
    resultString = str.slice(0, firstIndex + 2);
  }
  return resultString ? Number(resultString) : number;
};
