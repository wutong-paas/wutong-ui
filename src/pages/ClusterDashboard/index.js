/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable react/sort-comp */
/* eslint-disable no-underscore-dangle */
import {
  Tabs
} from 'antd'
import React, { PureComponent } from 'react'
import PageHeaderLayout from '../../layouts/PageHeaderLayout'
import ClusterMetricsTab from './clusterMetricsTab'
import KubernetesComponentsMetricsTab from './kubernetesComponentsMetricsTab'

export default class EnterpriseClusters extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      activeKey: 'clusterMetrics'
    }
  }
  
  componentDidMount() {
  }

  componentWillUnmount() {
  }
  
  tabsChange = val => {
    this.setState({
      activeKey: val
    })
  }

  render() {
    const { TabPane } = Tabs
    const { activeKey } = this.state
    const { enterprise, region } = this.props.match.params

    return (
      <PageHeaderLayout
        title="集群监控"
        content="直观全面的展示了集群的一些基本数据信息。"
      >
        <Tabs defaultActiveKey={activeKey} type="card" onChange={this.tabsChange}>

          <TabPane tab="Cluster Metrics" key="clusterMetrics">
            {activeKey === 'clusterMetrics' && <ClusterMetricsTab enterprise={enterprise} region={region} />}
          </TabPane>

          <TabPane tab="Kubernetes Components Metrics" key="kubernetesComponentsMetrics">
            {activeKey === 'kubernetesComponentsMetrics' && <KubernetesComponentsMetricsTab enterprise={enterprise} region={region} />}
          </TabPane>

        </Tabs>
      </PageHeaderLayout>
    )
  }
}
