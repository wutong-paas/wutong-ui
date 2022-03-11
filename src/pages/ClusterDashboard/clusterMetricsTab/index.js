/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable react/sort-comp */
/* eslint-disable no-underscore-dangle */
import {
  Radio,
  Select,
  Row,
  Col
} from 'antd'
import React, { PureComponent } from 'react'
import { connect } from 'dva'
import LineChart from '../../../components/Charts/LineChart'

import configOfCPUUtilization from '../config/configOfCPUUtilization'
import configOfMemoryUtilization from '../config/configOfMemoryUtilization'
import configOfDiskUtilization from '../config/configOfDiskUtilization'

import configOfLoadAverage from '../config/configOfLoadAverage'
import configOfDiskIO from '../config/configOfDiskIO'
import configOfNetworkTraffic from '../config/configOfNetworkTraffic'
import configOfNetworkIO from '../config/configOfNetworkIO'

@connect(() => ({}))

export default class EnterpriseClusters extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      // Summary和Detail的单选
      descType: '1',
      // 查询时间段区间
      rangeType: '300',
      // 查询时间段间隔
      step: '60',
      // 轮询时间
      rollPollTime: '30000',

      // CPUUtilization的数据源
      dataOfCPUUtilization: null,
      // MemoryUtilization的数据源
      dataOfMemoryUtilization: null,
      // Disk Utilization的数据源
      dataOfDiskUtilization: null,
      // LoadAverage的数据源
      dataOfLoadAverage: null,
      // DiskIO的数据源
      dataOfDiskIO: null,
      // NetworkTraffic的数据源
      dataOfNetworkTraffic: null,
      // NetworkIO的数据源
      dataOfNetworkIO: null,
    }
  }

  componentDidMount() {
    const { rollPollTime } = this.state

    this.initData()
    this.rollPollInterval = setInterval(() => {
      this.initData()
    }, rollPollTime)
  }

  componentWillUnmount() {
    clearInterval(this.rollPollInterval)
  }

  initData = () => {
    this.getCPUUtilizationData()
    this.getLoadAverageData()
    this.getMemoryUtilizationData()
    this.getDiskUtilizationData()
    this.getDiskIOData()
    this.getNetworkTrafficData()
    this.getNetworkIOData()
  }

  getCPUUtilizationData = () => {
    const { descType } = this.state
    var query = configOfCPUUtilization.query[descType]
    this.getSingleLineChart(query, 'CPUUtilization')
  }

  getLoadAverageData = () => {
    const { descType } = this.state
    this.getMultiLineChart(descType, 'LoadAverage')
  }

  getMemoryUtilizationData = () => {
    const { descType } = this.state
    var query = configOfMemoryUtilization.query[descType]
    this.getSingleLineChart(query, 'MemoryUtilization')
  }

  getDiskUtilizationData = () => {
    const { descType } = this.state
    var query = configOfDiskUtilization.query[descType]
    this.getSingleLineChart(query, 'DiskUtilization')
  }

  getDiskIOData = () => {
    const { descType } = this.state
    this.getMultiLineChart(descType, 'DiskIO')
  }

  getNetworkTrafficData = () => {
    const { descType } = this.state
    this.getMultiLineChart(descType, 'NetworkTraffic')
  }

  getNetworkIOData = () => {
    const { descType } = this.state
    this.getMultiLineChart(descType, 'NetworkIO')
  }

  getSingleLineChart = (query, lineChart) => {
    const { dispatch, enterprise, region } = this.props
    const { rangeType, step } = this.state

    const end = this.getStartBySeconds()
    const start = end - parseInt(rangeType)

    dispatch({
      type: 'region/singleClusterDashboard',
      payload: {
        start,
        end,
        step,
        enterprise,
        region,
        query
      },
      callback: res => {
        if (res && res.status_code === 200) {
          const result = res.response_data.result.result
          var colData = []

          result.forEach(item => {
            item.dataValues.forEach(subItem => {
              subItem.instance = item.metric.instance || 'Total'
            })
            colData.push(...item.dataValues)
          })

          colData.forEach(item => {
            item.timestamp = this.formatTimeStamp(item.timestamp)
          })

          if (lineChart === 'CPUUtilization') {
            this.setState({
              dataOfCPUUtilization: colData
            })
          } else if (lineChart === 'MemoryUtilization') {
            this.setState({
              dataOfMemoryUtilization: colData
            })
          } else if (lineChart === 'DiskUtilization') {
            this.setState({
              dataOfDiskUtilization: colData
            })
          }
        }
      }
    })
  }

  getMultiLineChart = (detail, lineChart) => {
    const { dispatch, enterprise, region } = this.props
    const { rangeType, step } = this.state
    var asncType = ''

    const end = this.getStartBySeconds()
    const start = end - parseInt(rangeType)

    if (lineChart === 'LoadAverage') {
      asncType = 'region/loadAverageClusterDashboard'
    } else if (lineChart === 'DiskIO') {
      asncType = 'region/diskIOClusterDashboard'
    } else if (lineChart === 'NetworkTraffic') {
      asncType = 'region/networkTrafficClusterDashboard'
    } else if (lineChart === 'NetworkIO') {
      asncType = 'region/networkIOClusterDashboard'
    }

    dispatch({
      type: asncType,
      payload: {
        start,
        end,
        step,
        enterprise,
        region,
        detail
      },
      callback: res => {
        if (res && res.status_code === 200) {
          const result = res.response_data.result
          var colData = []

          result.forEach(item => {
            const subResult = item.total.result
            const type = item.type
            subResult.forEach(subItem => {
              subItem.dataValues.forEach(litItem => {
                litItem.instance = subItem.metric.instance ? `${type}(${subItem.metric.instance})` : type
              })
              colData.push(...subItem.dataValues)
            })
          })

          colData.forEach(item => {
            item.timestamp = this.formatTimeStamp(item.timestamp)
          })

          if (lineChart === 'LoadAverage') {
            this.setState({
              dataOfLoadAverage: colData
            })
          } else if (lineChart === 'DiskIO') {
            this.setState({
              dataOfDiskIO: colData
            })
          } else if (lineChart === 'NetworkTraffic') {
            this.setState({
              dataOfNetworkTraffic: colData
            })
          } else if (lineChart === 'NetworkIO') {
            this.setState({
              dataOfNetworkIO: colData
            })
          }
        }
      }
    })
  }

  descTypeChange = e => {
    this.setState({
      descType: e.target.value
    }, () => {
      clearInterval(this.rollPollInterval)
      this.initData()
      this.rollPollInterval = setInterval(() => {
        this.initData()
      }, this.state.rollPollTime)
    })
  }

  rangeTypeChange = val => {
    const step = val > 21600 ? 300 : 60
    this.setState({
      rangeType: val,
      step: step
    }, () => {
      clearInterval(this.rollPollInterval)
      this.initData()
      this.rollPollInterval = setInterval(() => {
        this.initData()
      }, this.state.rollPollTime)
    })
  }

  rollPollTimeChange = val => {
    clearInterval(this.rollPollInterval)
    this.setState({
      rollPollTime: val
    }, () => {
      this.rollPollInterval = setInterval(() => {
        this.initData()
      }, this.state.rollPollTime)
    })
  }

  getStartBySeconds = () => {
    return parseInt(Date.parse(new Date()).toString().substr(0, 10))
  }

  formatTimeStamp = time => {  
    return new Date(parseInt(time) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ')
  }

  generateJsx = (data, config) => {
    return <LineChart data={data} title={config.title} scale={config.scale} xlabel={config.xlabel} ylabel={config.ylabel} tooltip={config.tooltip} />
  }

  render() {
    const { Option } = Select
    const { 
      descType, rangeType, rollPollTime,
      dataOfCPUUtilization,
      dataOfLoadAverage,
      dataOfMemoryUtilization,
      dataOfDiskUtilization,
      dataOfDiskIO,
      dataOfNetworkTraffic,
      dataOfNetworkIO } = this.state
    const descTypeOptions = [
      { label: 'Summary', value: '1' },
      { label: 'Detail', value: '0' }
    ]

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 20px 20px' }}>
          <Radio.Group
            options={ descTypeOptions }
            onChange={this.descTypeChange}
            value={ descType }
            optionType="button"
            buttonStyle="solid"
          />
          <div>
            <Select defaultValue={ rangeType } style={{ width: 130, marginRight: 10 }} onChange={ this.rangeTypeChange }>
              <Option value="300">五分钟内</Option>
              <Option value="3600">一小时内</Option>
              <Option value="21600">六小时内</Option>
              <Option value="86400">一天内</Option>
            </Select>

            <Select defaultValue={ rollPollTime } style={{ width: 130 }} onChange={ this.rollPollTimeChange }>
              <Option value="5000">5s刷新</Option>
              <Option value="10000">10s刷新</Option>
              <Option value="30000">30s刷新</Option>
              <Option value="60000">1m刷新</Option>
              <Option value="300000">5m刷新</Option>
            </Select>
          </div>
        </div>
        <Row>
          <Col span={12}>{ this.generateJsx(dataOfCPUUtilization, configOfCPUUtilization) }</Col>
          <Col span={12}>{ this.generateJsx(dataOfLoadAverage, configOfLoadAverage) }</Col>
          <Col span={12}>{ this.generateJsx(dataOfMemoryUtilization, configOfMemoryUtilization) }</Col>
          <Col span={12}>{ this.generateJsx(dataOfDiskUtilization, configOfDiskUtilization) }</Col>
          <Col span={12}>{ this.generateJsx(dataOfDiskIO, configOfDiskIO) }</Col>
          <Col span={12}>{ this.generateJsx(dataOfNetworkTraffic, configOfNetworkTraffic) }</Col>
          <Col span={12}>{ this.generateJsx(dataOfNetworkIO, configOfNetworkIO) }</Col>
        </Row>
      </div>
    )
  }
}
