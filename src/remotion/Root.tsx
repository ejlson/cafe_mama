import { Composition } from "remotion";
import {
  HeroBroadcast,
  HERO_CAPTIONS,
  heroDefaultProps,
  heroDurationInFrames,
} from "./HeroBroadcast";

/**
 * Entry point for Remotion Studio / the CLI renderer.
 * The same <HeroBroadcast/> is embedded live in the website via @remotion/player.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="HeroBroadcast"
      component={HeroBroadcast}
      durationInFrames={heroDurationInFrames(HERO_CAPTIONS.length)}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={heroDefaultProps}
    />
  );
};
