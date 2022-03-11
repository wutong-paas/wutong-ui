const CPUQuotaColumns = [
  {
    title: 'Pod',
    dataIndex: 'pod',
    width: 350
  },
  {
    title: 'Cpu Usage',
    dataIndex: 'cpuUsage',
    render: function(text, record, index) {
      return text && text.toFixed(2)
    },
    width: 200
  },
  {
    title: 'Cpu Requests',
    dataIndex: 'cpuRequests',
    width: 200
  },
  {
    title: 'Cpu Requests %',
    dataIndex: 'cpuRequestsPercent',
    render: function(text, record, index) {
      return text && (text * 100).toFixed(2) + '%'
    },
    width: 200
  },
  {
    title: 'Cpu Limits',
    dataIndex: 'cpuLimits',
    width: 200
  },
  {
    title: 'Cpu Limits %',
    dataIndex: 'cpuLimitsPercent',
    render: function(text, record, index) {
      return text && (text * 100).toFixed(2) + '%'
    },
    width: 200
  }
]
export default CPUQuotaColumns
  