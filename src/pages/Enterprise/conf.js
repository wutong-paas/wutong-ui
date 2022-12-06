const levelTextColor = {
  一般: 'rgba(36, 103, 246, 1)',
  正常: 'rgba(6, 199, 127, 1)',
  警告: 'rgba(255, 191, 119, 1)',
  严重: 'rgba(253, 106, 106, 1)',
  紧急: 'red'
};

export const computedPercentage = (dividend, divisor) => {
  if (dividend == 0 || divisor == 0) {
    return 0;
  }
  return Math.round(((dividend / divisor) * 100).toFixed(2));
};

export const GroupNodeColunms = [
  {
    title: '节点',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'CPU（核数）',
    dataIndex: 'cpu',
    key: 'cpu'
  },
  {
    title: '内存（GB）',
    dataIndex: 'memory',
    key: 'memory'
  },
  {
    title: '容器组（个）',
    dataIndex: 'pod',
    key: 'pod'
  }
];

export const GroupEventColunms = [
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
    width: 180
  },
  {
    title: '类型',
    dataIndex: 'name',
    key: 'name',
    width: 200
  },
  {
    title: '描述',
    dataIndex: 'mesc',
    key: 'mesc'
  },
  {
    title: '等级',
    dataIndex: 'level',
    key: 'level',
    width: 80,
    render: (text, record) => (
      <span style={{ color: levelTextColor[text] }}>{text}</span>
    )
  }
];

export const tabList = [
  {
    name: '应用服务监控',
    tooltip: '统计平台管理的所有的应用和组件的运行情况'
  },
  {
    name: '集群节点',
    tooltip: '对集群管理的所有节点逐个统计节点的资源使用情况'
  },
  {
    name: '集群事件',
    tooltip: '实时显示平台管理的集群的事件，便于及时了解集群的健康状况'
  }
];

export const useInfoList = res => {
  const { node, pod, store } = res || {};
  return [
    {
      percentage: computedPercentage(store?.used_cpu, store?.total_cpu),
      use: store?.used_cpu || '0',
      total: store?.total_cpu?.toFixed(2) || '0',
      unit: 'Core',
      id: Math.random(),
      whoUse: 'CPU'
    },
    {
      percentage: computedPercentage(store?.used_memory, store?.total_memory),
      use: store?.used_memory || '0',
      total: store?.total_memory?.toFixed(2) || '0',
      unit: 'GB',
      id: Math.random(),
      whoUse: '内存'
    },
    {
      percentage: computedPercentage(pod?.used_pod, pod?.total),
      use: pod?.used_pod || '0',
      total: pod?.total?.toFixed(2) || '0',
      unit: '个',
      id: Math.random(),
      whoUse: '容器组'
    },
    {
      percentage: computedPercentage(store?.used_disk, store?.total_disk),
      use: store?.used_disk || '0',
      total: store?.total_disk?.toFixed(2) || '0',
      unit: 'GB',
      id: Math.random(),
      whoUse: '存储'
    }
  ];
};

export const serviceMonitorList = res => [
  {
    count: res?.total,
    text: '总共'
  },
  {
    count: res?.running,
    text: '运行'
  },
  {
    count: res?.abnormal,
    text: '故障'
  },
  {
    count: res?.unrunning,
    text: '未运行'
  }
];

export const radarOption = res => {
  const { store, node, pod } = res || {};
  const cpuPercentAge = computedPercentage(store?.used_cpu, store?.total_cpu);
  const memoryPercentAge = computedPercentage(
    store?.used_memory,
    store?.total_memory
  );
  const podPercentAge = computedPercentage(pod?.used_pod, pod?.total);
  const diskPercentAge = computedPercentage(
    store?.used_disk,
    store?.total_disk
  );
  const width = window.innerWidth;
  const height = window.innerHeight;
  const percent = width / 1920;

  return {
    // legend: {
    //   data: []
    // },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#525b75',
      borderColor: '#525b75', // 修改背景颜色
      textStyle: {
        color: '#FFFFFF'
      }, // 修改字体颜色
      formatter: function(params) {
        //使用formatter函数修改需要的样式
        const titleList = ['CPU', '存储', '容器组', '内存'];
        let relVal = params.name;
        for (let i = 0; i < params.value.length; i++) {
          relVal += '<br/>' + titleList[i] + ' : ' + params.value[i] + '%';
        }
        return relVal;
      }
    },
    radar: {
      shape: 'circle',
      indicator: [
        { name: 'CPU', max: 100, color: 'rgba(0, 0, 0, 1)' },
        { name: '内存', max: 100, color: 'rgba(0, 0, 0, 1)' },
        { name: '容器组', max: 100, color: 'rgba(0, 0, 0, 1)' },
        { name: '存储', max: 100, color: 'rgba(0, 0, 0, 1)' }
      ],
      axisName: {
        fontSize: 14 * percent
      },
      nameGap: 10 * percent,
      axisLine: {
        lineStyle: {
          color: 'rgba(221, 233, 243, 1)'
        }
      },
      splitArea: {
        lineStyle: {
          color: ['rgba(221, 233, 243, 1)']
        },
        areaStyle: {
          color: ['rgba(250, 253, 255, 1)']
        }
      }
    },
    series: [
      {
        name: 'Budget vs spending',
        type: 'radar',
        data: [
          {
            value: [
              cpuPercentAge,
              memoryPercentAge,
              podPercentAge,
              diskPercentAge
            ],
            name: '集群资源使用情况'
          }
          // {
          //   value: [20, 80, 30, 90,],
          //   name: 'Actual Spending'
          // }
        ],
        itemStyle: {
          color: 'rgba(0, 112, 255, 1)'
        },
        areaStyle: {
          color: 'rgba(0, 112, 255, 0.2000)'
        },
        lineStyle: {
          color: 'rgba(0, 112, 255, 1)'
        }
      }
    ]
  };
};

export const pieOptions = percentage => ({
  series: [
    {
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        // label: {
        //   show: true,
        //   fontSize: '40',
        //   fontWeight: 'bold'
        // }
        scale: false
      },
      labelLine: {
        show: false
      },
      data: [
        { value: percentage, itemStyle: { color: '#08153A' } },
        { value: 100 - percentage, itemStyle: { color: '#CCD9FF' } }
      ]
    }
  ]
});

export const appPieOptions = (flag, res) => ({
  tooltip: {
    trigger: 'item'
  },
  series: [
    {
      type: 'pie',
      selectedMode: 'single',
      radius: [0, '35%'],
      silent: true,
      center: ['50%', '50%'],
      label: {
        position: 'inner',
        fontSize: 16,
        fontWeight: '700',
        position: 'center'
      },
      emphasis: {
        scale: false
      },
      data: [
        {
          value: 100,
          name: flag,
          itemStyle: {
            color: '#f6f8fe'
          }
        }
      ]
    },
    {
      name: flag,
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'outside'
      },
      labelLine: {
        show: true,
        length: 10,
        length2: 5,
        smooth: true
      },
      data: [
        {
          value: res?.running,
          name: '运行',
          itemStyle: { color: '#06C77F' }
        },
        {
          value: res?.abnormal,
          name: '故障',
          itemStyle: { color: '#FFBF77' }
        },
        {
          value: res?.unrunning,
          name: '未运行',
          itemStyle: { color: '#95A4CE' }
        }
      ]
    }
  ]
});

export const tagColorList = ['', '#06C77F', '#FFBF77', '#727D9C'];
