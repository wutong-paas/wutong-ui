const configOfAPIServerRequestRate = {
  title: 'API Server Request Rate',
  query: ['sum(rate(apiserver_request_total[240s])) by (instance, code)', 'sum(rate(apiserver_request_total[240s])) by (code)'],
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
  tooltip: ['timestamp*value*instance',(timestamp, value, instance)=>{
    return {
      name: instance,
      value: value.toFixed(1)
    }
  }]
}
export default configOfAPIServerRequestRate
