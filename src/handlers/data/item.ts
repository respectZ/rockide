import * as JSONC from "jsonc-parser";
import { bpGlob } from "../../constants";
import { RockideHandler } from "../types";

export const itemHandler: RockideHandler = {
  pattern: `**/${bpGlob}/items/**/*.json`,
  process(ctx, rockide) {
    if (ctx.matchField("minecraft:icon") || ctx.matchProperty("textures")) {
      return {
        completions: () => rockide.getItemIcons().flatMap(({ values }) => values),
        definitions: () =>
          rockide
            .getItemIcons()
            .map(({ path, root }) => {
              const target = JSONC.findNodeAtLocation(root, ["texture_data", ctx.nodeValue]);
              if (!target) {
                return;
              }
              return ctx.createDefinition(path, target);
            })
            .filter((v) => v !== undefined),
      };
    }
  },
};
