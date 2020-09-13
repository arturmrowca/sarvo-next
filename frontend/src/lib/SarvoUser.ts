import {Loadable} from "./generic/Loadable";
import {SarvoUserModel} from "./models/SarvoUserModel";
import { Utility } from "../components/utility";

export class SarvoUser extends Loadable {

  public model : SarvoUserModel;

  get id(): number {
    return this.model.id;
  }

  set id(value: number) {
    this.model.id = value;
  }

  get isRegistered(): boolean {
    return this.model.isRegistered;
  }

  set isRegistered(value: boolean) {
    this.model.isRegistered = value;
  }

  get connectToCalendar(): boolean
  {
    return this.model.connectToCalendar;
  }

  set connectToCalendar(value: boolean) {
    this.model.connectToCalendar = value;
  }

  get username(): string {
    return this.model.username;
  }

  set username(value: string) {
    this.model.username = value;
  }

  get phonenumber(): string {
    return this.model.phonenumber;
  }

  set phonenumber(value: string) {
    this.model.phonenumber = value;
  }

  get profilePictureBase64(): string {
    return this.model.profilePictureBase64;
  }

  set profilePictureBase64(value: string) {
    this.model.profilePictureBase64 = value;
  }

  get agreedDSGVO(): string {
    return this.model.agreedDSGVO;
  }
  set agreedDSGVO(value: string) {
    this.model.agreedDSGVO = value;
  }

  get profilePicturePreviewBase64(): string {
    return this.model.profilePicturePreviewBase64;
  }

  set profilePicturePreviewBase64(value: string) {
    this.model.profilePicturePreviewBase64 = value;
  }
  
  get deviceTokens(): Array<string> {
    return this.model.deviceTokens;
  }

  set deviceTokens(value: Array<string>) {
    this.model.deviceTokens = value;
  }

  get deviceTypes(): Array<string> {
    return this.model.deviceTypes;
  }

  set deviceTypes(value: Array<string>) {
    this.model.deviceTypes = value;
  }

  get createdProfileDate():string{
    return this.model.createdProfileDate;
  }

  set createdProfileDate(value: string) {
    this.model.createdProfileDate = value;
  }

  get role():string{
    return this.model.role;
  }

  set role(value: string) {
    this.model.role = value;
  }

  constructor() {
    super();

    this.model = new SarvoUserModel();
  }

  /*
  Given a list of property names as string posts those properties to the backend, with
  the current value set in model
   */
  postCurrentUserProperties(properties: Array<string>) {
    // Create Message
    var message = {};
    for (let property of properties) {
      if (property == "profilePictureBase64")
        message[property] = this.model.profilePictureBase64;
      if (property == "allowNotifications")
        message[property] = this.model.allowNotifications;
      if (property == "phonenumber")
        message[property] = this.model.phonenumber;
      if (property == "username")
        message["name"] = this.model.username;
      if (property == "deviceTokens")
        message["deviceTokens"] = this.model.deviceTokens;
      if (property == "deviceTypes")
        message["deviceTypes"] = this.model.deviceTypes;
      if (property == "createdProfileDate")
        message["createdProfileDate"] = this.model.createdProfileDate;
      if (property == "role")
        message["role"] = this.model.role;
      if(property == "connectToCalendar")
        message["connectToCalendar"] = this.model.connectToCalendar;
      if(property == "agreedDSGVO")
        message["agreedDSGVO"] = this.model.agreedDSGVO;
    }

    // Do upsert
    this.post("/curuser/full/", message).then((request_response) => {

    }).catch((err) => {
      console.log(JSON.stringify(err));
    });
  }
  getCurrentUserFromBackend(): void {

    this.get("curuser/full/").then((request_response) => {
      console.log("user name: -> " + request_response["name"])
      this.id = request_response["id"]
      this.model.id = request_response["id"]

      this.username = request_response["name"]
      this.model.username = request_response["name"]

      this.phonenumber = request_response["phonenumber"]
      this.model.phonenumber = request_response["phonenumber"]

      this.profilePictureBase64 = request_response["profilePictureBase64"]
      this.model.profilePictureBase64 = request_response["profilePictureBase64"]
      
      this.connectToCalendar = request_response["connectToCalendar"];
      this.model.connectToCalendar = request_response["connectToCalendar"];

      
      
    }).catch( (err) => {
      console.log(JSON.stringify(err));
    });
  }


  getFromBackendMapNative(userID:number )
  {

    this.get("user/" + userID + "/full/").then((request_response) => {
      console.log("user name: -> " + request_response["name"])
      this.id = request_response["id"]
      this.isRegistered = request_response["isRegistered"]
      this.username = request_response["name"]      
      this.phonenumber = request_response["phonenumber"]
      this.profilePictureBase64 = request_response["profilePictureBase64"]


      // try to set username
      try{ 
        if(!this.isRegistered)
        {
        Utility.nativeStorage.getItem("noSarvoUsersNameMapping").then(mappingData => {
          var mapp = JSON.parse(mappingData)
          
            try {
              var v = mapp[this.phonenumber]
              if (v != undefined)
              {
                this.username = v;
              }
            } catch (error) {
              
            }   
        },
        error => { });
      }} catch (error) { }

    }).catch( (err) => {
      console.log(JSON.stringify(err));
    });
  }



  getFromBackend(userID: number): void {

    this.get("user/" + userID + "/full/").then((request_response) => {
      console.log("user name: -> " + request_response["name"])
      this.id = request_response["id"]
      this.isRegistered = request_response["isRegistered"]
      this.username = request_response["name"]
      this.phonenumber = request_response["phonenumber"]
      this.profilePictureBase64 = request_response["profilePictureBase64"]

    }).catch( (err) => {
      console.log(JSON.stringify(err));
    });
  }

  getFromData(map: Array<any>):void
  {
    this.id = map["id"]
    this.username = map["name"]
    this.phonenumber = map["phonenumber"]
    this.profilePictureBase64 = map["profilePictureBase64"]

  }

}
