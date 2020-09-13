import {VoteOption} from "./VoteOption";
import {VoteType} from "./VoteType";
import {DateTime} from "ionic-angular";

export class VoteOptionDate extends VoteOption {

  public value : DateTime;

  constructor() {
    super();

    this.type = VoteType.Date;
    this.value = null;
  }

}
