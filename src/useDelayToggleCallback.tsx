import useTimeout from '@restart/hooks/useTimeout';
import useUpdatedRef from '@restart/hooks/useUpdatedRef';
import { useCallback, useRef } from 'react';

export type Delay = [number, number];

type ValueRef = {
  entered?: boolean;
  pending?: boolean;
  hideCallbacks: Array<() => void>;
};

let entered: boolean;
let showHandle: NodeJS.Timeout;
let leaveHandle: NodeJS.Timeout;
const hideCallbacks = [] as Array<(nextValue: boolean) => void>;

function drainHideCallbacks() {
  hideCallbacks.forEach((h) => h(false));
  hideCallbacks.length = 0;
}

function useGlobalTimeout(
  delay: Delay,
  callback: (nextValue: boolean) => void,
) {
  const [showDelay, leaveDelay] = delay;
  return useCallback(
    (nextValue: boolean) => {
      clearTimeout(showHandle);

      if (nextValue === true) {
        if (entered) {
          clearTimeout(leaveHandle);
          drainHideCallbacks();
          callback(true);
          return;
        }

        showHandle = setTimeout(() => {
          entered = true;
          clearTimeout(leaveHandle);
          drainHideCallbacks();
          callback(true);
        }, showDelay);
      } else {
        hideCallbacks.push(callback);
        clearTimeout(leaveHandle);
        leaveHandle = setTimeout(() => {
          entered = false;
          drainHideCallbacks();
        }, leaveDelay);
      }
    },
    [showDelay, leaveDelay, callback],
  );
}

export default function useDelayToggleCallback(
  delay: Delay | null,
  callback: (nextValue: boolean) => void,
  global = false,
) {
  const timeout = useTimeout();

  const delayRef = useUpdatedRef(delay);
  const pendingValue = useRef<boolean | null>(null);

  const globalDebounced = useGlobalTimeout(delay || [0, 0], callback);

  const debounced = useCallback(
    (nextValue: boolean) => {
      timeout.clear();
      pendingValue.current = nextValue;
      timeout.set(() => {
        if (pendingValue.current === nextValue) {
          pendingValue.current = null;
          callback(nextValue);
        }
      }, delayRef.current![nextValue ? 0 : 1]);
    },
    [delayRef, timeout, callback],
  );

  if (delay == null) {
    return callback;
  }

  return global ? globalDebounced : debounced;
}
