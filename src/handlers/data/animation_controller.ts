import { bpGlob, rpGlob } from "../../constants";
import { molangMath, molangQueries } from "../../molang";
import { RockideHandler } from "../types";

export const animationControllerHandler: RockideHandler = {
  pattern: [`**/${bpGlob}/animation_controllers/**/*.json`, `**/${rpGlob}/animation_controllers/**/*.json`],
  index: "parse",
  process(ctx) {
    const id = ctx.path[1];
    if (ctx.matchConditionalArray("transitions")) {
      return ctx.localRef(["animation_controllers", id, "states"]);
    }
    if (ctx.matchArray("on_entry") || ctx.matchArray("on_exit") || ctx.matchArrayObject("transitions")) {
      return {
        completions: () => {
          const { document, position } = ctx;
          const queryRange = document.getWordRangeAtPosition(position, /(q|query)\.(\w+)?/);
          const prefix = document.getText(queryRange)[1] === "." ? "q" : "query";
          if (queryRange) {
            return molangQueries.map((query) => `${prefix}.${query}`);
          }
          if (document.getWordRangeAtPosition(position, /math\.\w+/)) {
            return molangMath;
          }
          return [];
        },
      };
    }
  },
};
