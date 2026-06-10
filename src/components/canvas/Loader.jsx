import { Html, useProgress } from "@react-three/drei";

export default function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html as="div" center className="flex justify-center items-center flex-col">
      <span className="canvas-loader" />
      <p className="text-[14px] text-white-100 font-extrabold mt-10">
        {progress.toFixed(0)}%
      </p>
    </Html>
  );
}
