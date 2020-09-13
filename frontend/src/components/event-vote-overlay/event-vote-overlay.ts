import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { SarvoEvent } from '../../lib/SarvoEvent';
import { Loadable } from '../../lib/generic/Loadable';
import { SettingsSingleton } from '../../lib/SettingsSingleton';
import { IonicModule } from 'ionic-angular';
import { DateInformationComponentBoolean } from '../date-information/date-information';
import { SarvoUser } from '../../lib/SarvoUser';
import { BackendFactory } from '../../lib/factory/BackendFactory';
/**
 * Generated class for the EventVoteOverlayComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'event-vote-overlay',
  templateUrl: 'event-vote-overlay.html'
})
export class EventVoteOverlayComponent extends Loadable{

  @Input() event: SarvoEvent;
  @Input() attendOptions: Array<any>; // Options, who is attending: In, Out, Unsure
  @Input() view: any;

  text: string;
  isFixed:boolean; 
  fixedAttendOption:any;

  // Show details of Participants
  private dateDetailsSelectedDate:string = ""; // attendItemDate to show
  private dateDetailsShowOverlay: DateInformationComponentBoolean = new DateInformationComponentBoolean();
  private dateDetailsShowHeader:boolean = false;
  private dateDetailsSarvoContactsIn: Array<SarvoUser>= [];
  private dateDetailsSarvoContactsMaybe: Array<SarvoUser>= [];
  private dateDetailsSarvoContactsOut: Array<SarvoUser> = [];
  private dateDetailsDate: string = "";
  private dateDetailsDay: string = "";
  private dateDetailsTime: string = "";

  constructor(private cd: ChangeDetectorRef) {
    super();
    this.text = 'Hello World';  
    this.isFixed = false;
  }

  ngAfterViewInit()
  {
    for( let attendOption of this.attendOptions)
    {
      if(attendOption.fixedSelection.match("fixed") !== null) //.fixedSelection.match("fixed") !== null
        {
          this.isFixed = true;
          this.fixedAttendOption = attendOption;
          break;
        }
    }
    this.cd.detectChanges();
  }
  

  _isValid(input: string)
  {
    if (input.length == 0 || input == "Empty" || input == "jederzeit")
    {return false;}
    return true;
  }

  _sortedOptions(options: Array<any>)
  {
    var l = new Array<any>();
    for (let option of options) {
      if (option.date == "Empty" || option.date == "jederzeit")
      {continue}
      option.absoluteTime = new Date(option.date).getTime()
      l.push(option)
    }

    return l.sort((a: any, b: any) => (a.absoluteTime - b.absoluteTime));
    
  }

  _dateExtractString(input:string)
  {
    if (input.length == 0 || input == "Empty" || input == "jederzeit")
    {return "None";}
    var all = input.split("T");
    var dateElements = all[0].split("-");
    var year = dateElements[0];
    var month = dateElements[1];
    var day = dateElements[2];
    
    return day + "." + month  + "." + year;
  }
_timeExtractString(input:string)
{
  if (input.length == 0 || input == "Empty" || input == "jederzeit")
    {return "None";}
  var all = input.split("T");
  var time = all[1].substr(0,5);

  // additionally show day of week
  var date = new Date(input)
  var d = date.getDay()
  
  return time + " " + SettingsSingleton.getInstance().dayNameMapLong[d];
}
doneClicked()
{
  this.view.overlayActive = false;
  this.view.chooseOptionsActive = false;
}

selectionChanged(attendItem: any)
{
  

  if (attendItem.selection.toLowerCase().match("in") !== null)
  {
    this.attendOptionInClicked(attendItem);
  }
  if (attendItem.selection.toLowerCase().match("maybe") !== null)
  {
    this.attendOptionUnsureClicked(attendItem);
  }
  if (attendItem.selection.toLowerCase().match("out") !== null)
  {
    this.attendOptionOutClicked(attendItem);
  }
  

}

/*
On clicking "In" on any attend option this method is called to push the
result to the server
*/
attendOptionInClicked(attendOptionItem: any): void {

if (attendOptionItem.userIn) {
    return; // means I am in already - so quit
}

// add this user
attendOptionItem.userIn = true;
attendOptionItem.userOut = false;
attendOptionItem.userUnsure = false;
attendOptionItem.selection = "in";

// post this intended attendance to server
var message = {};
message["mode"] = "accept";

// for testing
this.post("/event/" + this.event.id + "/dateoptions/" + attendOptionItem.id + "/", message).then((request_response) => {
    let nrIn = parseInt(request_response["nrIn"]);
    attendOptionItem.nrIn = nrIn;

    let nrOut = parseInt(request_response["nrOut"]);
    attendOptionItem.nrOut = nrOut;

    let nrUnsure = parseInt(request_response["nrUnsure"]);
    attendOptionItem.nrUnsure = nrUnsure;

}).catch((err) => {
    console.log(JSON.stringify(err));
});

}

/*
    On clicking "Out" on any attend option this method is called to push the
    result to the server
     */
    attendOptionOutClicked(attendOptionItem: any): void {
      if (attendOptionItem.userOut) {
          return; // means I am in already - so quit
      }

      // add this user
      attendOptionItem.userIn = false;
      attendOptionItem.userOut = true;
      attendOptionItem.userUnsure = false;
      attendOptionItem.selection = "out";

      // post this intended attendance to server
      var message = {};
      message["mode"] = "decline";

      // for testing
      this.post("/event/" + this.event.id + "/dateoptions/" + attendOptionItem.id + "/", message).then((request_response) => {
          let nrIn = parseInt(request_response["nrIn"]);
          attendOptionItem.nrIn = nrIn;

          let nrOut = parseInt(request_response["nrOut"]);
          attendOptionItem.nrOut = nrOut;

          let nrUnsure = parseInt(request_response["nrUnsure"]);
          attendOptionItem.nrUnsure = nrUnsure;

      }).catch((err) => {
          console.log(JSON.stringify(err));
      });

  }

  /*
  On clicking "Unsure" on any attend option this method is called to push the
  result to the server
   */
  attendOptionUnsureClicked(attendOptionItem: any): void {
      if (attendOptionItem.userUnsure) {
          return; // means I am in already - so quit
      }

      // add this user
      attendOptionItem.userIn = false;
      attendOptionItem.userOut = false;
      attendOptionItem.userUnsure = true;
      attendOptionItem.selection = "maybe";

      // post this intended attendance to server
      var message = {};
      message["mode"] = "unsure";

      // for testing
      this.post("/event/" + this.event.id + "/dateoptions/" + attendOptionItem.id + "/", message).then((request_response) => {
          let nrIn = parseInt(request_response["nrIn"]);
          attendOptionItem.nrIn = nrIn;

          let nrOut = parseInt(request_response["nrOut"]);
          attendOptionItem.nrOut = nrOut;

          let nrUnsure = parseInt(request_response["nrUnsure"]);
          attendOptionItem.nrUnsure = nrUnsure;

      }).catch((err) => {
          console.log(JSON.stringify(err));
      });

  }


  expandParticipantsClicked(attendItem: any)
{
  try {
    // close expansion again
    if(this.dateDetailsSelectedDate == attendItem.date)
    {
      this.dateDetailsSelectedDate = "";
    }
    else // expand
    {
      BackendFactory.Instance.get("dateoption/" + attendItem.id.toString() + "/").then((requestResponse) => {
        var acc_names = requestResponse["acc_participants"]
        var maybe_names = requestResponse["inter_participants"]
        var dec_names = requestResponse["dec_participants"] 

        this.showAttendOptionParticipants(attendItem, acc_names, maybe_names, dec_names);
        this.dateDetailsSelectedDate = attendItem.date; 
      });
    }    
  } catch (error) {}
}

showAttendOptionParticipants(attendOption:any, acc_names:Array<string>, maybe_names:Array<string>, dec_names:Array<string>)
 {
  let date = new Date(attendOption.date);
  var all = attendOption.date.split("T");
  var dateElements = all[0].split("-");
  var year = dateElements[0];
  var month = dateElements[1];
  var day = dateElements[2];
  
  this.dateDetailsDay = SettingsSingleton.getInstance().dayNameMap[date.getDay()]
  this.dateDetailsTime = date.getUTCHours() +":" + date.getMinutes()
  this.dateDetailsDate =  day + "." + month + "." + year;
  
  this.dateDetailsSarvoContactsIn = []; // list of sarvo users
  this.dateDetailsSarvoContactsMaybe =  []; // list of sarvo users
  this.dateDetailsSarvoContactsOut =  []; // list of sarvo users

  acc_names.forEach(name => 
  {
    var user = new SarvoUser();
    user.username = name; 
    user.phonenumber = "";
    this.dateDetailsSarvoContactsIn.push(user)
  });

  maybe_names.forEach(name => 
  {
    var user = new SarvoUser();
    user.username = name; 
    user.phonenumber = "";
    this.dateDetailsSarvoContactsMaybe.push(user)
  });

  dec_names.forEach(name => 
  {
    var user = new SarvoUser();
    user.username = name; 
    user.phonenumber = "";
    this.dateDetailsSarvoContactsOut.push(user)
  });

 }  


}
