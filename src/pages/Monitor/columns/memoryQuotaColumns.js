const CPUQuotaColumns = [
  {
    title: 'Pod',
    dataIndex: 'pod',
    width: 350
  },
  {
    title: 'Memory Usage',
    dataIndex: 'memoryUsage',
    render: function(text, record, index) {
      return text && (text * 9.54 * Math.pow(10, -7)).toFixed(2) + 'MiB'
    },
    width: 200
  },
  {
    title: 'Memory Requests',
    dataIndex: 'memoryRequests',
    render: function(text, record, index) {
      return text && (text * 9.54 * Math.pow(10, -7)).toFixed(2) + 'MiB'
    },
    width: 200
  },
  {
    title: 'Memory Requests %',
    dataIndex: 'memoryRequestsPercent',
    render: function(text, record, index) {
      return text && (text * 100).toFixed(2) + '%'
    },
    width: 200
  },
  {
    title: 'Memory Limits',
    dataIndex: 'memoryLimit',
    render: function(text, record, index) {
      return text && (text * 9.54 * Math.pow(10, -7)).toFixed(2) + 'MiB'
    },
    width: 200
  },
  {
    title: 'Memory Limits %',
    dataIndex: 'memoryLimitPercent',
    render: function(text, record, index) {
      return text && (text * 100).toFixed(2) + '%'
    },
    width: 200
  },
  {
    title: 'Memory Usage (Rss)',
    dataIndex: 'memoryUsageRss',
    render: function(text, record, index) {
      return text && (text * 9.54 * Math.pow(10, -7)).toFixed(2) + 'MiB'
    },
    width: 200
  },
  {
    title: 'Memory Usage (Cache)',
    dataIndex: 'memoryUsageCache',
    render: function(text, record, index) {
      return text && (text * 9.54 * Math.pow(10, -7)).toFixed(2) + 'MiB'
    },
    width: 200
  },
  {
    title: 'Memory Usage (Swap)',
    dataIndex: 'memoryUsageSwap',
    render: function(text, record, index) {
      return text && (text * 9.54 * Math.pow(10, -7)).toFixed(2) + 'MiB'
    },
    width: 200
  }
]
  export default CPUQuotaColumns