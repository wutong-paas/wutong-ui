const configOfControllerManagerQueueDepth = {
  title: 'Controller Manager Queue Depth',
  query: ['sum(kube_pod_status_scheduled{condition="false"})', 'sum(kube_pod_status_scheduled{condition="false"})'],
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
  }
}
export default configOfControllerManagerQueueDepth
  