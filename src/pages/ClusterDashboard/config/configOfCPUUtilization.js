const configOfCPUUtilization = {
  title: 'CPU Utilization',
  query: ['1 - avg(irate({__name__="node_cpu_seconds_total",mode="idle"}[240s])) by (instance)', '1 - avg(irate({__name__="node_cpu_seconds_total",mode="idle"}[240s]))'],
  scale: {
    value: {
      ticks:[0, 0.2, 0.4, 0.6, 0.8, 1]
    },
    timestamp: {
      range: [0, 1],
      tickCount: 5
    }
  },
  xlabel: {
    formatter(text, item, index) {
      return text.slice(11)
    }
  },
  ylabel: {
    formatter(text, item, index) {
      return text * 100 + '%'
    }
  },
  tooltip: ['timestamp*value*instance',(timestamp, value, instance)=>{
    return {
      name: instance,
      value: (value * 100).toFixed(2) + '%'
    }
  }]
}
export default configOfCPUUtilization
