import { forwardRef, useState } from 'react';
import { flushSync } from 'react-dom';
import useMedia from 'react-media-hook2';

// 动态列表组件
const VariableSizeList = forwardRef(
  ({ containerHeight, getItemHeight, itemCount, itemData, children }, ref) => {
    // children 语义不好，赋值给 Component
    const Component = children;
    const [scrollTop, setScrollTop] = useState(0); // 滚动高度

    ref.current = {
      resetHeight: () => {
        setOffsets(genOffsets());
      }
    };

    const genOffsets = () => {
      const a = [];
      a[0] = getItemHeight(0);
      for (let i = 1; i < itemCount; i++) {
        a[i] = getItemHeight(i) + a[i - 1];
      }
      return a;
    };

    // 所有 items 的位置
    const [offsets, setOffsets] = useState(() => {
      return genOffsets();
    });

    // 找 startIdx 和 endIdx
    // 这里用了普通的查找，更好的方式是二分查找
    let startIdx = offsets.findIndex(pos => pos > scrollTop);
    let endIdx = offsets.findIndex(pos => pos > scrollTop + containerHeight);
    if (endIdx === -1) endIdx = itemCount;

    // 上下扩展补充几个 item
    const paddingCount = 2;
    startIdx = Math.max(startIdx - paddingCount, 0); // 处理越界情况
    endIdx = Math.min(endIdx + paddingCount, itemCount - 1);

    // 计算高度
    const contentHeight = offsets[offsets.length - 1];

    // 需要渲染的 items
    const items = [];
    for (let i = startIdx; i <= endIdx; i++) {
      const top = i === 0 ? 0 : offsets[i - 1];
      const height = i === 0 ? offsets[0] : offsets[i] - offsets[i - 1];
      items.push(
        <Component
          key={i}
          index={i}
          style={{
            position: 'absolute',
            left: 0,
            top,
            width: '100%',
            height
          }}
          data={itemData}
        />
      );
    }

    //console.log(items,'items');

    return (
      <div
        style={{
          height: containerHeight,
          overflowY: 'auto',
          position: 'relative'
        }}
        onScroll={e => {
          flushSync(() => {
            setScrollTop(e.target.scrollTop);
          });
        }}
      >
        <div style={{ height: contentHeight ? contentHeight : 0 }}>{items}</div>
      </div>
    );
  }
);

export default VariableSizeList;
