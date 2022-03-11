const configOfNetworkIO = {
    title: 'Network I/O',
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
        return text / 1000 + 'KB/S'
      }
    },
    tooltip: ['timestamp*value*instance',(timestamp, value, instance)=>{
      return {
        name: instance,
        value: (value / 1000).toFixed(2) + 'KB/S'
      }
    }]
  }
  export default configOfNetworkIO
    