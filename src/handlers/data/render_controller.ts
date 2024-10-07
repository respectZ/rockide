import { rpGlob } from "../../constants";
import { RockideHandler } from "../types";

export const renderControllerHandler: RockideHandler = {
  pattern: `**/${rpGlob}/render_controllers/**/*.json`,
  index: "parse",
};
