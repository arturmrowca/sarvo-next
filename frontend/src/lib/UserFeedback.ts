import { Loadable } from "./generic/Loadable";
import { UserFeedbackModel } from "./models/UserFeedbackModel";

export class UserFeedback extends Loadable {

  get text(): string {
    return this.model.text;
  }

  set text(value: string) {
    this.model.text = value;
  }

  get rating(): number {
    return this.model.rating;
  }

  set rating(value: number) {
    this.model.rating = value;
  }

  get category(): string {
    return this.model.category;
  }

  set category(value: string) {
    this.model.category = value;
  }

  constructor(public model: UserFeedbackModel) {
    super();

    this.model = model;
  }

  sendToBackend() : Promise<object> {
    let payload = this.createPayloadFromModel();

    return new Promise((resolve, reject) => {
      this.post("/stream/feedback/", payload).then((res: object) => {
        resolve(res)
      })
        .catch((err: object) => {
          reject(err);
        })
    });
  }
}
