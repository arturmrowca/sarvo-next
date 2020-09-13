import {Loadable} from "../generic/Loadable";
import {VoteType} from "./VoteType";

export abstract class VoteOption extends Loadable{

  /** stupid comment here */
  public type : VoteType = VoteType.Default;

  /** the actual value */
  public value : object;

}
