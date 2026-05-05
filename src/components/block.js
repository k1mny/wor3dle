import { useBox } from '@react-three/cannon';
import { extend } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
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

const font = new FontLoader().parse(threeFontJson);
const colorCheckY = 12;
const textDepth = 0.1;
const textFaceOffset = 1.01;

const getColorForJudge = (judge) => {
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
    if (wordInput.length !== 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      api.mass.set(1);
    }, 200 * queuePos);

    return () => clearTimeout(timeoutId);
  }, [api.mass, wordInput.length, queuePos]);

  useEffect(() => {
    // color while in the input queue
    mat.current.color.copy(COLOR_INIT);
    matText.current.color.copy(COLOR_BOX_LETTER_INIT);

    // mass while in the input queue
    // mass: 0 inside useBox は 後からmass > 0にしてもboxの物理演算ができなくなるため
    api.mass.set(0);
  }, [api.mass]);

  useEffect(() => {
    const unsubscribe = api.position.subscribe(([x, y]) => {
      if (y >= colorCheckY || !mat.current || !matText.current) {
        return;
      }

      const boxColor = getColorForJudge(Judge(x, boxChar));
      const textColor = COLOR_WRONG.equals(boxColor)
        ? COLOR_BOX_LETTER_WRONG
        : COLOR_BOX_LETTER;
      mat.current.color.copy(boxColor);
      matText.current.color.copy(textColor);
    });

    return unsubscribe;
  }, [api.position, boxChar]);

  const setBoxApi = useSetAtom(useBoxApiState);
  useEffect(() => {
    const item = { id: index, ref: ref, api: api, mat: mat };

    setBoxApi((old) =>
      [...old.filter((box) => box.id !== index), item].sort(
        (a, b) => a.id - b.id
      )
    );

    return () => {
      setBoxApi((old) => old.filter((box) => box.id !== index));
    };
  }, [api, index, ref, mat, setBoxApi]);

  const textGeo = useMemo(() => {
    const geometry = new TextGeometry(boxChar, {
      font,
      size: 1,
      depth: textDepth,
    });
    geometry.computeBoundingBox();
    return geometry;
  }, [boxChar]);

  const centerOffsetX =
    -(textGeo.boundingBox.max.x + textGeo.boundingBox.min.x) / 2;
  const centerOffsetY =
    -(textGeo.boundingBox.max.y + textGeo.boundingBox.min.y) / 2;

  return (
    <group ref={ref}>
      <mesh
        position={[textFaceOffset, centerOffsetY, -centerOffsetX]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <primitive object={textGeo} attach="geometry" />
        <meshStandardMaterial ref={matText} attach="material" roughness={1} />
      </mesh>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial ref={mat} attach="material" opacity={1} />
      </mesh>
    </group>
  );
}
