import { useBox } from '@react-three/cannon';
import { useFrame, extend } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { useBoxApiState, useWordInputState } from './states';
import threeFontJson from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { Judge } from './logic';
import {
  COLOR_BOX_LETTER,
  COLOR_BOX_LETTER_INIT,
  COLOR_BOX_LETTER_WRONG,
  COLOR_CLEAR,
  COLOR_INCORRECT,
  COLOR_INIT,
  COLOR_WRONG,
  CORRECT,
  INCORRECT,
} from './constants';
extend({ TextGeometry });

const SetColor = (judge) => {
  if (judge === CORRECT) {
    return COLOR_CLEAR;
  } else if (judge === INCORRECT) {
    return COLOR_INCORRECT;
  } else {
    return COLOR_WRONG;
  }
};

const putPosition = [-4, -2, 0, 2, 4];

export default function Model({ index, boxChar, queuePos }) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    args: [2, 2, 2],
    rotation: [0, -Math.PI / 2, 0],
    position: [putPosition[queuePos], 13, 0],
    friction: 0,
  }));
  const mat = useRef();
  const matText = useRef();

  const wordInput = useAtomValue(useWordInputState);
  useEffect(() => {
    if (wordInput.length === 0) {
      setTimeout(() => {
        api.mass.set(1);
      }, 200 * queuePos);
    }
  }, [api, wordInput, queuePos]);

  useEffect(() => {
    // color while in the input queue
    mat.current.color = COLOR_INIT;
    matText.current.color = COLOR_BOX_LETTER_INIT;

    // mass while in the input queue
    // mass: 0 inside useBox は 後からmass > 0にしてもboxの物理演算ができなくなるため
    api.mass.set(0);
  }, [api.mass]);

  // 一定間隔ごとに色を更新
  useFrame(({ clock }) => {
    // 判定
    if (clock.oldTime % 10 === 0) {
      api.position.subscribe((p) => {
        if (p[1] < -5 + 17) {
          const judge = Judge(p[0], boxChar);
          mat.current.color = SetColor(judge);
          matText.current.color =
            mat.current.color === COLOR_WRONG
              ? COLOR_BOX_LETTER_WRONG
              : COLOR_BOX_LETTER;
        }
      });
    }
  });

  const setBoxApi = useSetAtom(useBoxApiState);
  useEffect(() => {
    setBoxApi((old) => [...old, { id: index, ref: ref, api: api, mat: mat }]);
  }, [api, index, ref, mat, setBoxApi]);

  const textGeo = new TextGeometry(boxChar, {
    font: new FontLoader().parse(threeFontJson),
    size: 1,
    height: 0.1,
  });
  textGeo.computeBoundingBox();
  const centerOffsetX =
    -(textGeo.boundingBox.max.x - textGeo.boundingBox.min.x) / 2;
  const centerOffsetY =
    -(textGeo.boundingBox.max.y - textGeo.boundingBox.min.y) / 2;

  return (
    <group ref={ref}>
      <mesh
        position={[1, centerOffsetY, -centerOffsetX]}
        rotation={[0, Math.PI / 2, 0]}
        args={[textGeo]}
      >
        <meshStandardMaterial ref={matText} attach="material" opacity={0.5} />
      </mesh>
      <mesh>
        <boxBufferGeometry args={[2, 2, 2]} />
        <meshStandardMaterial ref={mat} attach="material" opacity={1} />
      </mesh>
    </group>
  );
}
