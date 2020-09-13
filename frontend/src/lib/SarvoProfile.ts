import {SarvoUser} from "./SarvoUser";
import {SarvoProfileModel} from "./models/SarvoProfileModel";
import { Utility } from "../components/utility";

export class SarvoProfile extends SarvoUser {

  public get allowNotifications(): boolean {
    return this.model.allowNotifications;
  }

  public set allowNotifications(value: boolean) {
    this.model.allowNotifications = value;
  }


  constructor(public model : SarvoProfileModel,
              createNew : boolean,
              phonenumber : string) {
    super();

    this.model = model; //new SarvoProfileModel();
    this.model.phonenumber = phonenumber;

    if (createNew) {
      console.log("nothing to do, new user...");
    } else {
      // fetch from api
      this.getFull("curuser/full/")
        .then((res : object) => {
        //console.log(JSON.stringify(res));
      })
        .catch((err : object) => {
        console.log(JSON.stringify(err));
      });
    }
  }

  register() : Promise<object> {
    let payload = this.createPayloadFromModel();

    return new Promise((resolve, reject) => {
      payload["phonenumber"] = Utility.converter.hash(payload["phonenumber"])
      this.post("/auth/register/", payload).then((res: object) => {
        resolve(res)
      })
        .catch((err: object) => {
          reject(err);
        })
    });
  }

  update() {
    let payload = this.createPayloadFromModel();

    return new Promise((resolve, reject) => {
      this.post("/curuser/full/", payload).then((res: object) => {
        resolve(res)
      })
        .catch((err: object) => {
          reject(err);
        })
    });

  }

  updateSubset() {
    let payloadPre = this.createPayloadFromModel();

    let payload = {}
    payload["username"] = payloadPre["username"]
    payload["profilePictureBase64"] = payloadPre["profilePictureBase64"]
    payload["profilePicturePreviewBase64"] = payloadPre["profilePicturePreviewBase64"]
    payload["connectToCalendar"] = payloadPre["connectToCalendar"]
    

    return new Promise((resolve, reject) => {
      this.post("/curuser/full/", payload).then((res: object) => {
        resolve(res)
      })
        .catch((err: object) => {
          reject(err);
        })
    });

  }
}
