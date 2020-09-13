import { Component, Input, ViewChild } from '@angular/core';
import { AlertController, Select, NavController } from 'ionic-angular';
import { Loadable } from '../../lib/generic/Loadable';
import { SarvoUser } from '../../lib/SarvoUser';
import { SarvoEventModel } from '../../lib/models/SarvoEventModel';
import { HomePage } from '../../pages/home/home';
import { SarvoDateOptions } from '../../lib/SarvoDateOptions';
import { SarvoEvent } from '../../lib/SarvoEvent';
import { EventDetailsPage } from '../../pages/event-details/event-details';
import { SettingsSingleton } from '../../lib/SettingsSingleton';

/**
 * Generated class for the IterableEventsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'iterable-events',
  templateUrl: 'iterable-events.html'
})
export class IterableEventsComponent extends Loadable{

  @Input() events: any; // should have format: title, image, date, description
  @ViewChild('mySelect') selectRef: Select;

  private maximalIndex:number; // number of elements that are shown
  private initialMaximalIndex:number = 2;
  private stepSize:number = 6; // number of additional items to show after more is clicked
  private usageType: string; 
  private hideShowMore:boolean = false;
  
  public choice:string;
  private previousChoice:string;

  constructor(private alertCtrl: AlertController, public navCtrl: NavController) { 
    super();
    this.choice = "null";
    this.previousChoice = "null";
    this.maximalIndex = this.initialMaximalIndex;

    this.usageType = "category"; // Loading categories
  }
  
  ngDoCheck()
  {
    // Check if selection changed
    if(this.choice != this.previousChoice)
    {
      if(this.choice == "friends")
      {
        console.log("Do something");
      }
      console.log(this.choice)
      this.previousChoice = this.choice;
    }
  }

  
  closeAll()
  {
    this.maximalIndex = this.initialMaximalIndex;
    this.hideShowMore = false;
  }

  showMore()
  {
    this.maximalIndex = this.maximalIndex + this.stepSize

    // if reached end load more entries 
    // mI = 13    Bilder 12
    if(this.maximalIndex > this.events.length)
    {
      // load next rows of events
      if(this.usageType == "category")
      {
        // Load from Index length - 1 + this stepSize * 2
        var m = {}
        m["category"] = this.events[0]["categoryTitle"]
        m["from"] = this.events.length-1
        m["to"] = this.events.length-1 + 2*this.stepSize // Load first 6 entries - rest on clicking more

        this.post("/eventbrowse/categories/detail/", m).then((requestResponse2) => {

          // remove duplicate
          var dupe = false
          if(requestResponse2[0]["title"] == this.events[this.events.length-1]["title"])
          {
            this.events.splice(this.events.length-1, 1);
            dupe = true;
          }
          this.events = this.events.concat(requestResponse2);

          // if nothing more to load disable button 
          try {
            if(undefined == requestResponse2[1])// means length 1
            {this.hideShowMore = dupe;
            }
          
          } 
          catch (error){
            }
          
        }).catch( (err) => {
          console.log(JSON.stringify(err));
        });

      }
    }
  }

  showDetailedDescription(eventEntry:any)
  {
    let alert = this.alertCtrl.create({
      title: eventEntry.title,
      cssClass: "scaledAlert",
      message: '<div style="overflow-y:auto;max-height:90vh;min-width:90vw;">' + eventEntry.description + '</div>',
      buttons: [
        {
          text: 'Ok',
          handler: data => {
              
          }
      },
      {
        text: 'Event daraus erstellen',
        handler: data => {
          this._createEventFromTemplate(eventEntry)
        }
    }
      ]
  });
  alert.present();
  }

  starClicked(eventEntry)
  {
    eventEntry.starChosen = !eventEntry.starChosen;
  }

  selectClicked()
  { 
      this.selectRef.open();
  }

  /*
    Erzeuge einen Event Eintrag 
   */
  _createEventFromTemplate(eventEntry)
  {
    // 2020-04-24T09:29:00Z

  // READ USER ID
  this.getDirect("curuser/id/").then((requestResponse) => {
    let s = requestResponse["userId"];
    
    var user = new SarvoUser();
    user.username = "";
    user.id = parseInt(s);
    var _targetContacts = []
    _targetContacts.push(user);

    // READ CURRENT MODEL FROM GUI
    var event = this._getCurrentEventModel(user.id, eventEntry.date, eventEntry.title, eventEntry.location, eventEntry.description, eventEntry.image);

    // If fixed selected add information 
    if (eventEntry.date != "jederzeit")
    { 
      // add this information to event 
      event.fixedDate = event.possible_dates[0].date;
      
      // Post this date as fixed Date
      event.organizationStatus = new Map<string, string>();
      event.organizationStatus["DATE"] = "fixed"; 
    }

      // Send
      var message = this._eventModelToJSON(event);
      message["invite_users"] = true; // Sends a notification to all users
      message["from_template"] = true

      // POST MODEL AND RECEIVE ID
      var receivedEventId;
      this.post("/event/", message).then((requestResponse) => {
        let s = requestResponse["id"];
        receivedEventId = parseInt(s);

        // GO TO EVENT DETAIL PAGE - or to Home both allowed 
        this.navCtrl.setRoot(EventDetailsPage, {createPage:true, eventId: receivedEventId, targetContacts: _targetContacts, targetGroups: []});});
      
      }).catch( (err) => {
        console.log(JSON.stringify(err));
      });
  }
  
  _getCurrentEventModel(userId:number, date:string, eventTitle:string, eventLocation:string, eventDescription:string, eventImage:string):SarvoEventModel
  {
    
    var dateOptions = [];

    if(eventLocation == "Empty")
    {eventLocation= ""}

    // read participants
    var participatingUsers = [userId];

    /*for (let sarvoUser of this._targetContacts)
    {
      if (sarvoUser.isRegistered) {
        participatingUsers.push(sarvoUser.id);
      }
    }*/

    var dateOption1 = new SarvoDateOptions();
    dateOption1.date = date;
    dateOption1.acc_participants = [userId];
    dateOption1.inter_participants = [];
    dateOption1.dec_participants = [];

    dateOptions.push(dateOption1);


    var event = new SarvoEvent();
    event.name = eventTitle;
    event.organizer = userId;
    event.location = eventLocation;
    event.imageBase64=eventImage;
    event.description=eventDescription;
    event.organizationStatus["DATE"] = "pending";
    event.fixed_date_option_id=-1;
    event.participants=participatingUsers;
    event.possible_dates = dateOptions;

    return event;

  }

  _eventModelToJSON(event: SarvoEventModel): object
  {

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

  _showDate(input:string)
  {
    if(input == "jederzeit")
      return input
    else
      return this._dateExtractString(input) + " - "+this._timeExtractString(input)
  }

  _dateExtractString(input:string)
    {
        var all = input.split("T");
        var dateElements = all[0].split("-");
        var year = dateElements[0];
        var month = dateElements[1];
        var day = dateElements[2];
        
        return day + "." + month  + "." + year;
    }

    _timeExtractString(input:string)
    {
    var all = input.split("T");
    var time = all[1].substr(0,5);

    // additionally show day of week
    var date = new Date(input)
    var d = date.getDay()
    
    return SettingsSingleton.getInstance().dayNameMap[d] + " " + time;
    }
}
