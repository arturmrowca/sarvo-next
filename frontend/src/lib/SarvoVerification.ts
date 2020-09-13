import {SarvoUser} from "./SarvoUser";
import {SarvoProfileModel} from "./models/SarvoProfileModel";
import {Loadable} from "./generic/Loadable";
import {SarvoVerificationModel} from "./models/responses/SarvoVerificationModel";

export class SarvoVerification extends Loadable {

  constructor() {
    super();
  }

  /**
   *
   * @param number the number to be verified as a string to allow leading zeros.
   */
  attemptVerification(number: string, hash:string) : Promise<SarvoVerificationModel> {

    return new Promise((resolve, reject) => {
      this.getDirect("auth/verify/" + number + ";;;;" + hash +"/").then((res: object) => {

        let model = new SarvoVerificationModel();
        model.challenge = res['verification'];
        model.error = false;
        resolve(model);
      })
        .catch((err: object) => {
          let model = new SarvoVerificationModel();
          model.error = false;
          model.errorMesssage = "";
          model.errorObject = err;

          reject(model);
        })
    });
  }

  update() {

  }
}
