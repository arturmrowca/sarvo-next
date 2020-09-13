import {Loadable} from "./generic/Loadable";
import {SarvoUser} from "./SarvoUser";
import {SarvoGroupModel} from "./models/SarvoGroupModel";
import { rejects } from "assert";

export class SarvoGroup extends Loadable {

  public model: SarvoGroupModel;

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

  /** set members of the group  */
  set members(members: Array<number>) {
    this.model.members = members;
  }

  /** get admins of the group  */
  get members(): Array<number> {
    return this.model.members;
  }

  /** set admins of the group  */
  set admins(admins: Array<number>) {
    this.model.admins = admins;
  }

  /** get members of the group  */
  get admins(): Array<number> {
    return this.model.admins;
  }

  /** set Base64 encoded group preview image */
  set imagePreviewBase64(imageString: string) {
    this.model.imagePreviewBase64 = imageString;
  }

  /** get Base64 encoded group preview image */
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

  /** set creation time of the group */
  set created(date: Date) {
    this.model.created = date;
  }

  /** get creation time of group */
  get created(): Date {
    return this.model.created;
  }

  constructor() {
    super();

    this.model = new SarvoGroupModel();

    //this.name = "VIPs";
    this.description = "Your description goes here...";
  }

  public pushMembers() {
    let payload = {"user_ids": this.members};
    this.post("/group/" + String(this.id) + "/members/", payload);  
  }

  sendToBackend() : Promise<object> {
    let payload = this.createPayloadFromModel();

    return new Promise((resolve, reject) => {
      this.post("/group/", payload).then((res: object) => {
        this.id = res["id"];
        resolve(res)
      })
        .catch((err: object) => {
          reject(err);
        })
    });
  }

  public postProperties(properties: Array<string>) {

    // Create Message
    var message = {};
    for (let property of properties) {
      if (property == "name")
        message[property] = this.model.name;
      if (property == "description")
        message[property] = this.model.description;
      if (property == "members")
        message[property] = this.model.members;
      if (property == "imageBase64")
        message[property] = this.model.imageBase64;
      if (property == "imagePreviewBase64")
        message[property] = this.model.imagePreviewBase64;
      if (property == "created")
        message[property] = this.model.created;
      if (property == "admins")
        message[property] = this.model.admins;
    }

    // Do upsert
    this.post("/group/" + this.id + "/", message).then((request_response) => {
    }).catch((err) => {
      console.log(JSON.stringify(err));
    });
  }

  getFromBackend(groupID: number): void {

    this.getDirect("group/" + groupID + "/").then((request_response) => {
      console.log("group name: -> " + request_response["name"])
      this.id = request_response["id"]
      this.name = request_response["name"]
      this.description = request_response["description"]
      this.members = request_response["members"];
      this.imageBase64 = request_response["imageBase64"];
      this.imagePreviewBase64 = request_response["imagePreviewBase64"]
      this.created = request_response["created"]
      this.admins = request_response["admins"]

    }).catch( (err) => {
      console.log(JSON.stringify(err));
    });
  }

  removeFromBackend(): void {
    // the current user gets removed from the group.
    this.getDirect("curuser/id/").then((requestResponse) => {
      let uid = requestResponse["userId"];
      this.delete("group/" + String(this.id) + "/members/" + uid + "/");

    }).catch((err) => {
      console.log(JSON.stringify(err));
    });
  }

  addMember(member: number): boolean {
    if (this.model.members.indexOf(member)==-1) {
      this.model.members.push(member);
      return true;
    }
    return false;
  }

  addAdmin(admin: number): boolean {
    if (this.model.admins.indexOf(admin)==-1) {
      this.model.admins.push(admin);
      return true;
    }
    return false;
  }

  updateMembers() : Promise<object> {
    let payload = {"user_ids": this.members};

    return new Promise((resolve, reject) => {
      this.post("/group/" + String(this.id) + "/members/", payload).then((res: object) => {
        resolve(res)
      })
        .catch((err: object) => {
          reject(err);
        })
    });
  }

  updateAdmins() : Promise<object> {
    let payload = {"admin_ids": this.admins};

    return new Promise((resolve, reject) => {
      this.post("/group/" + String(this.id) + "/admins/", payload).then((res: object) => {
        resolve(res)
      })
        .catch((err: object) => {
          reject(err);
        })
    });
  }
}
