import { bpGlob, rpGlob } from "../../constants";
import { RockideHandler } from "../types";

export const animationHandler: RockideHandler = {
  pattern: [`**/${bpGlob}/animations/**/*.json`, `**/${rpGlob}/animations/**/*.json`],
  index: "parse",
};
