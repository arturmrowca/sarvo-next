import {Loadable} from "./generic/Loadable";
import {Chat} from "./Chat";
import {VoteType} from "./vote/VoteType";
import {VoteOption} from "./vote/VoteOption";
import {VoteOptionDate} from "./vote/VoteOptionDate";
import {SarvoUser} from "./SarvoUser";

export class VoteEngine extends Loadable {

  get type(): VoteType {
    return this._type;
  }

  private _type : VoteType = VoteType.Default;

  public Chat : Chat = new Chat();
  public Organized : SarvoUser = new SarvoUser();

  get options(): Array<VoteOption> {
    return this._options;
  }

  private _options : Array<VoteOption>;

  constructor(type : VoteType) {
    super();

    switch (type) {
      case VoteType.Date:
        this._options = new Array<VoteOptionDate>();
        this._type = type;
      default:
        console.log("[ERR] an error you got: vote type not recognized.")
    }
  }


  public addOption(option : VoteOption) : void {
    this.options.push(option)
  }

  public popOption(option: VoteOption) : void {
    // splice element
  }
}
