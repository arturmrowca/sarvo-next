import { Component, Input } from '@angular/core';
import { SarvoEvent } from '../../lib/SarvoEvent';
import { EventListComponent } from '../event-list/event-list';
import { Loadable } from '../../lib/generic/Loadable';
import { SettingsSingleton } from '../../lib/SettingsSingleton';
import { IonicModule } from 'ionic-angular';
import { SarvoUser } from '../../lib/SarvoUser';
import { DateInformationComponentBoolean } from '../date-information/date-information';
import { BackendFactory } from '../../lib/factory/BackendFactory';
import { CalendarSynchronizer } from '../../lib/generic/calendarSynchronizer';

/**
 * Generated class for the AddVoteOverlayComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'add-vote-overlay',
  templateUrl: 'add-vote-overlay.html'
})
export class AddVoteOverlayComponent extends Loadable{ // Loadable should be removed here in future

  @Input() event: SarvoEvent;
  @Input() view: any;
  @Input() attendOptions: Array<any>; // Options, who is attending: In, Out, Unsure
  @Input() eventSpecsBox: any;
  @Input() user: SarvoUser;
  
  

  text: string;
  public addClicked:boolean;
  public allFixed: boolean;
  public chosenDate: string;
  private deleteShown:boolean;

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

  constructor() {
    super();
    
    this.addClicked=false;

    // check if any is fixed -> if so hide the others
    //this._setAllFixedState();
    this.deleteShown = false;

  }

  _editButtonClicked()
  {
    this.deleteShown = !this.deleteShown;
  }

  _setAllFixedState()
  {
    this.allFixed = false;
    for (let option of this.attendOptions) {

      if (option.fixedSelection == "fixed") {
        this.allFixed = true;
      }
  }
}

  _validEntry(input:string)
  {
    if (input.length == 0)
    {return false;}
    return true;
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
    if (input.length == 0  || input == "Empty" || input == "jederzeit")
    {return "None";}
    
    var all = input.split("T");
    var time = all[1].substr(0,5);

    // additionally show day of week
    var date = new Date(input)
    var d = date.getDay()
    
    return time + " " + SettingsSingleton.getInstance().dayNameMapLong[d];
  }

  addDateOptionClicked()
  {
    this.addClicked=true; 
  }
  cancelAddOptionClicked()
  {
    this.addClicked=false;
  }
  choseEventDone()
  {
    this.addClicked=false;
  }
  doneClicked()
  {
    this.view.overlayActive = false;
    this.view.addOptionsActive = false;
    
  }

    /*
    This method sets the label of the time to event field
    */
   _set_time_diff(eventTime: string): void {
    try {
        
    // event_time e.g. "2019-03-12T20:10:00Z"
    var dateNow = this.toLocalDate(new Date());
    var dateDiff = this.getDateDiff(eventTime, dateNow);

    if (dateDiff.diffDays== 0)
    {
        this.eventSpecsBox.timeToEvent = dateDiff.diffHrs + "h " +
        dateDiff.diffMins + "min";
    }
    else
    {
        this.eventSpecsBox.timeToEvent = dateDiff.diffDays + "d " + dateDiff.diffHrs + "h";
    }

    if(dateDiff.diffHrs<0 || dateDiff.diffDays < 0 || dateDiff.diffMins < 0)
    {
        this.eventSpecsBox.timeToEvent = "now";
    }
    
    } catch (error) {
            console.error("Time diff computation failed")
    }
        
    }
    toLocalDate(date: Date): Date {
      let dateTemp = new Date(date);
      let localDate = new Date(dateTemp.getTime() - dateTemp.getTimezoneOffset()*60000);

      return localDate;
    }
    // get difference of dates.
    getDateDiff(eventFDate, date: Date) {
      let eventDate: any = new Date(eventFDate);
      let compDate: any = new Date(date);

      // get difference of current date and activity [ms].
      let diff: number = eventDate.getTime() - compDate.getTime();
      // get diff in years.
      let diffYears = eventDate.getUTCFullYear() - compDate.getUTCFullYear();
      // get diff in months.
      let diffMonths = eventDate.getUTCMonth() - compDate.getUTCMonth();
      // get diff in days.
      let diffDayDate = eventDate.getUTCDate() - compDate.getUTCDate();
      // get diff in days.
      let diffDays: number = Math.floor(diff / 86400000);
      // get diff in hours.
      let diffHrs: number = Math.floor((diff % 86400000) / 3600000);
      // get diff in mins.
      let diffMins: number = Math.round(((diff % 86400000) % 3600000) / 60000);

      return {
        diffYears: diffYears,
        diffMonths: diffMonths,
        diffDayDate: diffDayDate,
        diffDays: diffDays,
        diffHrs: diffHrs,
        diffMins: diffMins,
        diffMs: diff
      };
    }


  deleteOptionClicked(attendItem: any)
  {
    // remove element from 
    this.delete("dateoption/" + attendItem.id + "/").then((res: object) => {
       console.log("deleted");
    })
      .catch((err: object) => {
        console.log(err);
      });
    


    // remove it from the list
    const index: number = this.attendOptions.indexOf(attendItem);
    if (index !== -1) {
        this.attendOptions.splice(index, 1);
    }    

  }

  selectionChanged(attendOption: any)
  {

    
    
    if(attendOption.fixedSelection.toLowerCase().match("fixed") !== null)
    {

        // Read chosen date
        this.view.fixedDate = true;
        this.event.fixedDate = attendOption.date;
        this.eventSpecsBox.fixedAttendOption = attendOption;

        // Set time to event label
        try {
          this._set_time_diff(this.event.fixedDate);
        } catch (error) {
          console.error("---> Could not set time difference")
        }
        

        // Post this date as fixed Date
        this.event.organizationStatus = new Map<string, string>();
        this.event.organizationStatus["DATE"] = "fixed";
        this.postStatusAndSynchronizeCalendar();


        // Set others as open and this as fixed Attend Option
        for (let option of this.attendOptions) {
            option.fixedSelection = "open";
            if (option.id == attendOption.id) {
              option.fixedSelection = "fixed";
            }
    }
  }

    // Unfix and show all
    if(attendOption.fixedSelection.toLowerCase().match("open") !== null)
    {
      
      for (let option of this.attendOptions) {
        option.fixedSelection = "open";
      }

      
        // Read chosen date
        this.view.fixedDate = false;
        this.event.fixedDate = "reset"; // Reset value

        // Set time to event label
        this.eventSpecsBox.timeToEvent = "";

        // Post this date as unfixed Date
        this.event.organizationStatus = new Map<string, string>();
        this.event.organizationStatus["DATE"] = "pending";
        this.postStatusAndSynchronizeCalendar();


        // Reset the fixed Attend Option
        this.eventSpecsBox.fixedAttendOption = {date: '', nrIn: 0, nrOut: 0, nrUnsure: 0, contacts: []};
    }
}

postStatusAndSynchronizeCalendar()
{
  var message = {};
  message["fixed_date"] = this.event.model.fixedDate;
  message["organization_status"] = this.event.model.organizationStatus;
  this.event.post("/event/" + this.event.model.id + "/", message).then((request_response) => {
    
    // after setting it fixed or unfixed synchronize calendar
    this.user.get("curuser/full/").then((request_response) => {
      console.log("user name: -> " + request_response["name"])
      this.user.id = request_response["id"]
      this.user.model.id = request_response["id"]
      this.user.username = request_response["name"]
      this.user.model.username = request_response["name"]
      this.user.phonenumber = request_response["phonenumber"]
      this.user.model.phonenumber = request_response["phonenumber"]
      this.user.profilePictureBase64 = request_response["profilePictureBase64"]
      this.user.model.profilePictureBase64 = request_response["profilePictureBase64"]
      this.user.connectToCalendar = request_response["connectToCalendar"];
      this.user.model.connectToCalendar = request_response["connectToCalendar"];

      // Sync Calendar
      CalendarSynchronizer.Instance.loadCalendarState(true, this.user); 
      
    }).catch( (err) => {
      console.log(JSON.stringify(err));
    });

    
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
