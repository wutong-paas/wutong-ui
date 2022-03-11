const configOfMemoryUtilization = {
  title: 'Memory Utilization',
  query: ['1 - sum(node_memory_MemAvailable_bytes OR windows_os_physical_memory_free_bytes) by (instance) / sum(node_memory_MemTotal_bytes OR windows_cs_physical_memory_bytes) by (instance)', '1 - sum(node_memory_MemAvailable_bytes OR windows_os_physical_memory_free_bytes) / sum(node_memory_MemTotal_bytes OR windows_cs_physical_memory_bytes)'],
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
export default configOfMemoryUtilization
