/**
 * @content  调用链路抽屉
 * @author   Leon
 * @date     2022/09/28
 *
 */
import React, { useState, memo, forwardRef, useImperativeHandle } from 'react';
import { Drawer } from 'antd';
import Trace from './com/Trace';
import TraceDetail from './com/TraceDetail';
import MethodStack from './com/MethodStack';
import styles from './index.less';

const titleList = ['调用链路查询', '调用链路详情', '方法栈详情'];

const TraceDrawer = forwardRef((props, ref) => {
  const { visible, onClose, teamList } = props;
  const [activityKey, setActivityKey] = useState(0);
  const [traceDetail, setTraceDetail] = useState(null);
  const [traceInfo, setTraceInfo] = useState({});
  const [isGoBack, setIsGoBack] = useState(true);

  const handleActiviKeyChange = flag => {
    if (flag === 'add') {
      setActivityKey(activityKey + 1);
      return;
    }
    setActivityKey(activityKey - 1);
  };

  useImperativeHandle(ref, () => ({
    setActivityKey,
    setTraceInfo,
    setIsGoBack
  }));

  return (
    <div>
      <Drawer
        visible={visible}
        title={titleList[activityKey]}
        onClose={onClose}
        width="97%"
        zIndex={1002}
      >
        <div className={activityKey !== 0 ? styles.show : ''}>
          <Trace
            onActivityKeyChange={handleActiviKeyChange}
            teamList={teamList}
            onTraceIdClick={setTraceInfo}
            {...props}
          />
        </div>
        <div>
          {activityKey === 1 && (
            <TraceDetail
              onActivityKeyChange={handleActiviKeyChange}
              onServiceClick={setTraceDetail}
              traceInfo={traceInfo}
              isGoBack={isGoBack}
              {...props}
            />
          )}
        </div>
        <div>
          {activityKey === 2 && (
            <MethodStack
              onActivityKeyChange={handleActiviKeyChange}
              traceDetail={traceDetail}
              {...props}
            />
          )}
        </div>
      </Drawer>
    </div>
  );
});

export default React.memo(TraceDrawer, (prevProps, nextProps) => {
  if (prevProps.visible !== nextProps.visible) {
    return false;
  }
  return true;
});
