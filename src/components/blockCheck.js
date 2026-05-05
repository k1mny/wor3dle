import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { checkClear } from './logic';
import { useBoxApiState, useClearState } from './states';

const BlockCheck = () => {
  const ref = useRef([]);
  const boxApi = useAtomValue(useBoxApiState);

  useEffect(() => {
    ref.current = [];

    const unsubscribers = boxApi.map((box, index) =>
      box.api.position.subscribe((p) => {
        ref.current[index] = p[1];
      })
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [boxApi]);

  const { viewport } = useThree();
  const [clear, setClear] = useAtom(useClearState);

  const checkClearContinuously = useCallback(() => {
    if (clear !== 'clear' && clear !== 'failed') {
      const posFloor = -viewport.height / 2;
      setClear(checkClear(boxApi, ref, posFloor) ? 'clear' : 'progressing');
    }
  }, [clear, viewport.height, setClear, boxApi]);

  // 定期的にクリアの確認
  useEffect(() => {
    const intervalId = setInterval(() => {
      checkClearContinuously();
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [checkClearContinuously]);

  return null;
};

export default BlockCheck;
