import {RootResponse} from "./RootResponse";

export class SarvoVerificationModel extends RootResponse{
  constructor(public challenge: string = "thisIsTh3Secret!") {
    super();
  }
}
