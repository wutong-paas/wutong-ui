/**
 * @content 日志虚拟列表组件
 * @author  Leon
 * @date    2022/10/12
 *
 */
import React, { memo, useState, useRef, useEffect } from 'react';
import { Spin, Empty, Tooltip, message } from 'antd';
import VariableSizeList from './VList';
// import {
//   CellMeasurer,
//   CellMeasurerCache,
//   List,
//   AutoSizer
// } from 'react-virtualized';
// import ReactHeight from 'react-height';
import { logLevelColor, getTraceId, getLogLevel } from '../conf';
import styles from '../index.less';
import traceIdImg from '../../../../../../public/images/bulle/traceId.svg';

// 基于react-virtualized的虚拟列表，动态高度滚动有渲染延迟问题 已废弃
// class RenderList extends React.PureComponent {
//   state = {
//     heightList: [],
//     cache: new CellMeasurerCache({
//       defaultHeight: 28,
//       fixedWidth: true
//     })
//   };

//   handleHeightReady = (height, index) => {
//     setTimeout(() => {
//       const heights = [...this.state.heightList];
//       heights.push({
//         index,
//         height: height > 28 ? height + 4 : 28
//       });
//       this.setState(
//         {
//           heightList: heights
//         },
//         () => {
//           this.listRef.recomputeRowHeights(index);
//         }
//       );
//     }, 0);
//   };

//   render() {
//     const { newLogList, openTraceDetail, loading } = this.props;
//     const { heightList, cache } = this.state;
//     const rowRenderer = ({
//       key, // Unique key within array of rows
//       index, // 索引号
//       parent,
//       style // 注意：重点属性，一定要给每一行数据添加该样式
//     }) => {
//       //如果存在 就不需要进行高度获取了
//       if (heightList.find(item => item.index === index)) {
//         return (
//           <div key={key} style={{ ...style }}>
//             <div className={styles.item}>
//               <div className={styles.item}>
//                 <div
//                   style={{
//                     borderLeft: `2px solid ${
//                       logLevelColor[newLogList[index].level]
//                     }`
//                   }}
//                   className={styles.info}
//                 >
//                   <div className={styles['line-number']}>{index}</div>
//                   {newLogList[index].text}
//                 </div>
//                 <div className={styles.wrap}>
//                   <div className={styles.trace} onClick={openTraceDetail}>
//                     {newLogList[index].traceId && (
//                       <Tooltip title="查看调用链路">
//                         <img src={traceIdImg} />
//                       </Tooltip>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       }
//       return (
//         <div key={key} style={{ ...style }}>
//           <ReactHeight
//             onHeightReady={height => {
//               this.handleHeightReady(height, index);
//             }}
//           >
//             <div className={styles.item}>
//               <div
//                 style={{
//                   borderLeft: `2px solid ${
//                     logLevelColor[newLogList[index].level]
//                   }`
//                 }}
//                 className={styles.info}
//               >
//                 <div className={styles['line-number']}>{index}</div>
//                 {newLogList[index].text}
//               </div>
//               <div className={styles.wrap}>
//                 <div className={styles.trace} onClick={openTraceDetail}>
//                   {newLogList[index].traceId && (
//                     <Tooltip title="查看调用链路">
//                       <img src={traceIdImg} />
//                     </Tooltip>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </ReactHeight>
//         </div>
//       );
//     };

//     return (
//       <Spin spinning={loading}>
//         <div className={styles.content} id="content_wrap">
//           {newLogList.length > 0 && (
//             <div
//               className={styles.total}
//             >{`共查询到${newLogList.length}条`}</div>
//           )}

//           {newLogList.length > 0 ? (
//             //(
//             //   newLogList.map((item, index) => {
//             //     return (
//             //       <div key={index} className={styles.item}>
//             //         <div
//             //           style={{
//             //             borderLeft: `2px solid ${logLevelColor[item.level]}`
//             //           }}
//             //           className={styles.info}
//             //           // dangerouslySetInnerHTML={{
//             //           //   __html: `${index} ${item.text}`
//             //           // }}
//             //         >
//             //           {index} {item.text}
//             //         </div>
//             //         {item.traceId && (
//             //           <Tooltip title="查看调用链路">
//             //             <div className={styles.trace} onClick={openTraceDetail}>
//             //               <img src={traceIdImg} />
//             //             </div>
//             //           </Tooltip>
//             //         )}
//             //       </div>
//             //     );
//             //   })
//             // )
//             <AutoSizer>
//               {({ width, height }) => (
//                 <List
//                   ref={ref => (this.listRef = ref)}
//                   width={width}
//                   height={height}
//                   rowCount={newLogList.length}
//                   rowRenderer={rowRenderer}
//                   // overscanRowCount={100}
//                   rowHeight={({ index }) => {
//                     const row = this.state.heightList.find(
//                       item => item.index === index
//                     );
//                     console.log(row, cache.rowHeight(index), 'ddd');
//                     return row ? row.height : 28;
//                   }}
//                 />
//               )}
//             </AutoSizer>
//           ) : (
//             <Empty />
//           )}
//         </div>
//       </Spin>
//     );
//   }
// }

const RenderList = memo(props => {
  const {
    newLogList,
    openTraceDetail,
    loading,
    timeRange: { start, end },
    wutongInfo,
    callLinkQuery: { enable },
    isExpand
  } = props;
  const [heightList, setHeightList] = useState([]);
  const [index, setIndex] = useState(0);
  const listRef = useRef();

  const heightsRef = useRef(new Array(30));
  // 预估高度
  const estimatedItemHeight = 40;
  const getHeight = index => {
    return heightsRef.current[index] ?? estimatedItemHeight;
  };

  const setHeight = (index, height) => {
    if (heightsRef.current[index] !== height) {
      heightsRef.current[index] = height;
      // 让 VariableSizeList 组件更新高度
      listRef.current.resetHeight();
    }
  };

  //数据源改变 重新设置高度
  useEffect(() => {
    listRef?.current?.resetHeight();
  }, [newLogList]);

  const Item = memo(({ index, data, setHeight }) => {
    const itemRef = useRef();
    const lastFunc = useRef();

    // useEffect(() => {
    //   window.addEventListener(
    //     'resize',
    //     debounce(() => lastFunc.current(index, itemRef), 100)
    //   );
    //   return () => {
    //     window.removeEventListener('resize', () =>
    //       lastFunc.current(index, itemRef)
    //     );
    //   };
    // }, []);

    useEffect(() => {
      handleSetHeight(index, itemRef);
      // setHeight(index, itemRef.current.getBoundingClientRect().height + 4);
    }, [setHeight, index]);

    const handleSetHeight = (index, itemRef) => {
      setHeight(index, itemRef?.current?.getBoundingClientRect().height + 10);
    };

    // lastFunc.current = handleSetHeight;

    return (
      <div key={index} ref={itemRef} className={styles.item}>
        <div
          style={{
            borderLeft: `2px solid ${
              logLevelColor[
                (newLogList[index].level &&
                  newLogList[index].level.toLowerCase()) ||
                  getLogLevel(newLogList[index].line)
              ]
            }`
          }}
          className={styles.info}
        >
          <div className={styles['line-number']}>{index + 1}</div>
          <div className={styles.text}>{newLogList[index].line}</div>
        </div>
        <div className={styles.wrap}>
          <div
            className={styles.trace}
            onClick={() => {
              if (!enable) {
                message.warn('请先开启调用链路查询');
                return;
              }
              openTraceDetail({
                traceId: getTraceId(newLogList[index].line, 'traceId'),
                start,
                end
              });
            }}
          >
            {newLogList[index].traceId ||
              (getTraceId(newLogList[index].line, 'traceId') && (
                <Tooltip title="查看调用链路">
                  <img src={traceIdImg} />
                </Tooltip>
              ))}
          </div>
        </div>
      </div>
    );
  });

  return (
    <Spin spinning={loading}>
      {newLogList.length > 0 && (
        <div className={styles.total}>{`共查询到${newLogList.length}条`}</div>
      )}
      <div className={styles.content} id="content_wrap">
        {newLogList.length > 0 ? (
          //(
          //   newLogList.map((item, index) => {
          //     return (
          //       <div key={index} className={styles.item}>
          //         <div
          //           style={{
          //             borderLeft: `2px solid ${logLevelColor[item.level]}`
          //           }}
          //           className={styles.info}
          //           // dangerouslySetInnerHTML={{
          //           //   __html: `${index} ${item.text}`
          //           // }}
          //         >
          //           {index} {item.text}
          //         </div>
          //         {item.traceId && (
          //           <Tooltip title="查看调用链路">
          //             <div className={styles.trace} onClick={openTraceDetail}>
          //               <img src={traceIdImg} />
          //             </div>
          //           </Tooltip>
          //         )}
          //       </div>
          //     );
          //   })
          // )
          <VariableSizeList
            ref={listRef}
            containerHeight={isExpand ? 610 : 770}
            itemCount={newLogList.length}
            getItemHeight={getHeight}
            itemData={newLogList}
          >
            {({ index, style, data }) => {
              return (
                <div style={style}>
                  <Item {...{ index, data }} setHeight={setHeight} />
                </div>
              );
            }}
          </VariableSizeList>
        ) : (
          <Empty style={{ marginTop: 100 }} description="暂无日志" />
        )}
      </div>
    </Spin>
  );
});

export default RenderList;
