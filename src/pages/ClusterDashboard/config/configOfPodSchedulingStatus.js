const configOfPodSchedulingStatus = {
  title: 'Pod Scheduling Status',
  query: ['sum(kube_pod_status_scheduled{condition="false"})', 'sum(kube_pod_status_scheduled{condition="false"})'],
  scale: {
    value: {
      ticks:[0, 0.2, 0.4, 0.6, 0.8, 1.0]
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
  }
}
export default configOfPodSchedulingStatus
