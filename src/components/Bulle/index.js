/**
 * @content  全局工具箱气泡
 * @author   Leon
 * @date     2022/09/27
 *
 */
import { Drawer, Input, Icon } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'dva';
import LogDrawer from './com/LogDrawer';
import TraceDrawer from './com/TraceDrawer';
import toolKitImg from '../../../public/images/bulle/toolkit.svg';
import logImg from '../../../public/images/bulle/log.svg';
import traceImg from '../../../public/images/bulle/trace.svg';
import styles from './index.less';
import user from '@/models/user';

const Index = props => {
  const { wutongInfo = {}, appList, teamInfo } = props;
  const { log_query, call_link_query } = wutongInfo;
  const [iX, setiX] = useState(0);
  const [iY, setiY] = useState(0);
  const [dX, setdX] = useState(0);
  const [dY, setdY] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [popoverIsShow, setPopoverIsShow] = useState(false);
  const [isLeft, setIsLeft] = useState(false);
  const [logDrawerVisible, setLogDrawerVisible] = useState(false);
  const [traceDrawerVisible, setTraceDrawerVisble] = useState(false);
  //const [teamList, setTeamList] = useState([]);

  const bulleRef = useRef();
  const maskRef = useRef();
  const popoverRef = useRef();
  const traceRef = useRef();

  useEffect(() => {
    const body = document.body;
    body.addEventListener('mousemove', handleMouseMove);
    body.addEventListener('mouseup', handleMouseUp);
    return () => {
      body.removeEventListener('mousemove', handleMouseMove);
      body.removeEventListener('mouseup', handleMouseUp);
    };
  }, [moveCount, isMouseDown]);

  useEffect(() => {
    if (bulleRef.current) {
      const { style: bullRefstyle } = bulleRef.current;
      bullRefstyle.right = 0;
    }
    // fetchTeams();
  }, []);

  const handleMouseDown = e => {
    //console.log('mouse down');
    // 鼠标点击 面向页面 的 x坐标 y坐标
    let { clientX, clientY } = e;
    // 鼠标x坐标 - 拖拽按钮x坐标  得到鼠标 距离 拖拽按钮 的间距
    setiX(clientX - bulleRef.current.offsetLeft);
    // 鼠标y坐标 - 拖拽按钮y坐标  得到鼠标 距离 拖拽按钮 的间距
    setiY(clientY - bulleRef.current.offsetTop);
    setIsMouseDown(true);
  };

  const handleMouseMove = e => {
    if (!isMouseDown) {
      return;
    }
    setMoveCount(moveCount + 1);
    // console.log('mouse move');
    let { clientX, clientY } = e;
    //当前页面全局容器 dom 元素  获取容器 宽高
    let { clientHeight: pageDivY, clientWidth: pageDivX } = document.body;
    /* 鼠标坐标 - 鼠标与拖拽按钮的 间距坐标  得到 拖拽按钮的 左上角 x轴y轴坐标 */
    let [x, y] = [clientX - iX, clientY - iY];

    //拖拽按钮 dom 元素  获取 宽高 style 对象
    let {
      clientHeight: actionMgrY,
      clientWidth: actionMgrX,
      style: actionMgrStyle
    } = bulleRef.current;
    /* 此处判断 拖拽按钮 如果超出 屏幕宽高 或者 小于
     * 设置 屏幕最大 x=全局容器x y=全局容器y 否则 设置 为 x=0 y=0
     */
    if (x > pageDivX - actionMgrX) x = pageDivX - actionMgrX;
    else if (x < 0) x = 0;
    if (y > pageDivY - actionMgrY) y = pageDivY - actionMgrY;
    else if (y < 0) y = 0;
    setdX(x);
    setdY(y);
    // 计算后坐标  设置 按钮位置
    actionMgrStyle.left = `${x}px`;
    actionMgrStyle.top = `${y}px`;
    actionMgrStyle.bottom = 'auto';
    actionMgrStyle.right = 'auto';
    //setMoveCount(moveCount + 1);
    e.preventDefault();
    e.stopPropagation();
    //  move Index
  };

  const handleMouseUp = e => {
    if (!isMouseDown) {
      return;
    }
    let {
      clientHeight: windowHeight,
      clientWidth: windowWidth
    } = document.documentElement;
    // console.log('全局容器:', windowWidth, windowHeight);
    //  拖拽按钮 dom 元素  获取 宽高 style 对象
    let {
      clientHeight: actionMgrY,
      clientWidth: actionMgrX,
      style: actionMgrStyle
    } = bulleRef.current;
    //console.log('拖拽按钮', actionMgrY, actionMgrX, actionMgrStyle);

    // 计算后坐标  设置 按钮位置
    if (dY > 0 && dY < windowHeight - 50) {
      //  不在顶 且 不在底部
      if (dX <= windowWidth / 2) {
        //  left 小于等于屏幕一半
        actionMgrStyle.left = 0;
        actionMgrStyle.borderRadius = '0 60px 60px 0';
        actionMgrStyle.right = 'auto';
        setIsLeft(true);
        if (popoverIsShow) {
          popoverRef.current.style.right = 'auto';
          popoverRef.current.style.left = '424px';
          popoverRef.current.style.float = 'right';
        }
      } else {
        //  left 大于屏幕一半
        actionMgrStyle.left = 'auto';
        actionMgrStyle.borderRadius = '60px 0 0 60px';
        actionMgrStyle.right = 0;
        setIsLeft(false);
        if (popoverIsShow) {
          popoverRef.current.style.right = '424px';
          popoverRef.current.style.left = 'auto';
          popoverRef.current.style.float = 'none';
        }
      }
      // if (dY >= windowHeight / 2) {
      //   //  宽度大于1/2时，是将top改为auto，调整bottom
      //   actionMgrStyle.top = "auto";
      //   actionMgrStyle.bottom = windowHeight - dY - 50 + "px";
      // }
    } else {
      // if (dY === 0) {
      //   //  在顶部
      //   actionMgrStyle.top = 0;
      //   actionMgrStyle.bottom = "auto";
      // } else if (dY === windowHeight - 50) {
      //   actionMgrStyle.bottom = 0;
      //   actionMgrStyle.top = "auto";
      // }
      if (dX >= windowWidth / 2) {
        //  右侧是将left改为auto，调整right
        actionMgrStyle.left = 'auto';
        actionMgrStyle.right = windowWidth - dX - 50 + 'px';
      }
    }
    setIsMouseDown(false);
  };

  const handleClick = e => {
    if (moveCount - currentCount <= 10) {
      setPopoverIsShow(true);
    }
    setCurrentCount(moveCount);
    setIsMouseDown(false);
  };

  const openTraceDetail = detail => {
    traceRef.current.setActivityKey(1);
    traceRef.current.setTraceInfo(detail);
    traceRef.current.setIsGoBack(false);
    setTraceDrawerVisble(true);
  };

  // const fetchTeams = () => {
  //   const {
  //     dispatch,
  //     currUser: { enterprise_id }
  //   } = props;
  //   dispatch({
  //     type: 'global/fetchMyTeams',
  //     payload: {
  //       enterprise_id,
  //       page: 0,
  //       page_size: 999
  //     },
  //     callback: res => {
  //       const { list } = res;
  //       setTeamList(list);
  //     }
  //   });
  // };

  return (
    <div
      ref={maskRef}
      className={styles.mask}
      // onMouseMove={handleMouseMove}
      // onMouseUp={handleMouseUp}
    >
      <div
        id="bulle"
        ref={bulleRef}
        className={styles.wrap}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        //draggable
      >
        <img src={toolKitImg} />
        {popoverIsShow && (
          <div
            ref={popoverRef}
            className={`${styles.card} ${isLeft ? styles.left : styles.right}`}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.header}>
              <div className={styles.left}>
                <span className={styles.title}>工具箱</span>
                <span className={styles.desc}>提供分析与控制工具</span>
              </div>
              <div className={styles.right}>
                <Icon type="close" onClick={() => setPopoverIsShow(false)} />
              </div>
            </div>
            <div className={styles.list}>
              <div className={styles.title}>分析工具</div>
              {log_query?.enable && (
                <div
                  className={styles.item}
                  onClick={() => setLogDrawerVisible(true)}
                >
                  <div>
                    <img src={logImg} />
                  </div>
                  <div>
                    <div>日志查询</div>
                    <div>对采集到的日志进行筛选查询与实时分析</div>
                  </div>
                </div>
              )}
              {call_link_query?.enable && (
                <div
                  className={styles.item}
                  onClick={() => setTraceDrawerVisble(true)}
                >
                  <div>
                    <img src={traceImg} />
                  </div>
                  <div>
                    <div>调用链路查询</div>
                    <div>查询调用链路详细情况</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <LogDrawer
        visible={logDrawerVisible}
        onClose={() => setLogDrawerVisible(false)}
        openTraceDetail={openTraceDetail}
        teamList={teamInfo || []}
        {...props}
      />
      <TraceDrawer
        visible={traceDrawerVisible}
        onClose={() => {
          setTraceDrawerVisble(false);
          traceRef.current.setIsGoBack(true);
        }}
        ref={traceRef}
        teamList={teamInfo || []}
        {...props}
      />
    </div>
  );
};
const Bulle = connect(({ user, application, global }) => ({
  currUser: user.currentUser,
  appList: application.apps,
  teamInfo: global.teamInfo
}))(Index);

export default Bulle;
