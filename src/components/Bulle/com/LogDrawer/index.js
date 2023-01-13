/**
 * @content  查询日志抽屉
 * @author   Leon
 * @date     2022/09/28
 *
 */
import React, { useState, memo, useEffect, useCallback, useRef } from 'react';
import {
  Drawer,
  Select,
  DatePicker,
  Button,
  Dropdown,
  Menu,
  Icon,
  Spin,
  message,
  Tooltip
} from 'antd';
import RenderList from './com/RendreList';
import TeamCondition from '../TeamCondition';
import moment from 'moment';
import { toBuildShape } from '@/services/api';
import {
  teamOptionList,
  timeOptionList,
  logList,
  timeObject,
  filterList,
  filterTermList,
  formatTime,
  getUrlParams,
  tagName
} from './conf';
import styles from './index.less';
import deleteImg from '../../../../../public/images/common/delete.svg';
import addImg from '../../../../../public/images/common/add.svg';
import { start } from '@/services/app';
import classNames from 'classnames';

const { RangePicker } = DatePicker;
const { Option } = Select;
const ButtonGroup = Button.Group;

const LogDrawer = props => {
  const {
    visible,
    onClose,
    openTraceDetail,
    teamList,
    dispatch,
    location: { pathname },
    wutongInfo = {},
    appList
  } = props;
  const { call_link_query } = wutongInfo;
  const [queryText, setQueryText] = useState('0');
  const [loading, setLoading] = useState(false);
  const [newLogList, setNewLogList] = useState([]); //日志列表
  const [heightList, setHeightList] = useState([]); //高度列表
  const [keyList, setKeyList] = useState([]); // 值列表
  const [filterValue, setfilterValue] = useState([]); //筛选条件对象
  const [originFilterList, setOriginFilterList] = useState([]); //筛选列表原始数据
  const [timeRange, setTimeRange] = useState({
    start: moment()
      .subtract('1', 'hour')
      .valueOf(),
    end: moment().valueOf()
  }); //筛选时间范围
  //const [filterList, setFilterList] = useState([]);
  const [nameSpace, setNamespace] = useState(undefined); //团队名称
  const [stateExpr, setStateExpr] = useState(''); //查询表达式
  const [selectLoading, setSelectLoading] = useState(false); //下拉状态
  const [currentId, setCurrentId] = useState(); //当前下拉框Id
  const [isExpand, setIsExpand] = useState(true);
  const [timeValue, setTimeValue] = useState('last15min');
  const timeId = useRef(null);
  const queryTextCurrent = useRef('0');
  const queryLogRef = useRef();
  // const currentLogList = useRef(); //定时轮询数据，保证数据应用不变
  // currentLogList.current = newLogList;

  //如果当前处在团队试图，从url上取到团队视图的team_name,再去找到namespace
  useEffect(() => {
    if (pathname) {
      const teamIndex = teamList.findIndex(
        i => i.team_name === getUrlParams(pathname, 'team')
      );
      const serviceIndex = appList.findIndex(
        i => i.service_id === getUrlParams(pathname, 'service_id')
      );
      const teamName = teamList[teamIndex]?.namespace;
      const serviceName = appList[serviceIndex]?.k8s_component_name;
      //    //到了指定的团队界面，默认赋值
      // if (teamName && !nameSpace) setNamespace(teamName);
      // //到了指定的组件页面，且没有查询条件，则新增一个
      // if (serviceName && filterValue.length === 0) {
      //   setfilterValue([
      //     {
      //       id: -1,
      //       tag: 'container',
      //       values: serviceName
      //     }
      //   ]);
      // }
      //TODO  先收集用户体验
      //到了指定的团队界面，默认赋值
      if (teamName) setNamespace(teamName);
      //如果当前的团队切换了，且不是在首页 清空查询结果和条件，重新带入新标签
      if (teamName && teamName !== nameSpace) {
        setNewLogList([]);
        setfilterValue([]);
      }
      //到了指定的组件页面，先清除log,并重置为当前页面的默认标签组（当前页的组件名称）,默认标签组的id为-1
      if (serviceName) {
        setNewLogList([]);
        setfilterValue([]);
        handleQueryTagList({
          id: -1,
          teamName,
          callback: filterList => {
            setfilterValue([
              {
                id: -1,
                tag: 'container',
                values: serviceName,
                filterList
              }
            ]);
          }
        });
      }
    }
  }, [pathname, teamList, appList]);

  useEffect(() => {
    return () => {
      if (timeId.current) {
        clearTimeout(timeId.current);
      }
    };
  }, []);

  const menu = (
    <Menu
      onClick={e => {
        //进行轮询操作
        e.domEvent.stopPropagation();
        setQueryText(e.key);
        queryTextCurrent.current = e.key;
        if (e.key === '0') {
          clearTimeout(timeId.current);
          timeId.current = null;
          return;
        }
        if (e.key !== queryText) {
          clearTimeout(timeId.current);
          timeId.current = null;
        }
        timeId.current = setTimeout(() => {
          queryLogList();
        }, timeObject[e.key]);
      }}
    >
      <Menu.Item key="0"> off </Menu.Item>
      <Menu.Item key="5s">5s</Menu.Item>
      <Menu.Item key="10s">10s</Menu.Item>
      <Menu.Item key="30s">30s</Menu.Item>
      <Menu.Item key="1m">1min</Menu.Item>
      <Menu.Item key="5m">5min</Menu.Item>
      <Menu.Item key="30m">30min</Menu.Item>
      {/* <Menu.Item key="1h">1h</Menu.Item>
      <Menu.Item key="2h">2h</Menu.Item>
      <Menu.Item key="1d">1d</Menu.Item> */}
    </Menu>
  );

  //下拉框选择事件集合
  const handleTagChange = ({ e, id, flag }) => {
    let keyArrayList = [];
    // const currentIndex = filterList.findIndex(item => item.key === e);
    //找出当前标签组的下标
    const filterItemIndex = filterValue.findIndex(item => item.id === id);
    let temp = [...filterValue];
    //如果当前是标签下拉选择事件，选中后将标签中对应的value塞入keyList中
    if (flag === 'tag') {
      temp[filterItemIndex].keyList = getKeyList(e);
    }
    const obj = {};
    obj[flag] = e;
    // obj.keyList = filterList[currentIndex].children;
    //如果filterValue(查询标签数组)为空 则新增一个对象并添加一个tag属性
    //如果filterValue不为空，则检查当前标签是否被选中过,如果被选中过，则找出下标进行修改，没有则新增一个
    if (temp.length === 0) {
      temp.push(obj);
      setfilterValue(temp);
    } else {
      //不为空场景
      if (typeof filterItemIndex === 'number' && temp[filterItemIndex]) {
        //复制对应的select事件的值
        temp[filterItemIndex][flag] = e;
        //如果是标签切换，需要把值置空
        if (flag === 'tag') {
          temp[filterItemIndex].values = undefined;
        }
        //如果条件位 =~ 则选择值条件框变为多选
        if (
          flag === 'condition' &&
          e === 1 &&
          Object.prototype.toString.call(temp[filterItemIndex].values) ===
            '[object Array]'
        ) {
          temp[filterItemIndex].values = temp[filterItemIndex].values[0];
        }
      } else {
        temp.push(obj);
      }
      //如果有多个标签组，完成第一个选中的标签组的onChange事件后，自动清除其他未完成的标签组
      if (flag === 'values' && e) {
        temp = temp.filter(i => i.tag && i.values);
      }
      //更新标签组数组对象
      setfilterValue(temp);
    }
  };

  const onTimeChange = ({ value }) => {
    //setTimeRange({ start, end });
    setTimeValue(value);
  };

  const handleRangeChange = ({ start, end }) => {
    setTimeRange({ start, end });
  };

  const onTeamChange = e => {
    setNamespace(e);
    let temp = [...filterValue];
    setfilterValue([
      {
        id: new Date().valueOf(),
        tag: undefined,
        values: undefined
      }
    ]);
  };

  // const fetchTagList = () => {
  //   const { start, end } = timeRange;
  //   dispatch({
  //     type: 'toolkit/fetchTagList',
  //     payload: {
  //       start,
  //       end
  //     },
  //     callback: res => {
  //       let { list } = res;
  //       list = list.map(i => {
  //         const obj = {};
  //         obj.label = i;
  //         obj.key = i;
  //         return obj;
  //       });
  //       setFilterList(list);
  //     }
  //   });
  // };

  const fetchValueList = (e, id) => {
    const { dispatch } = props;
    const { start, end } = timeRange;
    // const currentIndex = filterList.findIndex(item => item.key === e);
    const filterItemIndex = filterValue.findIndex(item => item.id === id);
    let temp = [...filterValue];
    dispatch({
      type: 'toolkit/fetchValueOfTagList',
      payload: {
        label_id: e,
        start,
        end
      },
      callback: res => {
        const { list } = res;
        let temp = [...filterValue];
        temp[filterItemIndex].keyList = list;
        setfilterValue(temp);
      }
    });
  };

  const handleQuery = () => {
    if (!nameSpace) {
      message.warning('请选择团队');
      return;
    }
    let expr = '';
    let list = null;
    let temp = [...filterValue];
    const teamIndex = teamList.findIndex(i => i.namespace === nameSpace);
    // 拼接查询语句 格式如 `{${key}${condition}\"${value}|${value}\"} |=```
    list = filterValue
      .map(i => {
        const { tag, values, condition } = i;
        if (tag && values) {
          return `${tag}${
            condition ? filterTermList[condition] : filterTermList[0]
          }\"${
            Object.prototype.toString.call(values) === '[object Array]'
              ? values.join('|')
              : values
          }\"`;
        }
        return null;
      })
      .filter(i => !!i);
    //默认会有团队查询
    list.unshift(`namespace=\"${teamList[teamIndex]?.namespace}\"`);
    //list.unshift(`namespace=\"default\"`);
    expr = '{' + list.join(',') + '}' + ' |=``';
    temp = temp.filter(i => i.tag && i.values);
    setfilterValue(temp);
    setStateExpr(expr);
    queryLogList(expr);
  };

  const queryLogList = propsExpr => {
    const { dispatch } = props;
    const { start: startTime, end: endTime } = timeRange;
    const expr = propsExpr || stateExpr;
    let start,
      end = '';
    if (timeValue !== 'custom') {
      end = moment().valueOf();
      if (timeValue === 'today') {
        start = moment()
          .startOf('day')
          .valueOf();
      } else {
        start = moment()
          .subtract(
            formatTime[timeValue].count.toString(),
            formatTime[timeValue].unit
          )
          .valueOf();
      }
    } else {
      start = startTime;
      end = endTime;
    }
    setLoading(true);
    dispatch({
      type: 'toolkit/fetchLogList',
      payload: {
        start,
        end,
        expr
      },
      callback: res => {
        const { list } = res;
        setNewLogList(list);
        setLoading(false);
        if (queryTextCurrent?.current !== '0') {
          if (timeId.current) {
            clearTimeout(timeId.current);
            timeId.current = null;
          }
          timeId.current = setTimeout(() => {
            queryLogRef.current();
          }, timeObject[(queryTextCurrent?.current)]);
        }
      }
    });
  };

  queryLogRef.current = queryLogList;

  const handleQueryTagList = ({ e, id, teamName, callback }) => {
    const { dispatch } = props;
    const { start, end } = timeRange;
    setCurrentId(id);
    //通过id筛选出当前操作项的下标
    const filterItemIndex = filterValue.findIndex(item => item.id === id);
    //如果当前的标签已被选中了，则不进行标签查询
    if (filterValue[filterItemIndex]?.tag && id !== -1) {
      return;
    }
    let list = [];
    //拼接查询条件
    list = filterValue
      .map(i => {
        const { tag, values, condition } = i;
        if (tag && values) {
          return `${tag}${
            condition ? filterTermList[condition] : filterTermList[0]
          }\"${
            Object.prototype.toString.call(values) === '[object Array]'
              ? values.join('|')
              : values
          }\"`;
        }
        return null;
      })
      .filter(i => !!i);
    list.unshift(`namespace="${nameSpace || teamName}"`);
    //如果id为-1 则默认需要重写match条件，主要是因为setFilterValue是异步，此处是为了省力，直接手动置为默认条件，不在useEffect里监听
    if (id === -1) {
      list = [`namespace="${nameSpace || teamName}"`];
    }
    const match = '{' + list.join(',') + '}';
    setSelectLoading(true);
    dispatch({
      type: 'toolkit/fetchTagAndValueList',
      payload: {
        start,
        end,
        match
      },
      callback: res => {
        const { list } = res;
        let tempArray = [];
        let temp = [...filterValue];
        if (list)
          list.forEach(
            item => (tempArray = [...tempArray, ...Object.keys(item)])
          );
        setOriginFilterList(list);
        //过滤这些不需要的标签
        if (tempArray.length > 0) {
          tempArray = tempArray.filter(
            i => !['cluster', 'namespace', 'job', 'stream', 'ts'].includes(i)
          );
        }
        if (temp[filterItemIndex])
          temp[filterItemIndex].filterList = Array.from(new Set(tempArray));
        //到了指定的组件页面，且没有查询条件，则新增一个
        setSelectLoading(false);
        //如果是默认标签组，则调用callback
        if (id === -1) {
          callback && callback(Array.from(new Set(tempArray)));
          return;
          // temp[filterItemIndex].keyList = getKeyList(temp[filterItemIndex].tag);
        }
        setfilterValue(temp);
      }
    });
  };

  //根据标签value来获取对应值的数组
  const getKeyList = flag => {
    let keyArrayList = [];
    originFilterList.forEach(item => {
      if (item[flag]) {
        keyArrayList.push(item[flag]);
      }
    });
    return Array.from(new Set(keyArrayList));
  };

  const renderButton = () => (
    <ButtonGroup>
      <Button
        type="primary"
        onClick={handleQuery}
        loading={loading}
        icon="sync"
      >
        <span>查询</span>
      </Button>
      <Tooltip title="定时轮询间隔">
        <Dropdown overlay={menu}>
          <Button type="primary">
            <span style={{ zIndex: '2' }}>
              <span>{queryText === '0' ? 'off' : queryText}</span>
              <Icon type="down" />
            </span>
          </Button>
        </Dropdown>
      </Tooltip>
    </ButtonGroup>
  );

  return (
    <div className={styles.container}>
      <Drawer
        title="日志查询"
        visible={visible}
        onClose={onClose}
        width="97%"
        zIndex={1001}
      >
        <div className={styles.wrap}>
          <TeamCondition
            teamOptionList={teamList}
            timeOptionList={timeOptionList}
            onTimeChange={onTimeChange}
            onRangeChange={handleRangeChange}
            onTeamChange={onTeamChange}
            nameSpace={nameSpace}
            customRight={() => {
              return (
                <div
                  style={{ color: 'blue' }}
                  onClick={() => setIsExpand(!isExpand)}
                >
                  {isExpand ? '收起' : '展开'}查询
                  <Icon type={isExpand ? 'caret-down' : 'caret-up'} />
                </div>
              );
            }}
            customQuery={() => {
              if (!isExpand) {
                return renderButton();
              }
              return null;
            }}
          />
          <div
            className={classNames(styles.middle, {
              [styles.hide]: !isExpand
            })}
          >
            <div className={styles.title}>标签</div>
            <div className={styles.block}>
              {filterValue.map((item, index) => {
                const { filterList = [], tag } = item;
                return (
                  <div className={styles.group} key={item.id}>
                    <Select
                      showSearch
                      style={{ minWidth: 134, marginRight: 8 }}
                      placeholder="标签名称"
                      onChange={e =>
                        handleTagChange({ e, id: item.id, flag: 'tag' })
                      }
                      dropdownMatchSelectWidth={false}
                      onFocus={e => handleQueryTagList({ e, id: item.id })}
                      loading={currentId == item.id ? selectLoading : false}
                      dropdownRender={(menu, props) => (
                        <Spin spinning={selectLoading}>{menu}</Spin>
                      )}
                      value={tag}
                      allowClear
                    >
                      {filterList.map((item, index) => (
                        <Option key={item} value={item}>
                          {tagName[item] ? tagName[item] : item}
                        </Option>
                      ))}
                    </Select>
                    <Select
                      style={{ minWidth: 92, marginRight: 8 }}
                      placeholder="查询条件"
                      defaultValue={item?.condition || 0}
                      onChange={e =>
                        handleTagChange({ e, flag: 'condition', id: item.id })
                      }
                      dropdownMatchSelectWidth={false}
                      allowClear
                    >
                      {filterTermList.map((item, index) => (
                        <Option key={index} value={index}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                    <Select
                      showSearch
                      style={{ minWidth: 312, marginRight: 8 }}
                      placeholder="查询值"
                      mode={item.condition === 1 ? 'multiple' : ''}
                      value={item.values}
                      onChange={e =>
                        handleTagChange({ e, flag: 'values', id: item.id })
                      }
                      dropdownMatchSelectWidth={false}
                      allowClear
                    >
                      {item?.keyList?.map((item, index) => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>

                    <div style={{ lineHeight: '30px', cursor: 'pointer' }}>
                      <img
                        src={deleteImg}
                        onClick={() => {
                          let temp = [...filterValue];
                          temp = temp.filter(i => item.id !== i.id);
                          setfilterValue(temp);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {
                <div className={styles.group}>
                  <Tooltip title="添加标签组">
                    <div
                      className={styles.wrap}
                      onClick={() => {
                        if (!nameSpace) {
                          message.warning('请选择团队');
                          return;
                        }
                        let tempArray = [...filterValue];
                        tempArray.push({ id: new Date().valueOf() });
                        setfilterValue(tempArray);
                      }}
                    >
                      <img src={addImg} />
                    </div>
                  </Tooltip>
                </div>
              }
            </div>
            <div className={styles.query}>{renderButton()}</div>
          </div>
          <RenderList
            newLogList={newLogList}
            openTraceDetail={openTraceDetail}
            loading={loading}
            setHeightList={setHeightList}
            heightList={heightList}
            timeRange={timeRange}
            callLinkQuery={call_link_query}
            isExpand={isExpand}
          />
        </div>
      </Drawer>
    </div>
  );
};

export default memo(LogDrawer, (prevProps, nextProps) => {
  if (prevProps.visible !== nextProps.visible) {
    return false;
  }
  return true;
});
