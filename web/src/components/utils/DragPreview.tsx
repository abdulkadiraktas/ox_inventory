import React, { RefObject, useMemo, useRef } from 'react';
import { DragLayerMonitor, useDragLayer, XYCoord } from 'react-dnd';
import { DragSource, SlotWithItem } from '../../typings';
import { getItemUrl } from '../../helpers';

interface DragLayerProps {
  data: DragSource;
  currentOffset: XYCoord | null;
  isDragging: boolean;
}

const subtract = (a: XYCoord, b: XYCoord): XYCoord => {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
};

const calculateParentOffset = (monitor: DragLayerMonitor): XYCoord => {
  const client = monitor.getInitialClientOffset();
  const source = monitor.getInitialSourceClientOffset();
  if (client === null || source === null || client.x === undefined || client.y === undefined) {
    return { x: 0, y: 0 };
  }
  return subtract(client, source);
};

export const calculatePointerPosition = (monitor: DragLayerMonitor, childRef: RefObject<Element>): XYCoord | null => {
  const offset = monitor.getClientOffset();
  if (offset === null) {
    return null;
  }

  if (!childRef.current || !childRef.current.getBoundingClientRect) {
    return subtract(offset, calculateParentOffset(monitor));
  }

  const bb = childRef.current.getBoundingClientRect();
  const middle = { x: bb.width / 2, y: bb.height / 2 };
  return subtract(offset, middle);
};

const DragPreview: React.FC = () => {
  const element = useRef<HTMLDivElement>(null);

  const { data, isDragging, currentOffset } = useDragLayer<DragLayerProps>((monitor) => ({
    data: monitor.getItem(),
    currentOffset: calculatePointerPosition(monitor, element),
    isDragging: monitor.isDragging(),
  }));

  const image = useMemo(() => {
    if (!data || !data.item) return 'none';
    return getItemUrl(data.item as SlotWithItem);
  }, [data]);

  return (
    <>
      {isDragging && currentOffset && data.item && (
        <div
          className="item-drag-preview"
          ref={element}
          style={{
            transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
            backgroundImage: image,
          }}
        />
      )}
    </>
  );
};

export default DragPreview;
