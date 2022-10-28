/**
 * @content  调用链路详情
 * @author   Leon
 * @date     2022/10/08
 *
 */
import React, { useEffect, useState, useRef } from 'react';
import { Table, Button } from 'antd';
import { columns, data1, loopData, flatten } from './conf';
import { connect } from 'dva';

const TraceDetail = props => {
  const {
    onActivityKeyChange,
    onServiceClick,
    traceInfo,
    dispatch,
    isGoBack,
    getInfoLoading
  } = props;
  const { start, end, traceId } = traceInfo || {};
  const [dataSource, setDataSource] = useState([]);
  const [keyList, setKeyList] = useState([]);

  useEffect(() => {
    console.log(traceId, 'ddd');
    fetchTraceDetail();
  }, [traceId]);

  const fetchTraceDetail = () => {
    dispatch({
      type: 'toolkit/fetchTraceDetailList',
      payload: {
        start,
        end,
        id: traceId
      },
      callback: res => {
        const { bean } = res;
        setDataSource(bean ? loopData([bean], bean?.createdTime) : []);
        if (bean) {
          const res = flatten([bean])?.map(i => i.key);
          setKeyList(res);
          //console.log(flatten([bean])?.map(i => i.key));
        }
      }
    });
  };

  // const handleExpand = (expand, record) => {
  //   const { key } = record;
  //   setKeyList([key]);
  // };

  const handleExpandRow = expandRows => {
    setKeyList(expandRows);
  };

  return (
    <>
      <div
        style={{
          marginBottom: 16
        }}
      >
        {isGoBack && <Button onClick={onActivityKeyChange}>返回上级</Button>}
      </div>
      {
        <Table
          loading={getInfoLoading}
          columns={columns(onActivityKeyChange, onServiceClick)}
          dataSource={dataSource}
          expandedRowKeys={keyList}
          //onExpand={handleExpand}
          onExpandedRowsChange={handleExpandRow}
          rowKey="key"
        />
      }
    </>
  );
};

export default connect(({ loading }) => ({
  getInfoLoading: loading.effects['toolkit/fetchTraceDetailList']
}))(TraceDetail);
