/* eslint-disable react/sort-comp */
/* eslint-disable react/no-array-index-key */
/* eslint-disable eqeqeq */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-string-refs */
import { Button, Card, Cascader, Form, Input, Select, DatePicker, Icon, Table, Divider, Dropdown, Menu, message, notification, Radio, Alert, Spin } from 'antd'
import { G2, Chart, Geom, Axis, Tooltip, Coord, Label, Legend, View, Guide, Shape, Facet, Util } from 'bizcharts'
import { PlusCircleTwoTone, MinusCircleTwoTone, DownOutlined, EyeTwoTone } from "@ant-design/icons"
import { connect } from 'dva'
import React, { Fragment, PureComponent } from 'react'
import Ansi from '../../components/Ansi/index'
import NoPermTip from '../../components/NoPermTip'
import { getContainerLog, getServiceLog1, getVisitInfo } from '../../services/app'
import appUtil from '../../utils/app'
import globalUtil from '../../utils/global'
import HistoryLog from './component/Log/history'
import History1000Log from './component/Log/history1000'
import styles from './log2.less'
import axios from 'axios'
import $ from 'jquery'

const { Option } = Select
const { RangePicker } = DatePicker

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    align: 'center',
    width: 70,
    render: (text, record, index) => `${index + 1}`
  },
  {
    title: '时间',
    dataIndex: 'time',
    width: '360px',
    key: 'time'
  },
  {
    title: '事件',
    dataIndex: 'log',
    key: 'log',
    render: text => {
      let html = { __html: text }
      return <div dangerouslySetInnerHTML={html}></div>
    }
  }
]


@connect(({ }) => ({}))

export default class ComponentLog extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      podInfo: {},
      keyOptionList: [],
      searchParam: {
        fieldName: '',
        fieldValue: '',
        startDate: '',
        endDate: '',
        queryWords: '',
      },
      pagination: {
        current: 1,
        pageSize: 10
      },
      dataSource: [],
      menuName: '小时',
      logIndex: 'docker',
      timeInterval: 'hour',
      chartVisible: true,
      chartVisibleIcon: 'eye-invisible',
      chartVisibleName: '隐藏图表',
      chartDataSource: [],
      service_id: null,
      indexFieldParams: null,
      originOptionList: null,
      // 绝对时间和相对时间变量
      descType: '0',
      // 相对时间变量
      rangeType: null,
      // 加载变量，0为未加载，1为加载中，2为加载完成
      dataLoading: null
    }
  }

  handleMenuChange = (key, option) => {
    let menuName = option.props.children
    let interval = key
    setTimeout(() => {
      this.setState({
        menuName: menuName,
        timeInterval: interval
      })
      this.fetchLogMatrix()
    }, 0)
  }
  componentDidMount() {
    this.setServiceID()
    this.setScrollRules()
  }

  setServiceID = () => {
    const { service_id } = this.props.match.params
    this.setState({
      service_id
    }, () => {
      this.fetchLogMatrix()
      this.fetchComponentLogKeys()
      this.fetchLogList()
    })
  }

  setScrollRules = () => {
    $('.globalContentBox').scroll(e => {
      var t = Math.ceil(e.currentTarget.scrollTop)
      var c = e.currentTarget.clientHeight
      var s = e.currentTarget.scrollHeight
      if (t + c >= s) {
        let tempPagination = this.state.pagination
        if (tempPagination.current < 50) {
          this.setState({
            dataLoading: '1'
          }, () => {
            tempPagination.current += 1
            this.setState({ pagination: tempPagination })
            this.fetchLogList(true)
          })
        } else {
          this.setState({
            dataLoading: '2'
          })
        }
      }
    })
  }

  loadChildOption = (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1]
    targetOption.loading = true
    this.fetchComponentLogValues(targetOption)
  }

  fieldSelectedDisplay = (label, selectedOptions) => {
    let title = ""
    if (selectedOptions[0] && selectedOptions[1]) {
      title = selectedOptions[0].label + "=" + selectedOptions[1].name
      let params = this.state.searchParam
      params.fieldName = selectedOptions[0].label
      params.fieldValue = selectedOptions[1].name
      this.setState({
        searchParam: params
      })
    }
    return title
  }

  fetchComponentLogKeys = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'clog/getComponentLogkeys',
      payload: {
        service_id: this.state.service_id,
        page: 1,
        size: 100
      },
      callback: res => {
        if (res && res.status_code == 200 && res.response_data) {
          let resData = res.response_data
          if (!resData.status) {
            notification['error']({
              message: 'error',
              description: resData.errorMes
            })
            return
          }
          let optionList = []

          // 存储原始字段数据
          this.setState({
            originOptionList: resData.dataObject.data
          })

          resData.dataObject.data.forEach((item, index) => {
            let option = {
              label: item.fieldName,
              value: item.fieldName + '||' + item.type,
              name: item.fieldName,
              isLeaf: false
            }
            optionList.push(option)
          })
          this.setState({
            keyOptionList: optionList
          })
        }
      }
    })
  }


  fetchComponentLogValues = (selectedOption) => {
    const targetOption = selectedOption
    const { dispatch } = this.props
    const { originOptionList } = this.state

    if (selectedOption && selectedOption.name) {
      const name = selectedOption.name
      originOptionList.forEach(val => {
        if (val.fieldName === name) {
          this.setState({
            indexFieldParams: val
          })
        }
      })
    }


    dispatch({
      type: 'clog/getLogValueBykey',
      payload: {
        service_id: this.state.service_id,
        indexField: {
          type: targetOption.value.split("||")[1],
          fieldName: targetOption.value.split("||")[0]
        },
        page: 1,
        size: 100
      },
      callback: res => {
        targetOption.loading = false
        if (res && res.status_code == 200 && res.response_data && res.response_data.status) {
          let resData= res.response_data
          if(!resData.status){
            notification['error']({
              message: 'error',
              description: resData.errorMes
            })
            return
          }
          let optionList = []
          resData.dataObject.data.forEach((item, index) => {
            let option = {
              label: item.key,
              value: item.key,
              name: item.key
            }
            optionList.push(option)
          })
          targetOption.children = optionList
        }
      }
    })
  }

  searchLogs = () => {
    let tempPagination = this.state.pagination
    tempPagination.current = 1
    this.setState({ pagination: tempPagination })
    this.fetchLogList()
  }

  fetchLogList = (isSrcoll = false) => {
    const { dispatch } = this.props
    let params = {
      service_id: this.state.service_id,
      queryStr: this.state.searchParam.queryWords || ' ',
      page: this.state.pagination.current,
      size: this.state.pagination.pageSize
    }
    if (this.state.searchParam.fieldName) {
      params.fieldFilter = {
        indexField: this.state.indexFieldParams,
        value: this.state.searchParam.fieldValue
      }
    }
    if (this.state.searchParam.startDate && this.state.searchParam.endDate) {
      params.timeFilter = {
        start_time: this.state.searchParam.startDate,
        end_time: this.state.searchParam.endDate,
      }
    }

    dispatch({
      type: 'clog/getLogList',
      payload: params,
      callback: res => {
        if (res && res.status_code == 200 && res.response_data) {
          let responseData = res.response_data
          if (!responseData.status) {
            notification['error']({
              message: 'error',
              description: responseData.errorMes
            })
            return
          }
          let list = responseData.dataObject.data
          // 判断是否为滚动导致数据刷新
          if (isSrcoll) {
            let dataSource = this.state.dataSource
            let total = responseData.dataObject.total
            dataSource.push(...list)
            this.setState({ dataSource })
            if (dataSource.length === total) {
              this.setState({ dataLoading: '2' })
            } else {
              this.setState({ dataLoading: '0' })
            }
          } else {
            this.setState({ dataSource: list })
          }
        }
      }
    })
  }

  fetchLogMatrix = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'clog/getLogChartMatrix',
      payload: {
        service_id: this.state.service_id,
        interval: this.state.timeInterval
      },
      callback: res => {
        if (res && res.status_code == 200 && res.response_data) {
          let resData = res.response_data
          if (!resData.status) {
            notification['error']({
              message: 'error',
              description: resData.errorMes
            })
            return
          }
          let list = resData.dataObject.data
          this.setState({ chartDataSource: list })
        }
      }
    })
  }

  queryKeyChange=(e)=>{
    let param=this.state.searchParam
    param.queryWords=e.target.value
    this.setState({searchParam:param})
  }

  rangePickerChange = (start, end) => {
    this.setState({
      searchParam: {
        startDate: end[0],
        endDate: end[1]
      }
    })
  }

  rangeTypeChange = val => {
    this.setState({
      searchParam: {
        startDate: val,
        endDate: 'now'
      }
    })
  }

  switchChartVisible = () => {
    if (this.state.chartVisible) {
      this.setState({
        chartVisible: false,
        chartVisibleIcon: 'eye',
        chartVisibleName: '显示图表'
      })
    } else {
      this.setState({
        chartVisible: true,
        chartVisibleIcon: 'eye-invisible',
        chartVisibleName: '隐藏图表'
      })
    }
  }

  descTypeChange = e => {
    this.setState({
      descType: e.target.value,
      searchParam: {
        startDate: '',
        endDate: ''
      }
    })
  }

  render() {
    const { descType, rangeType, dataLoading } = this.state
    const descTypeOptions = [
      { label: '绝对时间搜索', value: '0' },
      { label: '相对时间搜索', value: '1' }
    ]
    return (
      <Card title="日志搜索" style={{ position: 'relative' }}>
        <a className={styles.chartSwitch} onClick={this.switchChartVisible}><Icon type={this.state.chartVisibleIcon} /> {this.state.chartVisibleName}</a>
        {
          this.state.chartVisible ?
            <div>
              <span style={{ position: 'absolute', top: '62px', left: '43%' }}>
                时间刻度：
                <Select defaultValue={this.state.timeInterval} onChange={this.handleMenuChange} style={{ width: '80px' }}>
                  <option key="year">年</option>
                  <option key="quarter">季度</option>
                  <option key="month">月</option>
                  <option key="week">周</option>
                  <option key="day">日</option>
                  <option key="hour">小时</option>
                  <option key="minute">分钟</option>
                </Select>
              </span>

              <Chart scale={{ key_as_string: {} }} height={260} data={this.state.chartDataSource} forceFit padding={{ bottom: 48, left: 40, top: 22 }} >
                <Axis name="key_as_string" />
                <Axis name="doc_count" />
                <Tooltip />
                <Geom type="interval" position="key_as_string*doc_count" size={9} />
              </Chart>
            </div> : null
        }
        <Radio.Group
          options={ descTypeOptions }
          onChange={this.descTypeChange}
          value={ descType }
          optionType="button"
          buttonStyle="solid"
          style={{marginBottom: '10px'}}
        />
        <Form layout="inline" name="logFilter" style={{ marginBottom: '16px' }}>
          <Form.Item
            name="logKey"
            label="过滤字段"
            style={{ marginRight: '10px' }}>
            <Cascader
              options={this.state.keyOptionList}
              loadData={this.loadChildOption}
              displayRender={this.fieldSelectedDisplay}
              placeholder="请选择字段"
              style={{ width: '260px' }}
            />
          </Form.Item>
          {descType === '0' && <Form.Item
            name="timeRange"
            label="时间范围"
            style={{ marginLeft:'10px' }}
          >
            <RangePicker showTime onChange={this.rangePickerChange} />
          </Form.Item>}
          {descType === '1' && <Form.Item
            name="relativeTime"
            label="相对时间"
            style={{ marginLeft:'10px' }}
          >
            <Select defaultValue={ rangeType } style={{ width: 180, marginRight: 10 }} onChange={ this.rangeTypeChange } placeholder="请选择相对时间">
              <Option value="now-1m">一分钟内</Option>
              <Option value="now-15m">十五分钟内</Option>
              <Option value="now-7d">七天内</Option>
            </Select>
          </Form.Item>}
          <Form.Item name="querykey" >
             <Input placeholder="日志关键字" style={{ width: 260 }} onChange={this.queryKeyChange}/>
          </Form.Item>
          <Form.Item name="button">
            <Button type="primary" onClick={this.searchLogs}><Icon type="search" />搜索</Button>
          </Form.Item>
          
        </Form>
        <div className={styles.tableBox}>
          <Table
            dataSource={this.state.dataSource}
            columns={columns}
            pagination={false}
            expandedRowRender={
              record => {
                const tempModel = []
                Object.keys(record).forEach(item => {
                  if (item !== 'time' && item !== 'log') {
                    tempModel.push(<div>{item}：{record[item]}</div>)
                  }
                })
                return (<div className={styles.expandRow}>{tempModel}</div>)
              }
            }
          />
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px 0'}}>
            {dataLoading === '0' && <span style={{color: '#999'}}>往下滚动继续加载数据…</span>}
            {dataLoading === '1' && <Spin />}
            {dataLoading === '2' && <span style={{color: '#999'}}>数据已加载完成，最多显示500条数据，可尝试优化条件继续搜索</span>}
          </div>
        </div>
      </Card>
    )
  }
}
