import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { useStore } from "../store";

export const Trajectory = ({ curve, color = "white" }) => {
  const { showTrajectories } = useStore();
  // generate array of points from the curve
  const points = useMemo(() => {
    if (!curve) return [];
    return curve.getPoints(1000);
  }, [curve]);

  if (points.length === 0) return null;

  return (
    <>
      {showTrajectories && (
        <Line
          points={points}
          color={color}
          lineWidth={1.5}
          dashed={true}
          dashScale={50}
          dashSize={0.5}
          dashGap={0.5}
        />
      )}
    </>
  );
};
