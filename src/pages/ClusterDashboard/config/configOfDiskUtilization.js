const configOfDiskUtilization = {
  title: 'Disk Utilization',
  query: ['1 - (sum(node_filesystem_free_bytes{device!~"rootfs|HarddiskVolume.+"} OR windows_logical_disk_free_bytes{volume!~"(HarddiskVolume.+|[A-Z]:.+)"}) by (instance) / sum(node_filesystem_size_bytes{device!~"rootfs|HarddiskVolume.+"} OR windows_logical_disk_size_bytes{volume!~"(HarddiskVolume.+|[A-Z]:.+)"}) by (instance))', '1 - (sum(node_filesystem_free_bytes{device!~"rootfs|HarddiskVolume.+"} OR windows_logical_disk_free_bytes{volume!~"(HarddiskVolume.+|[A-Z]:.+)"}) / sum(node_filesystem_size_bytes{device!~"rootfs|HarddiskVolume.+"} OR windows_logical_disk_size_bytes{volume!~"(HarddiskVolume.+|[A-Z]:.+)"}))'],
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
export default configOfDiskUtilization
