import { usePlane } from '@react-three/cannon';
import { useThree } from '@react-three/fiber';
import { useAtomValue } from 'jotai';
import { useClearState } from './states';

export default function Borders() {
  const { viewport } = useThree();
  const clear = useAtomValue(useClearState);
  return (
    <>
      <Plane
        position={[0, -viewport.height / 2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        args={[10, 1, 1]}
      />
      <Plane position={[-5.2, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Plane position={[5.2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <Plane position={[0, 0, -1.1]} rotation={[0, 0, 0]} />
      <Plane position={[0, 0, 1.1]} rotation={[0, -Math.PI, 0]} />
    </>
  );
}

function Plane({ color, ...props }) {
  usePlane(() => ({ ...props }));
  return null;
}
