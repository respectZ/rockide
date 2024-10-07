import { rpGlob } from "../../constants";
import { RockideHandler } from "../types";

export const geometryHandler: RockideHandler = {
  pattern: `**/${rpGlob}/models/**/*.json`,
  index: "parse",
};
