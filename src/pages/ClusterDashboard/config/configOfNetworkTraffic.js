const configOfNetworkTraffic = {
  title: 'Network Traffic',
  scale: {
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
      return text + 'p/s'
    }
  },
  tooltip: ['timestamp*value*instance',(timestamp, value, instance)=>{
    return {
      name: instance,
      value: value.toFixed(2) + 'p/s'
    }
  }]
}
export default configOfNetworkTraffic
  