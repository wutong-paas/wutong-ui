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

import configOfAPIServerRequestRate from '../config/configOfAPIServerRequestRate'

import configOfPodSchedulingStatus from '../config/configOfPodSchedulingStatus'

import configOfControllerManagerQueueDepth from '../config/configOfControllerManagerQueueDepth'
import configOfIngressControllerConnections from '../config/configOfIngressControllerConnections'

@connect(() => ({}))

export default class EnterpriseClusters extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      // Detail和Summary的单选
      descType: '0',
      // 查询时间段区间
      rangeType: '300',
      // 查询时间段间隔
      step: '60',
      // 轮询时间
      rollPollTime: '30000',

      // APIServerRequestRate的数据源
      dataOfAPIServerRequestRate: null,
      // PodSchedulingStatus的数据源
      dataOfPodSchedulingStatus: null,
      // ControllerManagerQueueDepth的数据源
      dataOfControllerManagerQueueDepth: null,
      // IngressControllerConnections的数据源
      dataOfIngressControllerConnections: null
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
    this.getAPIServerRequestRateData()
    this.getControllerManagerQueueDepthData()
    this.getPodSchedulingStatusData()
    this.getIngressControllerConnectionsData()
  }

  getAPIServerRequestRateData = () => {
    const { descType } = this.state
    var query = configOfAPIServerRequestRate.query[descType]
    this.getAPIServerRequestRateLineChart(query)
  }

  getControllerManagerQueueDepthData = () => {
    const { descType } = this.state
    this.getMultiLineChart(descType, 'ControllerManagerQueueDepth')
  }

  getPodSchedulingStatusData = () => {
    const { descType } = this.state
    var query = configOfPodSchedulingStatus.query[descType]
    this.getSingleLineChart(query, 'PodSchedulingStatus')
  }

  getIngressControllerConnectionsData = () => {
    const { descType } = this.state
    this.getMultiLineChart(descType, 'IngressControllerConnections')
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

          if (lineChart === 'PodSchedulingStatus') {
            this.setState({
              dataOfPodSchedulingStatus: colData
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

    if (lineChart === 'ControllerManagerQueueDepth') {
      asncType = 'region/controllerManagerQueueDepthClusterDashboard'
    } else if (lineChart === 'IngressControllerConnections') {
      asncType = 'region/ingressControllerConnectionsClusterDashboard'
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

          if (lineChart === 'ControllerManagerQueueDepth') {
            this.setState({
              dataOfControllerManagerQueueDepth: colData
            })
          } else if (lineChart === 'IngressControllerConnections') {
            this.setState({
              dataOfIngressControllerConnections: colData
            })
          }
        }
      }
    })
  }

  getAPIServerRequestRateLineChart = query => {
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
            const code = item.metric.code
            item.dataValues.forEach(subItem => {
              subItem.instance = item.metric.instance ? `${code}(${item.metric.instance})` : code
            })
            colData.push(...item.dataValues)
          })

          colData.forEach(item => {
            item.timestamp = this.formatTimeStamp(item.timestamp)
          })

          this.setState({
            dataOfAPIServerRequestRate: colData
          })
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
      dataOfAPIServerRequestRate,
      dataOfControllerManagerQueueDepth,
      dataOfPodSchedulingStatus,
      dataOfIngressControllerConnections } = this.state
    const descTypeOptions = [
      { label: 'Detail', value: '0' },
      { label: 'Summary', value: '1' }
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
          <Col span={12}>{ this.generateJsx(dataOfAPIServerRequestRate, configOfAPIServerRequestRate) }</Col>
          <Col span={12}>{ this.generateJsx(dataOfControllerManagerQueueDepth, configOfControllerManagerQueueDepth) }</Col>
          <Col span={12}>{ this.generateJsx(dataOfPodSchedulingStatus, configOfPodSchedulingStatus) }</Col>
          <Col span={12}>{ this.generateJsx(dataOfIngressControllerConnections, configOfIngressControllerConnections) }</Col>
        </Row>
      </div>
    )
  }
}
