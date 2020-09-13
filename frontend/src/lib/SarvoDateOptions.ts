import {Loadable} from "./generic/Loadable";
import {SarvoDateOptionsModel} from "./models/SarvoDateOptionsModel";


export class SarvoDateOptions extends Loadable {

  public model: SarvoDateOptionsModel = new SarvoDateOptionsModel();

  /** set name of the group */
  set id(id: number) {
    this.model.id = id;
  }

  /** get name of the group */
  get id(): number {
    return this.model.id;
  }

  /** set name of the group */
  set eventId(value: number) {
    this.model.eventId = value;
  }

  /** get name of the group */
  get eventId(): number {
    return this.model.eventId;
  }

  /** more detailled description of the group, maybe usefull for data mining*/
  set date(value: string) {
    this.model.date = value;
  }

  /** get description of the group */
  get date(): string {
    return this.model.date;
  }

  /** get members of the group  */
  set acc_participants(acc_participants: Array<number>) {
    this.model.acc_participants = acc_participants;
  }

  /** get members of the group  */
  get acc_participants(): Array<number> {
    return this.model.acc_participants;
  }

  /** get members of the group  */
  set inter_participants(inter_participants: Array<number>) {
    this.model.inter_participants = inter_participants;
  }

  /** get members of the group  */
  get inter_participants(): Array<number> {
    return this.model.inter_participants;
  }

  /** get members of the group  */
  set dec_participants(dec_participants: Array<number>) {
    this.model.dec_participants = dec_participants;
  }

  /** get members of the group  */
  get dec_participants(): Array<number> {
    return this.model.dec_participants;
  }


  constructor() {
    super();

  }

  public sendToBackend() : Promise<object> {
    let payload = this.createPayloadFromModel();

    return new Promise((resolve, reject) => {
      this.post("/event/" + this.eventId + "/dateOptions/", payload).then((res: object) => {
        this.id = res["id"];
        resolve(res)
      })
        .catch((err: object) => {
          reject(err);
        })
    });
  }

  public getFromBackend(eventID: number): void {

    this.get("event/" + eventID + "/dateOptions/").then((requestResponse) => {
      console.log("event name: -> " + requestResponse["name"])
      this.id = requestResponse["id"]
      this.eventId = requestResponse["eventId"]
      this.date = requestResponse["date"]
      this.acc_participants = requestResponse["acc_participants"]
      this.inter_participants = requestResponse["inter_participants"]
      this.dec_participants = requestResponse["dec_participants"];

    }).catch( (err) => {
      console.log(JSON.stringify(err));
    });
  }
  /**
   removeFromBackend(): void {
    // the current user gets removed from the group.
    this.get("curuser/id/").then((requestResponse) => {
      let uid = requestResponse["userId"];
      this.delete("event/" + String(this.id) + "/members/" + uid + "/");

    }).catch((err) => {
      console.log(JSON.stringify(err));
    });
  }*/

  removeParticipant(participant: number) {

    let index_acc = this.model.acc_participants.indexOf(participant);
    if (index_acc!=-1) {
      this.model.acc_participants.splice(index_acc, 1)
    }

    let index_dec = this.model.dec_participants.indexOf(participant);
    if (index_dec!=-1) {
      this.model.dec_participants.splice(index_dec, 1)
    }

    let index_inter = this.model.inter_participants.indexOf(participant);
    if (index_inter!=-1) {
      this.model.inter_participants.splice(index_inter, 1)
    }
  }

  // Add a single participant.
  public addAccParticipant(participant: number): void {
    // remove the participant from the other arrays.
    this.removeParticipant(participant)
    this.model.acc_participants.push(participant);
  }

  // Add a single participant.
  public addADecParticipant(participant: number): void {
    // remove the participant from the other arrays.
    this.removeParticipant(participant)
    this.model.dec_participants.push(participant);
  }

  // Add a single participant.
  public addInterParticipant(participant: number): void {
    // remove the participant from the other arrays.
    this.removeParticipant(participant)
    this.model.inter_participants.push(participant);
  }

}
