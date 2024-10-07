import { rpGlob } from "../../constants";
import { RockideHandler } from "../types";

export const particleHandler: RockideHandler = {
  pattern: `**/${rpGlob}/particles/**/*.json`,
  index: "parse",
  process(ctx, rockide) {
    if (ctx.matchField("texture")) {
      return {
        completions: () => rockide.getTextures().map(({ bedrockPath: path }) => path),
        definitions: () =>
          rockide
            .getTextures()
            .filter(({ bedrockPath: path }) => path === ctx.nodeValue)
            .map(({ uri }) => ctx.createDefinition(uri.fsPath)),
      };
    }
  },
};
