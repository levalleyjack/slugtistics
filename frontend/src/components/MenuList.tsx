import React, { Children, useCallback, useRef, useState } from 'react';
import { MenuListComponentProps } from 'react-select';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

export const MenuList = (props: MenuListComponentProps<any>) => {
  const { children, maxHeight } = props;

  const ref = useRef<VirtuosoHandle>(null);
  const listRef = useRef<HTMLElement | null>(null);

  const [currentItemIndex, setCurrentItemIndex] = useState(-1);

  const keyDownCallback = useCallback(
    (event: KeyboardEvent) => {
      let nextIndex: number | null = null;

      if (event.code === 'ArrowUp') {
        nextIndex = Math.max(0, currentItemIndex - 1);
      } else if (event.code === 'ArrowDown') {
        nextIndex = Math.min(99, currentItemIndex + 1);
      }

      if (!!nextIndex && !!ref.current) {
        ref.current.scrollIntoView({
          index: nextIndex,
          behavior: 'auto',
          done: () => nextIndex && setCurrentItemIndex(nextIndex),
        });
        event.preventDefault();
      }
    },
    [currentItemIndex, ref, setCurrentItemIndex]
  );

  const scrollerRef = useCallback(
    (element: HTMLElement | Window | null) => {
      if (element) {
        element.addEventListener('keydown', keyDownCallback);
        listRef.current = element as HTMLElement;
      } else {
        if (!listRef.current) return;
        listRef.current.removeEventListener('keydown', keyDownCallback);
      }
    },
    [keyDownCallback]
  );

  return Array.isArray(children) ? (
    <Virtuoso
      ref={ref}
      scrollerRef={scrollerRef}
      totalCount={Children.count(children)}
      itemContent={(index) => children[index]}
      style={{
        height: maxHeight,
      }}
    />
  ) : null;
};
