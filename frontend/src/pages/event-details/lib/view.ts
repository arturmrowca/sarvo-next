import {GUIElements} from  '../../event-details/lib/content';
import { SettingsSingleton } from '../../../lib/SettingsSingleton';
import { SarvoUser } from '../../../lib/SarvoUser';
/*
  This class stores the options for hiding or
  showng elements of the GUI
*/
export class ViewOptions {
  admin = true; // true if view is for admin
  descriptionEnabled = false; // true if description Field is enabled
  fixedDate = false; // true if the date was fixed by the admin
  chooseImage = false; // true if image to choose is clicked
  addOptionClicked = false; // true if add Option was clicked -> shows options
  editIsActive = false; // if true Edit mode is active
  overlayActive=false; // if true overlay is shown
  chooseOptionsActive = false; // if true shows date options overlay
  addOptionsActive = false; // true if add options is open
  loading:boolean; // Defines if the page is loading
  changeFixedDateExpanded:boolean = false; // gui opens changing of fixed date on main screen
};


/*
  This class contains all actions that are performed on the view, i.e. 
  hiding, showing components etc. 
*/
export class EventDetailsPageView {
  
  public options:ViewOptions; // GUI state 
  public gui:GUIElements; // GUI elements
  
 
  constructor()
  {
    // View consists of options and gui elements
    this.options = new ViewOptions();
    this.gui = new GUIElements();
  }


  /*  ----------------------------------------------------------
            INITIALIZATION
      ----------------------------------------------------------*/

  /*
    This method defines the initial view state on Page call
  */
  public initializeView(tabBar:any)
  {
    // Initialize individual parts
    this.options.loading = true;
    this.initializeDescription();
    this.initializeEventSpecifica();
    this.initializeGeneral(tabBar);
    this.initializeOptions();
  }

/*
  This method initializes the general information of GUI elements
*/
 public initializeGeneral(tabBar:any)
 {
   this.gui.generalBox.tabBar = tabBar;
   this.tabBarState(false);
 }

  /*
    This method initializes the event specifica box
  */
 public initializeEventSpecifica()
 {
  this.gui.eventSpecsBox.maxDateChoseable = "2100-06-06";
  this.gui.eventSpecsBox.fixedAttendOption = {date: '', nrIn: 0, nrOut: 0, nrUnsure: 0, contacts: []};
 }

  /*
    This method initializes the Options of the View 
  */
 public initializeOptions()
 {
   // View Mode
   this.options.admin = true;
   this.options.descriptionEnabled = true;
   this.options.fixedDate = false;
   this.options.overlayActive=false;
   this.options.chooseOptionsActive = false;
 }

  /* 
    This method initializes the description box
  */
  public initializeDescription()
  {
    this.gui.descriptionBox.descriptionText = "";
    this.gui.descriptionBox.descriptionExpanded = true;
    this.gui.descriptionBox.descriptionExpandButtonText = "+";
    this.expandDescription()
  }


  /*  ----------------------------------------------------------
            VIEW MODES
      ----------------------------------------------------------*/
  
  /*
    Change to mode that event is fixed
  */
  public fixedEventMode()
  {
    this.options.fixedDate = true; // hides list and shows entry
  }

  /*
    Change to edit mode or from edit mode
  */
  public changeEditMode()
  {
      this.options.editIsActive = !this.options.editIsActive;
  }

  /*
    show date vote overlay
  */
  public dateVoteOverlayMode(active:boolean)
  {
    if (active)
    {
      this.options.overlayActive = true;
      this.options.chooseOptionsActive = true;
    }
  }

  public addOptionsOverlayMode(active:boolean)
  {
    if (active)
    {
      this.options.overlayActive = true;
      this.options.addOptionsActive = true; 
    }
  }

  public adminMode(active:boolean)
  {
    
    if (active) {
        this.options.admin = true;
    } 
    
    else {
        this.options.admin = false;
    }
  }




  /*  ----------------------------------------------------------
            VIEW ACTIONS
      ----------------------------------------------------------*/

  /*
    Show details of participants 
  */
 showAttendOptionParticipants(attendOption:any, acc_names:Array<string>, maybe_names:Array<string>, dec_names:Array<string>)
 {
  let date = new Date(attendOption.date);
  var all = attendOption.date.split("T");
  var dateElements = all[0].split("-");
  var year = dateElements[0];
  var month = dateElements[1];
  var day = dateElements[2];
  
  this.gui.generalBox.dateDetailsDay = SettingsSingleton.getInstance().dayNameMap[date.getDay()]
  this.gui.generalBox.dateDetailsTime = date.getUTCHours() +":" + date.getMinutes()
  this.gui.generalBox.dateDetailsDate =  day + "." + month + "." + year;
  
  this.gui.generalBox.dateDetailsSarvoContactsIn = []; // list of sarvo users
  this.gui.generalBox.dateDetailsSarvoContactsMaybe =  []; // list of sarvo users
  this.gui.generalBox.dateDetailsSarvoContactsOut =  []; // list of sarvo users

  acc_names.forEach(name => 
  {
    var user = new SarvoUser();
    user.username = name; 
    user.phonenumber = "";
    this.gui.generalBox.dateDetailsSarvoContactsIn.push(user)
  });

  maybe_names.forEach(name => 
  {
    var user = new SarvoUser();
    user.username = name; 
    user.phonenumber = "";
    this.gui.generalBox.dateDetailsSarvoContactsMaybe.push(user)
  });

  dec_names.forEach(name => 
  {
    var user = new SarvoUser();
    user.username = name; 
    user.phonenumber = "";
    this.gui.generalBox.dateDetailsSarvoContactsOut.push(user)
  });

 }  

  

  /*
    This method sets the description and adds it to the GUI
  */
  setDescription(description: string)
  {
    this.gui.descriptionBox.descriptionText = description;
    this.gui.descriptionBox.descriptionExpanded = false;
    this.expandDescription();
  }
  
  /* 
    This method expands the description field if + is pressed
  */
  expandDescription()
  {
    // Change button 
    this.gui.descriptionBox.noDescriptionText=false;
    if (this.gui.descriptionBox.descriptionExpanded)
    {
      this.gui.descriptionBox.descriptionTextShow = this.gui.descriptionBox.descriptionText;
      this.gui.descriptionBox.descriptionExpanded = false;
      this.gui.descriptionBox.descriptionExpandButtonText = "-";
    }
    else
    {
      this.gui.descriptionBox.descriptionTextShow = this.gui.descriptionBox.descriptionText.substring(0, 80) + "...";
      this.gui.descriptionBox.descriptionExpanded = true;
      this.gui.descriptionBox.descriptionExpandButtonText = "+";
    }

    // Limit text length
    if (this.gui.descriptionBox.descriptionText.length < 30)
    {
        this.gui.descriptionBox.descriptionExpandButtonText = "";
    }
    if (this.gui.descriptionBox.descriptionText.length == 0)
    {
        this.gui.descriptionBox.noDescriptionText = true;
    }
  }

    /*
    This method sets the label of the time to event field
    */
    set_time_diff(eventTime: string): void {
      try {
          
      // event_time e.g. "2019-03-12T20:10:00Z"
      var dateNow = this.toLocalDate(new Date());
      var dateDiff = this.getDateDiff(eventTime, dateNow);

      if (dateDiff.diffDays== 0)
      {
          this.gui.eventSpecsBox.timeToEvent = dateDiff.diffHrs + "h " +
          dateDiff.diffMins + "min";
      }
      else
      {
          this.gui.eventSpecsBox.timeToEvent = dateDiff.diffDays + "d " + dateDiff.diffHrs + "h";
      }

      if(dateDiff.diffHrs<0 || dateDiff.diffDays < 0 || dateDiff.diffMins < 0)
      {
          this.gui.eventSpecsBox.timeToEvent = "now";
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


  selectionFromParticipants(accepting: Array<any>, unsure: Array<any>, declining: Array<any>, userId:number)
    {
        if(accepting.indexOf(userId) > -1)
        {
            return "in";
        }
        if(unsure.indexOf(userId) > -1)
        {
            return "maybe";
        }
        if(declining.indexOf(userId) > -1)
        {
            return "out";
        }
        return "none";
        
    }


  /*
    This method shows or hides the tab bar based on the input variable
  */
  tabBarState(active:boolean)
  {
      if(active)
      {    
          if (this.gui.generalBox.tabBar != null) {
            this.gui.generalBox.tabBar.style.display = '';
          }
      }
      else 
      {    
          if (this.gui.generalBox.tabBar != null) {
            this.gui.generalBox.tabBar.style.display = 'none';
          }
      }
  }
  


};