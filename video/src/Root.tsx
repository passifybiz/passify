import { Composition } from "remotion";
import { ProductDemo } from "./ProductDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ProductDemo"
      component={ProductDemo}
      durationInFrames={1800} // 60 seconds at 30fps
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
