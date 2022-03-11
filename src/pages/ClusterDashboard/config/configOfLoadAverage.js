const configOfLoadAverage = {
  title: 'Load Average',
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
export default configOfLoadAverage
  