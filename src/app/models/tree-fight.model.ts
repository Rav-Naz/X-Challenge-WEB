import { Fight } from "./fight.model";

export interface TreeFight {
  fight: Fight,
  children: Array<TreeFight> | null
}
