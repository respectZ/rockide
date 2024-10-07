import { bpGlob } from "../../constants";
import { RockideHandler } from "../types";

export const lootTableHandler: RockideHandler = {
  pattern: `**/${bpGlob}/loot_tables/**/*.json`,
  index: "path",
};
