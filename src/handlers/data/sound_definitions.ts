import { rpGlob } from "../../constants";
import { RockideHandler } from "../types";

export const soundDefinitionsHandler: RockideHandler = {
  pattern: `**/${rpGlob}/sounds/sound_definitions.json`,
  index: "parse",
  process(ctx, rockide) {
    if (ctx.matchArray("sounds") || ctx.matchArrayObject("sounds", "name")) {
      return {
        completions: () => rockide.getSounds().map(({ bedrockPath: path }) => path),
        definitions: () =>
          rockide
            .getSounds()
            .filter(({ bedrockPath: path }) => path === ctx.nodeValue)
            .map(({ uri }) => ctx.createDefinition(uri.fsPath)),
      };
    }
  },
};
