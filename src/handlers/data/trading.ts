import { bpGlob } from "../../constants";
import { RockideHandler } from "../types";

export const tradingHandler: RockideHandler = {
  pattern: `**/${bpGlob}/trading/**/*.json`,
  index: "path",
};
