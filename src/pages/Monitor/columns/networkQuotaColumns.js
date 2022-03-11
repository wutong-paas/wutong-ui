const CPUQuotaColumns = [
  {
    title: 'Pod',
    dataIndex: 'pod',
    width: 350
  },
  {
    title: 'Current Receive Bandwidth',
    dataIndex: 'currentReceiveBandwidth',
    render: function(text, record, index) {
      return text && text.toFixed(2) + 'B/s'
    },
    width: 250
  },
  {
    title: 'Current Transmit Bandwidth',
    dataIndex: 'currentTransmitBandwidth',
    render: function(text, record, index) {
      return text && text.toFixed(2) + 'B/s'
    },
    width: 250
  },
  {
    title: 'Rate of Received Packets',
    dataIndex: 'rateOfReceivedPackets',
    render: function(text, record, index) {
      return text && text.toFixed(2) + 'B/s'
    },
    width: 250
  },
  {
    title: 'Rate of Transmitted Packets',
    dataIndex: 'rateOfTransmittedPackets',
    render: function(text, record, index) {
      return text && text.toFixed(2) + 'p/s'
    },
    width: 250
  },
  {
    title: 'Rate of Received Packets Dropped',
    dataIndex: 'rateOfReceivedPacketsDropped',
    render: function(text, record, index) {
      return text && text.toFixed(2) + 'p/s'
    },
    width: 250
  },
  {
    title: 'Rate of Transmitted Packets Dropped',
    dataIndex: 'rateOfTransmittedPacketsDropped',
    render: function(text, record, index) {
      return text && text.toFixed(2) + 'p/s'
    },
    width: 300
  }
]
  export default CPUQuotaColumns