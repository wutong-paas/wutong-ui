const configOfMemoryUsage = {
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
        return (val * 9.54 * Math.pow(10, -7)).toFixed(2) + 'MiB'
      }
    }
  }
}
export default configOfMemoryUsage
  