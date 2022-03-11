const configOfCPUUsage = {
  scale: {
    key: {
      type: "linear",
      tickCount: 10,
      formatter: val => {
        return new Date(parseInt(val) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ').slice(11)
      }
    },
    value: {
      formatter: val => {
        return val.toFixed(5)
      }
    }
  }
}
export default configOfCPUUsage
