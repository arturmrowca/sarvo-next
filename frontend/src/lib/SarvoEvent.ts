import {Loadable} from "./generic/Loadable";
import {SarvoEventModel} from "./models/SarvoEventModel";
import {SarvoDateOptions} from "./SarvoDateOptions";

export class SarvoEvent extends Loadable {

  public model: SarvoEventModel = new SarvoEventModel();

  /** set name of the group */
  set id(id: number) {
    this.model.id = id;
  }

  /** get name of the group */
  get id(): number {
    return this.model.id;
  }

  /** set name of the group */
  set name(name: string) {
    this.model.name = name;
  }

  /** get name of the group */
  get name(): string {
    return this.model.name;
  }

  /** more detailled description of the group, maybe usefull for data mining*/
  set description(desc: string) {
    this.model.description = desc;
  }

  /** get description of the group */
  get description(): string {
    return this.model.description;
  }

  /** get members of the group  */
  set organizer(organizer: number) {
    this.model.organizer = organizer;
  }

  /** get members of the group  */
  get organizer(): number {
    return this.model.organizer;
  }

  /** get members of the group  */
  set numMessages(messages: number) {
    this.model.numMessages = messages;
  }

  /** get members of the group  */
  get numMessages(): number {
    return this.model.numMessages;
  }

  /** get members of the group  */
  set participants(participants: Array<number>) {
    this.model.participants = participants;
  }

  /** get members of the group  */
  get participants(): Array<number> {
    return this.model.participants;
  }

  /** set chosen groups */
  set targetGroups(targetGroups: Array<number>) {
    this.model.targetGroups = targetGroups;
  }

  /** get chosen groups of the group  */
  get targetGroups(): Array<number> {
    return this.model.targetGroups;
  }

  /** set Base64 encoded group image */
  set imagePreviewBase64(imageString: string) {
    this.model.imagePreviewBase64 = imageString;
  }

  /** get Base64 encoded group image */
  get imagePreviewBase64(): string {
    return this.model.imagePreviewBase64;
  }

  /** set Base64 encoded group image */
  set imageBase64(imageString: string) {
    this.model.imageBase64 = imageString;
  }

  /** get Base64 encoded group image */
  get imageBase64(): string {
    return this.model.imageBase64;
  }

  /** set Base64 encoded group image */
  set location(loc: string) {
    this.model.location = loc;
  }

  /** get Base64 encoded group image */
  get location(): string {
    return this.model.location;
  }

  /** set Base64 encoded group image */
  set fixed_date_option_id(date_op: number) {
    this.model.fixed_date_option_id = date_op;
  }

  /** get Base64 encoded group image */
  get fixed_date_option_id(): number {
    return this.model.fixed_date_option_id;
  }

  /** set Base64 encoded group image */
  set fixedDate(date: string) {
    this.model.fixedDate = date;
  }

  /** get Base64 encoded group image */
  get fixedDate(): string {
    return this.model.fixedDate;
  }

  /** set Base64 encoded group image */
  set organizationStatus(status: Map<string, string>) {
    this.model.organizationStatus = status;
  }

  /** get Base64 encoded group image */
  get organizationStatus(): Map<string, string> {
    return this.model.organizationStatus;
  }

  /** set Base64 encoded group image */
  set possible_dates(dateOps: Array<SarvoDateOptions>) {
    this.model.possible_dates = dateOps;
  }

  /** get Base64 encoded group image */
  get possible_dates(): Array<SarvoDateOptions> {
    return this.model.possible_dates;
  }

  /** set creation time of the group */
  set created(date: Date) {
    this.model.created = date;
  }

  /** get value if user will be invited on upser */
  get inviteUsers(): boolean {
    return this.model.inviteUsers;
  }

  /** invites a uesr on upsert if set to true */
  set inviteUsers(invite: boolean) {
    this.model.inviteUsers = invite;
  }

  /** get creation time of group */
  get created(): Date {
    return this.model.created;
  }


  constructor() {
    super();

  }

  public sendToBackend() : Promise<object> {
    let payload = this.createPayloadFromModel();

    return new Promise((resolve, reject) => {
      this.post("/event/", payload).then((res: object) => {
        this.id = res["id"];
        resolve(res)
      })
        .catch((err: object) => {
          reject(err);
        })
    });
  }
 
  public postDelete(eventID: number) : Promise<object> {
    return new Promise((resolve, reject) => {
      this.delete("event/" + eventID + "/").then((res: object) => {
        resolve(res)
      })
        .catch((err: object) => {
          reject(err);
        })
    });
  }

  public postEventProperties(properties: Array<string>) {
    // Create Message
    var message = {};
    for (let property of properties) {
      if (property == "name")
        message[property] = this.model.name;
      if (property == "organizer")
        message[property] = this.model.organizer;
      if (property == "description")
        message[property] = this.model.description;
      if (property == "fixedDate")
        message["fixed_date"] = this.model.fixedDate;
      if (property == "fixed_date_option_id")
        message[property] = this.model.fixed_date_option_id;
      if (property == "location")
        message[property] = this.model.location;
      if (property == "participants")
        message[property] = this.model.participants;
      if (property == "imageBase64")
        message[property] = this.model.imageBase64;
      if (property == "created")
        message[property] = this.model.created;
      if (property == "organizationStatus")
        message["organization_status"] = this.model.organizationStatus;
      if (property == "targetGroups")
        message["targetGroups"] = this.model.targetGroups;
      if (property == "invite_users")
        message["invite_users"] = this.model.inviteUsers;

    }

    // Do upsert
    this.post("/event/" + this.id + "/", message).then((request_response) => {
    }).catch((err) => {
      console.log(JSON.stringify(err));
    });
  }

  public getFromBackend(eventID: number): void {

    this.get("event/" + eventID + "/").then((requestResponse) => {
      console.log("event name: -> " + requestResponse["name"])
      this.id = requestResponse["id"]
      this.name = requestResponse["name"]
      this.organizer = requestResponse["organizer"]
      this.description = requestResponse["description"]
      this.fixedDate = requestResponse["fixed_date"]
      this.fixed_date_option_id = requestResponse["fixed_date_option_id"]
      this.location = requestResponse["location"]
      this.participants = requestResponse["participants"];
      this.imageBase64 = requestResponse["imageBase64"];
      this.created = requestResponse["created"]
      this.organizationStatus = requestResponse["organization_status"]

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

  // Add a single participant.
  public addParticipant(participant: number): boolean {

    if (this.model.participants.indexOf(participant)==-1) {
      this.model.participants.push(participant);
      return true;
    }
    return false;
  }

  // Add a single participant.
  public removeParticipant(participant: number): boolean {
    let index = this.model.participants.indexOf(participant);

    if (index!=-1) {
      this.model.participants.splice(index, 1);
      return true;
    }
    return false;
  }

  public static findItem(arrayIn: Array<any>, itemIn: any): number {

    return arrayIn.findIndex(item => item.id == itemIn.id);
  }

  // Add a single participant.
  public addDateOption(dateOp: SarvoDateOptions): boolean {

    if (SarvoEvent.findItem(this.model.possible_dates, dateOp)==-1) {
      this.model.possible_dates.push(dateOp);
      return true;
    }
    return false;
  }

  // Add a single participant.
  public removeDateOption(dateOp: SarvoDateOptions): boolean {
    let index = SarvoEvent.findItem(this.model.possible_dates, dateOp);

    if (index!=-1) {
      this.model.possible_dates.splice(index, 1);
      return true;
    }
    return false;
  }
}
