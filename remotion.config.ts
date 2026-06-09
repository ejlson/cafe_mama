import { Config } from "@remotion/cli/config";

// Only used by Remotion Studio / the CLI renderer (`npm run remotion`).
// The website embeds the same composition through @remotion/player.
Config.setVideoImageFormat("jpeg");
Config.overrideWebpackConfig((config) => config);
