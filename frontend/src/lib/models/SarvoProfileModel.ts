import {SarvoUserModel} from "./SarvoUserModel";


export class SarvoProfileModel extends SarvoUserModel{
  constructor(public secret: string = "thisIsTh3Secret!") {
    super();
  }
}
