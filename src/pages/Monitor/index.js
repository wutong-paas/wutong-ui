/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable react/sort-comp */
/* eslint-disable no-underscore-dangle */
import {
  Collapse,
  Select,
  Row,
  Col,
  Table
} from 'antd'
import { connect } from 'dva'
import React, { PureComponent } from 'react'
import PageHeaderLayout from '../../layouts/PageHeaderLayout'
import AreaChart from './AreaChart'
import styles from './index.less'
import cookie from '../../utils/cookie'

import CPUQuotaColumns from './columns/CPUQuotaColumns'
import memoryQuotaColumns from './columns/memoryQuotaColumns'
import networkQuotaColumns from './columns/networkQuotaColumns'

import configOfCPUUsage from './config/configOfCPUUsage'
import configOfMemoryUsage from './config/configOfMemoryUsage'

const { Panel } = Collapse

@connect(({ global }) => ({
  enterprise: global.enterprise
}))

export default class Monitor extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      headLinesData: null,
      CPUQuotaData: null,
      CPUUsageData: null,
      memoryQuotaData: null,
      memoryUsageData: null,
      networkQuotaData: null,
      CPUQuotaLoading: true,
      memoryQuotaLoading: true,
      networkQuotaLoading: true
    }
  }
  
  componentDidMount() {
    this.initData()
    this.rollPollInterval = setInterval(() => {
      this.initData()
    }, 10000)
  }

  componentWillUnmount() {
    clearInterval(this.rollPollInterval)
  }

  initData = () => {
    this.getSpecialItemData('headLines')
    this.getSpecialItemData('CPUQuota')
    this.getSpecialItemData('memoryQuota')
    this.getSpecialItemData('networkQuota')

    this.getChartItemData('CPUUsage')
    this.getChartItemData('memoryUsage')
  }

  getSpecialItemData = (itemType) => {
    const { dispatch } = this.props
    const { teamName, regionName } = this.props.match.params
    const enterprise_id = cookie.get('enterprise_id')
    const start = this.getTimeBySeconds()
    var type = ''

    if (itemType === 'headLines') {
      type = 'region/headlinesDataGet'
    } else if (itemType === 'CPUQuota') {
      type = 'region/CPUQuotaDataGet'
    } else if (itemType === 'memoryQuota') {
      type = 'region/memoryQuotaDataGet'
    } else if (itemType === 'networkQuota') {
      type = 'region/networkQuotaDataGet'
    }
    
    dispatch({
      type,
      payload: {
        region: regionName,
        team: teamName,
        enterprise: enterprise_id,
        start
      },
      callback: res => {
        if (res && res.status_code === 200) {
          const result = res.response_data.result

          if (itemType === 'headLines') {
            this.setState({
              headLinesData: result
            })
          } else if (itemType === 'CPUQuota') {
            this.setState({
              CPUQuotaData: result,
              CPUQuotaLoading: false
            })
          } else if (itemType === 'memoryQuota') {
            this.setState({
              memoryQuotaData: result,
              memoryQuotaLoading: false
            })
          } else if (itemType === 'networkQuota') {
            this.setState({
              networkQuotaData: result,
              networkQuotaLoading: false
            })
          }
        }
      }
    })

  }

  getChartItemData = (itemType) => {
    const { dispatch } = this.props
    const { teamName, regionName } = this.props.match.params
    const enterprise_id = cookie.get('enterprise_id')
    const end = this.getTimeBySeconds()
    const start = end - 3600
    var type = ''

    if (itemType === 'CPUUsage') {
      type = 'region/CPUUsageDataGet'
    } else if (itemType === 'memoryUsage') {
      type = 'region/memoryUsageDataGet'
    }

    dispatch({
      type,
      payload: {
        enterprise: enterprise_id,
        region: regionName,
        team: teamName,
        step: 60,
        start,
        end
      },
      callback: res => {
        if (res && res.status_code === 200) {
          const result = res.response_data.result

          result.forEach(item => {
            if (item.value === 'NaN') {
              item.value = null
            }
          })
          if (itemType === 'CPUUsage') {
            this.setState({
              CPUUsageData: result
            })
          } else if (itemType === 'memoryUsage') {
            this.setState({
              memoryUsageData: result
            })
          }
          
        }
      }
    })
  }

  getTimeBySeconds = () => {
    return parseInt(Date.parse(new Date()).toString().substr(0, 10))
  }

  generateTableJsx = (dataSource, columns, loading) => {
    return (
      <Table scroll={{ x: true }} style={{ margin: '10px 0 30px' }} dataSource={dataSource} columns={columns} loading={loading} pagination={false} />
    )
  }

  generateAreaChartJsx = (metaData, config) => {
    return (
      <AreaChart metaData={metaData} scale={config.scale}></AreaChart>
    )
  }

  render() {
    const {
      headLinesData,
      CPUUsageData,
      CPUQuotaData,
      memoryQuotaData,
      memoryUsageData,
      networkQuotaData,
      CPUQuotaLoading,
      memoryQuotaLoading,
      networkQuotaLoading
    } = this.state
  
    return (
      <PageHeaderLayout
        title="监控"
        content="命名空间下监控指标"
      >
        <Collapse
          bordered={false}
          defaultActiveKey={['1', '2', '3', '4', '5', '6']}
          className="site-collapse-custom-collapse"
        >
          <Panel header="Headlines" key="1" className={styles['site-collapse-custom-panel']}>
            <Row>
              { 
                headLinesData && headLinesData.map((item, index) => {
                  return (
                    <Col span={6} key={item.key}>
                      <div className={styles.headLinesBox}>
                        <div className={styles.headLinesBoxKey}>{item.key}</div>
                        <div className={styles.headLinesBoxValue}>{(item.value * 100).toFixed(1) + '%'}</div>
                      </div>
                    </Col>
                  )
                })
              }
            </Row>
          </Panel>
          <Panel header="CPU Usage" key="2" className="site-collapse-custom-panel">
            {this.generateAreaChartJsx(CPUUsageData, configOfCPUUsage)}
          </Panel>
          <Panel header="CPU Quota" key="3" className="site-collapse-custom-panel">
            {this.generateTableJsx(CPUQuotaData, CPUQuotaColumns, CPUQuotaLoading)}
          </Panel>
          <Panel header="Memory Usage" key="4" className="site-collapse-custom-panel">
            {this.generateAreaChartJsx(memoryUsageData, configOfMemoryUsage)}
          </Panel>
          <Panel header="Memory Quota" key="5" className="site-collapse-custom-panel">
            {this.generateTableJsx(memoryQuotaData, memoryQuotaColumns, memoryQuotaLoading)}
          </Panel>
          <Panel header="Current Network Usage" key="6" className="site-collapse-custom-panel">
            {this.generateTableJsx(networkQuotaData, networkQuotaColumns, networkQuotaLoading)}
          </Panel>
        </Collapse>
      </PageHeaderLayout>
    )
  }
}
