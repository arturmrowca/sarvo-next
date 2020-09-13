import { Calendar } from '@ionic-native/calendar';
import { Loadable } from './Loadable';
import { SarvoUser } from '../SarvoUser';
import { Utility } from '../../components/utility';

/*
  This class holds all control of the synchronization of events to the users 
  calendar

  The calendar will be updated in four cases (i.e. run )
    (1) on app start - reading fixed from server 
        o CalendarSynchronizer.Instance.loadCalendarState(); // on arriving on home
        o CalendarSynchronizer.Instance.runCalendarSynchronization(this.currentSarvoUser); // on loading events
        o the latter stores it to native storage
    (2) on changing an event to fixed
        o CalendarSynchronizer.Instance.loadCalendarState(); // on arriving on page i.e. constructor
        o CalendarSynchronizer.Instance.runCalendarSynchronization(this.currentSarvoUser); // on change to fixed
        o the latter stores it to native storage
    (3) on changing an event to unfix
        o CalendarSynchronizer.Instance.loadCalendarState(); // on arriving on page i.e. constructor
        o CalendarSynchronizer.Instance.runCalendarSynchronization(this.currentSarvoUser); // on change to fixed
        o the latter stores it to native storage
    (4) on first activation (i.e. pressing profile page save) 
        o CalendarSynchronizer.Instance.loadCalendarState(); // on arriving on page i.e. constructor
        o CalendarSynchronizer.Instance.runCalendarSynchronization(this.currentSarvoUser); // on save pressed
        o the latter stores it to native storage
*/
export class CalendarSynchronizer extends Loadable{

  private static _instance: CalendarSynchronizer;
  public listOfAvailableCalendars: Array<any> = []; // List of calendars that can be chosen
  public selectedCalendarId: number; // Identifier of calendar to sync with
  public storedCalendarIds: Map<number, string> = new Map<number, string>(); // Mapping: key: event id stored in calendar value: according calendar event id
  public storedCalendarIdsArray: Array<string> = []
  public storedEventIdsArray: Array<number> = []
  public storedEventInformation: Map<number, string> = new Map<number, string>(); // key:eventId, value: startzeit, titel, location - if changed update

  private _sarvoUser:SarvoUser = null; // Instance of the current sarvo user 

  constructor() {super();}

  /**
   * used for getting an instance of the single, usage like
   * `const fac = BackendFactory.Instance;`
   * @constructor
   */
  public static get Instance() {
    // Do you need arguments? Make it a regular method instead.
    return this._instance || (this._instance = new this());
  }

  /*
    Called on activation of the calendar synchronization
      - reads a list of calendars and stores those
      - this is used as basis to set the calendar in setCalendarIds, which is the calendar to use for sync
  */
  onActivatedSynchronization()
  {
    // Get all calendars - ask user which one to use
    var success = function(message) 
    { 
      // here the read calendars are shown 
      CalendarSynchronizer.Instance.listOfAvailableCalendars = message; 
    };

    // List all calendars in callback
    var error = function(message) { alert("Error: " + message); };
    window['plugins'].calendar.listCalendars(success, error);
  }

  /*
    Called on deactivation of the calendar synchronization
      - removes all sarvo events from the calendar 
  */
  onDeactivatedSynchronization(sarvoUser: SarvoUser)
  {
    // Iterate all calendar ids that are stored
    var fromDate = new Date(1999,11,16,15,30,0,0);
    var success = function(message) {};
    var error = function(message) {};

    // Drop those calendar Ids
    var els = CalendarSynchronizer.Instance.storedCalendarIdsArray;
    for(let calendarId of els) {
      window["plugins"].calendar.deleteEventById(calendarId, fromDate, success, error);
      this.deleteEventStorage(calendarId);
    }

    // Store new state to backend
    CalendarSynchronizer.Instance.storeCalendarState(sarvoUser);
  }


  /*
    Updates all calendar ids such that calendar events and event ids are consistent
    - needs to be done in recursive manner because typescript sucks
  */
  updateEvents(calendarId: number, sarvoUser:SarvoUser)
  {
    

    console.log("Run calendar synchronization...")

    // Load information from server and synchronize 
    var fixedEvents = {};
    var fixedEventIds = [];
    this.getDirect("curuser/event/full/").then((requestResponse) => {

      // 1. Load fixed Events
      for (let eventDetails of requestResponse as any[])
      { 
        if (eventDetails["organization_status"]["DATE"].match("fixed"))
        { 
          fixedEvents[+eventDetails["id"]] = {name:eventDetails["name"], location:eventDetails["location"], description:eventDetails["description"], fixedDate:eventDetails["fixed_date"]};
          fixedEventIds.push(+eventDetails["id"]);
        }
      }  

      // 2. Iterate event ids in map
      var fromDate = new Date(1999,11,16,15,30,0,0);
      var successX = function(message) {};
      var errorX = function(message) {};
      var i = 0;
      while(i < CalendarSynchronizer.Instance.storedEventIdsArray.length)
      {
        var eventId =  CalendarSynchronizer.Instance.storedEventIdsArray[i];
        var calendarId = CalendarSynchronizer.Instance.storedCalendarIds[eventId];
        
        // If not eventId in fixed from server - remove it from calendar
        if (fixedEventIds.indexOf(eventId) === -1)
        {
          window["plugins"].calendar.deleteEventById(calendarId, fromDate, successX, errorX);
          this.deleteEventStorage(calendarId);
        }
        i += 1;
      }



      // 3. Iterate fixed eventIds and update or add those if not there
      var i = 0;
      CalendarSynchronizer.Instance._sarvoUser = sarvoUser; // set the current sarvo user
      CalendarSynchronizer.Instance._updateEventsRecursive(fixedEventIds, calendarId, fixedEvents, i);

    }).catch( (err) => {
      console.log(JSON.stringify(err));
    });
  }

  /**
   * Iterate all fixedEventIds in a recursive manner, as typescript is asynchronous fuck
   */
  _updateEventsRecursive(fixedEventIds: Array<any>, calendarId, fixedEvents, i: number)
  {
      // Stop recursion + read next event identifier
      if(fixedEventIds.length <= i)
      {
        // on last iteration store calendar state
        CalendarSynchronizer.Instance.storeCalendarState(CalendarSynchronizer.Instance._sarvoUser);
        return;
      }

      // Process next element
      var fixedEventId = fixedEventIds[i]

      // If not existing in calendar create this event
      if (CalendarSynchronizer.Instance.storedEventIdsArray.indexOf(fixedEventId) === -1)
      {
        // Create this event and add it to the calendar
        var calOptions2 = window["plugins"].calendar.getCalendarOptions(); 
        calOptions2.calendarId = calendarId;//ACHTUNG - IOS HIER ANDERS calOptions.calendarName = "MyCreatedCalendar"; // iOS only
        var event = fixedEvents[fixedEventId];

        var all = event.fixedDate.split("T");
        var dateElements = all[0].split("-");
        var year = +dateElements[0];
        var month = +dateElements[1] - 1;
        var day = +dateElements[2];
        var hour = +all[1].substr(0,2);
        var minute = +all[1].substr(3,2);
        var startDate = new Date(year, month, day, hour, minute,0,0); // beware: month 0 = january, 11 = december
        var endDate = new Date(year, month, day, hour + 1, minute,0,0);
        var title = event.name + " (S'arvo)";
        var eventLocation = event.location;
        var notes = event.description;

        // Create event using library
        var successY = function(message) { // Callback when calendar entry created

          // Add information to storage
          CalendarSynchronizer.Instance.createEventStorage(message, fixedEventId, title, eventLocation, event.fixedDate); 

          // next iteration
          CalendarSynchronizer.Instance._updateEventsRecursive(fixedEventIds, calendarId, fixedEvents, i + 1);
        };
        var errorY = function(message) { alert("Error: " + message); };
        window["plugins"].calendar.createEventWithOptions(title, eventLocation, notes, startDate, endDate, calOptions2, successY, errorY);
      
      }

      // if event is existing update its information
      else 
      {
        // Check if it changed
        var event = fixedEvents[fixedEventId];
        var currentIdentifier = event.name + " (S'arvo)" + event.location + event.fixedDate;

        // If so update it
        if(currentIdentifier !== CalendarSynchronizer.Instance.storedEventInformation[fixedEventId])
        {
          // Do update i.e. delete old and add new
          // Delete event with this event id then create with new information
          var successXX = function(message) {   
            // Create event with new information
          var calOptions2 = window["plugins"].calendar.getCalendarOptions(); 
          calOptions2.calendarId = calendarId;//ACHTUNG - IOS HIER ANDERS calOptions.calendarName = "MyCreatedCalendar"; // iOS only
          var event = fixedEvents[fixedEventId];
          var all = event.fixedDate.split("T");
          var dateElements = all[0].split("-");
          var year = +dateElements[0];
          var month = +dateElements[1] - 1;
          var day = +dateElements[2];
          var hour = +all[1].substr(0,2);
          var minute = +all[1].substr(3,2);
          var startDate = new Date(year, month, day, hour, minute, 0, 0); // beware: month 0 = january, 11 = december
          var endDate = new Date(year, month, day, hour + 1, minute, 0, 0);
          var title = event.name + " (S'arvo)";
          var eventLocation = event.location;
          var notes = event.description;
          var successY = function(message) { // Callback when calendar entry created

            // Add information to storage
            CalendarSynchronizer.Instance.createEventStorage(message, fixedEventId, title, eventLocation, event.fixedDate); 

            // next iteration
            CalendarSynchronizer.Instance._updateEventsRecursive(fixedEventIds, calendarId, fixedEvents, i + 1);
          };
          var errorY = function(message) {};
          window["plugins"].calendar.createEventWithOptions(title, eventLocation, notes, startDate, endDate, calOptions2, successY, errorY);
          };

          // Here deletion happens - the callback does subsequent continuation
          var errorXX = function(message) {
            console.log(message);
          };
          var fromDate = new Date(1999,11,16,15,30,0,0);
          var calendarElementId = CalendarSynchronizer.Instance.storedCalendarIds[fixedEventId];
          this.deleteEventStorage(calendarElementId);             
          window["plugins"].calendar.deleteEventById(calendarElementId, fromDate, successXX, errorXX);

        }
        else
        {
          // continue iteration
          CalendarSynchronizer.Instance._updateEventsRecursive(fixedEventIds, calendarId, fixedEvents, i + 1);
        }
      }
  }


  /* 
    Set the selected calendar
  */
  setSelectedCalendarId(id: number)
  {
    this.selectedCalendarId = id;
  }

  /**
   * Runs the calendar synchronization
   */
  runCalendarSynchronization(sarvoUser: SarvoUser)
  {
    // synchronizes all fixed events with the chosen calendar 
    if (CalendarSynchronizer.Instance.selectedCalendarId > -1 && sarvoUser.connectToCalendar)
    {
      this.updateEvents(CalendarSynchronizer.Instance.selectedCalendarId, sarvoUser);
    }
  }

  /**
   * Store created event + modification of according lists
   */
  createEventStorage(calendarId:string, fixedEventId, title:string, location:string, startDate:string)
  {
    CalendarSynchronizer.Instance.storedCalendarIdsArray.push(calendarId);
    CalendarSynchronizer.Instance.storedEventIdsArray.push(fixedEventId);
    CalendarSynchronizer.Instance.storedCalendarIds[fixedEventId] = calendarId; 
    CalendarSynchronizer.Instance.storedEventInformation[fixedEventId] = title+location+startDate
  }

  /**
   * Modify lists for deleted an event + modification of according lists
   */
  deleteEventStorage(calendarId:string)
  {
    var eventId = this.getByValue(CalendarSynchronizer.Instance.storedCalendarIds, CalendarSynchronizer.Instance.storedEventIdsArray, calendarId);
    
    try {
    CalendarSynchronizer.Instance.storedCalendarIdsArray = CalendarSynchronizer.Instance.storedCalendarIdsArray.filter(obj => obj !== calendarId);
    CalendarSynchronizer.Instance.storedEventIdsArray = CalendarSynchronizer.Instance.storedEventIdsArray.filter(obj => obj !== eventId);
    delete CalendarSynchronizer.Instance.storedCalendarIds[eventId];
    delete CalendarSynchronizer.Instance.storedEventInformation[eventId];
    
  } catch (error) {
      
  }
  }

  /**
   * Helper function to get value by key
   * @param map 
   * @param searchValue 
   */
  getByValue(map: Map<any, any>, keyList,  searchValue) {

    for(let key of keyList) {
      var value = map[key];
      if (value === searchValue)
        return key; 
   }
    return null;
  }


  /**
   * Stores all calendar relevant information to the backend
   */
  storeCalendarState(sarvoUser:SarvoUser)
  {
    // Store to SarvoUser 
    sarvoUser.postCurrentUserProperties(["connectToCalendar"]);

    // Store the associated calendar information to native storage
    var content: Array<any> = []
    content.push(CalendarSynchronizer.Instance.selectedCalendarId);
    content.push(CalendarSynchronizer.Instance.storedCalendarIds);
    content.push(CalendarSynchronizer.Instance.storedCalendarIdsArray);
    content.push(CalendarSynchronizer.Instance.storedEventIdsArray);
    content.push(CalendarSynchronizer.Instance.storedEventInformation);

    Utility.nativeStorage.setItem("sarvoUserCalendarSynchronizersInformation", JSON.stringify(content)).then(() => {
      console.log('Stored Calendar Information!'); 
    },
      error => console.error('Error storing item', error)
    );
  }

  /**
   * Reads all calendar relevant information from the backend
   */
  loadCalendarState(alsoSync:boolean, user:SarvoUser)
  {
    // sarvoUser should be already loaded
    // If connected to calendar read the according calendar information from native storage
    try {
    
      Utility.nativeStorage.getItem("sarvoUserCalendarSynchronizersInformation").then(contentIn => {

      var content = JSON.parse(contentIn);
      CalendarSynchronizer.Instance.selectedCalendarId = content[0] as number;
      CalendarSynchronizer.Instance.storedCalendarIdsArray = content[2] as string[];
      CalendarSynchronizer.Instance.storedEventIdsArray = content[3] as number[];

      // Map load
      var m = content[1];
      CalendarSynchronizer.Instance.storedCalendarIds = new Map<number, string>();
      var i = 0;
      while(i < CalendarSynchronizer.Instance.storedEventIdsArray.length)
      {
        CalendarSynchronizer.Instance.storedCalendarIds[CalendarSynchronizer.Instance.storedEventIdsArray[i]] = m[CalendarSynchronizer.Instance.storedEventIdsArray[i]]
        i += 1;
      }

      // Map 2 load
      var m = content[4];
      CalendarSynchronizer.Instance.storedEventInformation = new Map<number, string>();
      var i = 0;
      while(i < CalendarSynchronizer.Instance.storedEventIdsArray.length)
      { 
        CalendarSynchronizer.Instance.storedEventInformation[CalendarSynchronizer.Instance.storedEventIdsArray[i]] = m[CalendarSynchronizer.Instance.storedEventIdsArray[i]]
        i += 1;
      }

      // synchronize if boolean set
      if(alsoSync)
      {
        CalendarSynchronizer.Instance.runCalendarSynchronization(user);
      }

      },
      error =>{});

    } catch (error) {
      
    }
    

    // If not connected to calendar all of the above are empty - which happens in constructor
   

  }

}
