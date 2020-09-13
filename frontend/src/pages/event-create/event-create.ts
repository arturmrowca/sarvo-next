import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import {Loadable} from "../../lib/generic/Loadable";
import {SarvoEventModel} from "../../lib/models/SarvoEventModel"
import { SarvoEvent } from "../../lib/SarvoEvent";
import { EventDetailsPage } from '../event-details/event-details';
import { EventMgmtAttendPage} from "../event-mgmt-attend/event-mgmt-attend";
import { SarvoGroup } from "../../lib/SarvoGroup";
import { SarvoUser } from "../../lib/SarvoUser";
import {ManageGroups} from "../../lib/ManageGroups";
import {IterableDiffers } from '@angular/core';
import {SarvoDateOptions} from "../../lib/SarvoDateOptions";
import { trackclicks } from '../../lib/generic/Trackable';
import {BackendFactory} from '../../lib/factory/BackendFactory';
import { Utility } from '../../components/utility';
import { IonicModule } from 'ionic-angular';
import { EventListComponent } from '../../components/event-list/event-list';
/**
 * Generated class for the EventCreatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-event-create',
  templateUrl: 'event-create.html',
})
export class EventCreatePage extends Loadable {


  private _userId: number;

  private _eventNameInput: string;
  private _inviteFriendsInput: string;
  private _dateChosen: string;
  private _placeInput: string;
  private _maxDateChoseable: string; // "2020-10-31"
  private loading: boolean;
  private _fixedCreateEventCB: boolean;

  private _targetContacts: Array<SarvoUser>;
  private _myGroups: Array<SarvoGroup>;
  private _targetGroup: Array<SarvoGroup>;

  eventDetailsPage = EventDetailsPage;
  eventMgmtAttend = EventMgmtAttendPage;

  private differ: IterableDiffers;
  private eventListInstance: EventListComponent

  constructor(public navCtrl: NavController, public navParams: NavParams, private differs: IterableDiffers, private alertCtrl: AlertController) {
    super();

    this.differ = differs;
    this.loading = false;

    this._eventNameInput = "";
    this._inviteFriendsInput = "";
    this._placeInput = "";
    this._maxDateChoseable = "2100-06-06";
    this._fixedCreateEventCB = false;
    this._targetContacts = []; // die die ich in hinzufügen möchte [SarvoUser1,SarvoUser5 SarvoUser9]
    // add dummy users
    /*var user1 = new SarvoUser();
    user1.id= 18;
    user1.username = "hans";
    user1.phonenumber = "";
    var user2 = new SarvoUser();
    user2.id= 19;
    user2.username = "sepp";
    user2.phonenumber = "";
    this._targetContacts.push(user1)
    this._targetContacts.push(user2)*/
    this._myGroups = ManageGroups.getMyGroups(); // Mein eGruppen im Backend
    this._targetGroup = [];

    // eventlist instance
    this.eventListInstance = navParams.get('eli');

  }

  _targetContactsOnChange()
  {
    this._targetGroupOnChange();

  }
  _targetGroupOnChange()
  {
    // 1. Change text in add friends
    var txt = "";
    for (let sarvoUser of this._targetContacts)
    {
      if (txt.length != 0)
      {
        txt += ",";
      }
      txt += sarvoUser.username;
    }
    for (let group of this._targetGroup)
    {
      if (txt.length != 0)
      {
        txt += ",";
      }
      txt += group.name;
    }
    // add contacts to friends bar
    this._inviteFriendsInput = txt;
  }

  ngDoCheck() {
    const contactsChanges = this.differ.find(this._targetContacts);
    if (contactsChanges) {
      this._targetContactsOnChange();
    }

    const groupsChanges = this.differ.find(this._targetGroup);
    if (groupsChanges) {
      this._targetGroupOnChange();
    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventCreatePage');

    // Get my user id
    this._userId = -1;
  }

  addContactsClicked(targetContacts: Array<SarvoUser>, myGroups: Array<SarvoGroup>, targetGroup: Array<SarvoGroup>): void {
    this.navCtrl.push(this.eventMgmtAttend, {targetContacts: targetContacts,
                                             myGroups : myGroups,
                                             targetGroup: targetGroup});
  }

  inviteUser(eventId, phoneNumber, hashedNumber): Promise<boolean> {

    // phoneNumber could be a hash or a number 
    var phoneNumber1 = "";
    var hashedNumber1 = "";
    
    if(phoneNumber === undefined) // if hash -> translate to number
    {
        phoneNumber1 = hashedNumber
        hashedNumber1 = Utility.converter.hash(phoneNumber1)
    }
    else // if number -> create Hash
    {
        phoneNumber1 = phoneNumber
        hashedNumber1 = hashedNumber
    } 
    
    return new Promise<boolean>((resolve, reject) => {
        const bf = BackendFactory.Instance;
        let options = {
            'eventId': eventId,
            'number': "",
            'hashedNumber': hashedNumber1
        };
        
        setTimeout(() => 
        {
        bf.post('/invite/', options)
        .then((obj) => {
            console.log("user invited");
            resolve(true);
        })
        .catch((err: any) => {
            console.log("user invite failed");
            reject(false);
        });
        
      },
      1000);

    });
  }

  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
  
  _getCurrentEventModel():SarvoEventModel
  {
    var eventImage = "";
    var dateOptions = [];

    // read participants
    var participatingUsers = [this._userId];

    for (let sarvoUser of this._targetContacts)
    {
      if (sarvoUser.isRegistered && sarvoUser.id != -1) {
        participatingUsers.push(sarvoUser.id);
      }
    }

    var dateOption1 = new SarvoDateOptions();
    dateOption1.date = this._dateChosen;
    dateOption1.acc_participants = [this._userId];
    dateOption1.inter_participants = [];
    dateOption1.dec_participants = [];

    dateOptions.push(dateOption1);


    var event = new SarvoEvent();
    event.name=this._eventNameInput;
    event.organizer= this._userId;
    event.location=this._placeInput;
    event.imageBase64=eventImage;
    event.description="->";
    event.organizationStatus["DATE"] = "pending";
    event.fixed_date_option_id=-1;
    event.participants=participatingUsers;
    event.possible_dates = dateOptions;

    return event;

  }

  _eventModelToJSON(event: SarvoEventModel): object
  {
    console.log("------------------>>> " + this._dateChosen);

    // Translate to Json
    var message = {};
    message["name"]=event.name;
    message["organizer"]=event.organizer;
    message["location"]=event.location;
    message["imageBase64"]=event.imageBase64;
    message["description"]=event.description;
    message["organization_status"]=event.organizationStatus;
    message["fixed_date_option_id"]=event.fixed_date_option_id;
    message["fixed_date"] = event.fixedDate;
    message["participants"]=event.participants;
    var dateOptionJSON = [];
    for (let dateOption of event.possible_dates)
    {
      dateOptionJSON.push({"date":dateOption.date, "acc_participants":dateOption.acc_participants,
      "inter_participants":dateOption.inter_participants, "dec_participants":dateOption.dec_participants});
    }
    message["possible_dates"] = dateOptionJSON;

    return message;

  }

  _presentDateNotChosen():void 
  {
    let alert = this.alertCtrl.create({
        title: 'Zeit fix',
        message: 'Du hast die Zeit auf fix gesetzt, aber es wurde kein Datum gewählt. Setze das Feld auf frei oder wähle ein Datum aus.',
        buttons: [
            {
                text: 'Ok',
                handler: () => {
                  alert.dismiss(false);
                    return false;
                }
            }
        ]
    });
    alert.present();
  }

  //@trackclicks
  createEventClicked(event): void
  {
    
    if (this._fixedCreateEventCB){
        // check if date is selected
        if (typeof this._dateChosen === 'undefined') 
        {
          this._presentDateNotChosen();
          return;
        }
    }
    this.loading = true; 


    // READ USER ID
    this.getDirect("curuser/id/").then((requestResponse) => {
      let s = requestResponse["userId"];
      this._userId = parseInt(s);
      var user = new SarvoUser();
      user.username = "";
      user.id = this._userId;
      this._targetContacts.push(user);

      // READ CURRENT MODEL FROM GUI
      var event = this._getCurrentEventModel();

      // If fixed selected add information
      console.log("----------------HHHH--------" + this._fixedCreateEventCB)
      if (this._fixedCreateEventCB)
      {   

        // add this information to event
        //this.view.fixedDate = true;
        event.fixedDate = event.possible_dates[0].date;
        
        // Post this date as fixed Date
        event.organizationStatus = new Map<string, string>();
        event.organizationStatus["DATE"] = "fixed";
        //event.postEventProperties(["organizationStatus", "fixedDate"]);
      }

        // Send
        var message = this._eventModelToJSON(event);
        message["invite_users"] = true; // Sends a notification to all users

        // POST MODEL AND RECEIVE ID
        var receivedEventId;
        this.post("/event/", message).then((requestResponse) => {
          let s = requestResponse["id"];
          receivedEventId = parseInt(s);

          for (let nonSarvoUser of this._targetContacts as Array<SarvoUser>) {
            if (!nonSarvoUser.isRegistered) {
              this.inviteUser(receivedEventId, Utility.converter.unhash(nonSarvoUser.phonenumber), nonSarvoUser.phonenumber)
            }
          }
          
          // GO TO EVENT DETAIL PAGE
          this.navCtrl.setRoot(this.eventDetailsPage, {createPage:true, eventId: receivedEventId, targetContacts: this._targetContacts, targetGroups: this._targetGroup});});
        
        }).catch( (err) => {
          console.log(JSON.stringify(err));
        });
  }

  quickCreateEventClicked(event): void
  {
    
    if (this._fixedCreateEventCB){
        // check if date is selected
        if (typeof this._dateChosen === 'undefined') 
        {
          this._presentDateNotChosen();
          return;
        }
    }
    this.loading = true; 


    // READ USER ID
    this.getDirect("curuser/id/").then((requestResponse) => {
      let s = requestResponse["userId"];
      this._userId = parseInt(s);
      var user = new SarvoUser();
      user.username = "";
      user.id = this._userId;
      this._targetContacts.push(user);

      // READ CURRENT MODEL FROM GUI
      var event = this._getCurrentEventModel();

      // If fixed selected add information
      console.log("----------------HHHH--------" + this._fixedCreateEventCB)
      if (this._fixedCreateEventCB)
      {   

        // add this information to event
        //this.view.fixedDate = true;
        event.fixedDate = event.possible_dates[0].date;
        
        // Post this date as fixed Date
        event.organizationStatus = new Map<string, string>();
        event.organizationStatus["DATE"] = "fixed";
        //event.postEventProperties(["organizationStatus", "fixedDate"]);
      }

        // Send
        var message = this._eventModelToJSON(event);
        message["invite_users"] = true; // Sends a notification to all users

        // POST MODEL AND RECEIVE ID
        var receivedEventId;
        this.post("/event/", message).then((requestResponse) => {
          let s = requestResponse["id"];
          receivedEventId = parseInt(s);

          for (let nonSarvoUser of this._targetContacts as Array<SarvoUser>) {
            if (!nonSarvoUser.isRegistered) {
              this.inviteUser(receivedEventId, Utility.converter.unhash(nonSarvoUser.phonenumber), nonSarvoUser.phonenumber)
            }
          }
          
          // GO TO EVENT DETAIL PAGE
          this.eventListInstance.doRefresh(null);
          this.navCtrl.pop();});//(this.eventDetailsPage, {createPage:true, eventId: receivedEventId, targetContacts: this._targetContacts, targetGroups: this._targetGroup});});
        
        }).catch( (err) => {
          console.log(JSON.stringify(err));
        });
  }

}
