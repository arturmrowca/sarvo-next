import { Component, ViewChild, ElementRef, Renderer } from '@angular/core';
import {NavController, NavParams, Platform, App, AlertController} from 'ionic-angular';
import { EventCreatePage } from "../event-create/event-create";
import { FeedbackPage } from "../feedback/feedback";
import {SarvoEvent} from "../../lib/SarvoEvent";
import {EventDetailsPage} from "../event-details/event-details";
import { EventListComponent } from '../../components/event-list/event-list';
import {TranslateService} from "@ngx-translate/core"; 
import { LoginProcessor } from '../../lib/LoginProcessor';
import { SarvoEventModel } from '../../lib/models/SarvoEventModel';
import { Loadable } from '../../lib/generic/Loadable';
import { IonicModule } from 'ionic-angular';
import { SarvoUser } from '../../lib/SarvoUser';
import { DateInformationComponentBoolean } from '../../components/date-information/date-information';
import { CalendarSynchronizer } from '../../lib/generic/calendarSynchronizer';
import { BackendFactory } from '../../lib/factory/BackendFactory';
import { SettingsSingleton } from '../../lib/SettingsSingleton';
import { GdprConsentPage } from '../gdpr-consent/gdpr-consent';
import { SignupPage } from '../signup/signup';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage extends Loadable{

    @ViewChild("plusButton", { read: ElementRef }) private plusButton: ElementRef;
    @ViewChild("feedButton", { read: ElementRef }) private feedButton: ElementRef;

  eventCreate = EventCreatePage;
  feedbackPage = FeedbackPage;
  eventPage = EventDetailsPage;

  private _eventsContent: any[] = [];
  private _dateNow: Date;
  private _navBarTitle: String; 
  public loading:boolean = true;
  private tabBar:any;
  private arrowRight:boolean = false;
  private arrowLeft:boolean = false;
  private _user: SarvoUser;
  
  
  
  @ViewChild(EventListComponent) eventListInstance: EventListComponent;
  constructor(public renderer:Renderer, public platform:Platform,  public navCtrl: NavController,
              public navParams: NavParams,
              public translate: TranslateService, public appCtrl: App, private alertCtrl: AlertController) {
    super();
    let elem = <HTMLElement>document.querySelector(".tabbar");
      if (elem != null) {
        elem.style.display = '';
      }




      /* --------------------------------------------------------------------------------
      TEEEEEEEEST
      --------------------------------------------------------------------------------*/
      this.navCtrl.setRoot(SignupPage)
      /* --------------------------------------------------------------------------------
      TEEEEEEEEST END
      --------------------------------------------------------------------------------*/
      


    // Set login processor nav Controller  
    LoginProcessor.getInstance().navCtrl = this.navCtrl; 
    var gdprDone = navParams.get('gdprDone');

    // Start Login
    //LoginProcessor.getInstance().attemptLoginProcedure();

    // set the  tabbar 
    this.tabBar = <HTMLElement>document.querySelector(".tabbar");
    this.tabBarState(false);
    this.tabBarState(true);

    // Fixed Events
    this.arrowRight = true;
    this.translate.get('HOME_PAGE.TEXTS.NAVBAR_FIXED').subscribe(
        value => {this._navBarTitle = value;});
    
    // Calendar synchronization
    if(!gdprDone)
    {
        this._initCalendar();
    }

    // LoginProcessor that ensures to end up on right page
    LoginProcessor.getInstance().setExpected(0);

  }


  tabBarState(active:boolean)
  {
      if(active)
      {    
          if (this.tabBar != null) {
            this.tabBar.style.display = '';
          }
      }
      else 
      {    
          if (this.tabBar != null) {
            this.tabBar.style.display = 'none';
          }
      }
  }
 
  ionViewDidLoad() {

        this.eventListInstance.doRefresh(null);
        
  }

  onFeedbackClicked(): void {
    this.navCtrl.push(this.feedbackPage);
  }

  ngAfterViewInit() { // or ngOnInit or whatever
      setTimeout(() => {
          this._dateNow = this.toLocalDate(new Date());
      });
      LoginProcessor.getInstance().setExpected(0);
  }

  // extract number of messages of an event to show it as preview.
  getMessages(event): number {
      return event.numMessages;
  }

  toLocalDate(date: Date): Date {
      let dateTemp = new Date(date);
      let localDate = new Date(dateTemp.getTime() - dateTemp.getTimezoneOffset()*60000);

      return localDate;
  }

  // check the status of an event for seqments.
  checkEventStatus(event, eventStatus: string): boolean {
      if (eventStatus.match("all")) {
          return true;
      } else {
          return event.organizationStatus.match(eventStatus);
      }
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

  // check if event date is on the same data as a input date.
  sameDay(event, date: Date): boolean {
      let dateDiff = this.getDateDiff(event.fixedDate, date);

      if ((dateDiff.diffYears + dateDiff.diffMonths + dateDiff.diffDayDate)==0) {
          return true;
      }
      return false;
  }

  // Calculate the difference of the current date and the activity.
  getRemainingTime(event): string {
      if (event.organizationStatus.match("pending")) {
          return 't.b.d.';
      }
      let diff = this.getDateDiff(event.fixedDate, this._dateNow);

      if (this.sameDay(event, this._dateNow) && ((diff.diffHrs < 0) || (diff.diffMins < 0))) {
          return 'ongoing';
      }

      return `${ diff.diffDays }d ${ diff.diffHrs }h ${ diff.diffMins }m`;
  }

  chosen(event: SarvoEvent)
  {
      this.navCtrl.push(this.eventPage, {eventId: event.id});
  }


  getFixedEvents(): Array<SarvoEvent> {
      let fixedEvents: Array<SarvoEvent> = [];

      for (let event of this._eventsContent) {
          if (this.checkEventStatus(event, "fixed")) {
              fixedEvents.push(event);
          }
      }
      return fixedEvents;
  }

  getNavTitle(slidesIdx: number): void {
      if (slidesIdx==0) {
          this.arrowRight = true;
          this.arrowLeft = false;
          this.translate.get("HOME_PAGE.TEXTS.NAVBAR_FIXED").subscribe((result: string) => {
              this._navBarTitle = result;
          });
      } else {
        this.arrowRight = false;
        this.arrowLeft = true;
          this.translate.get("HOME_PAGE.TEXTS.NAVBAR_PENDING").subscribe((result: string) => {
            this._navBarTitle = result;
          });
      }
  }

  onSlidesEmitted(onSlideEmitted: number) {
    this.getNavTitle(onSlideEmitted);
  }

  eventQuickCreate()
  {

    // Start an alert to ask for the description
    let alert = this.alertCtrl.create({
        title: 'Event merken: ',
        inputs: [{name: 'place', value: ""}],
        buttons: [{
            text: 'Abbruch', role: 'cancel',
            handler: data => {console.log('Cancel clicked');}},
            {
                text: 'Hinzufügen',
                handler: data => {



                // READ USER ID
                this.getDirect("curuser/id/").then((requestResponse) => {
                    let s = requestResponse["userId"];
                    var userId = parseInt(s);  
            
                    // READ CURRENT MODEL FROM GUI
                    var event = this._getCurrentEventModel(data.place, userId);
            
            
                // Send
                var message = this._eventModelToJSON(event);
                    message["invite_users"] = true; // Sends a notification to all users
            
                    // POST MODEL AND RECEIVE ID
                    var receivedEventId;
                    this.post("/event/", message).then((requestResponse) => {
                        let s = requestResponse["id"];
                        receivedEventId = parseInt(s);

                        this.eventListInstance.doRefresh(null);
                        });
                    
                    }).catch( (err) => {
                        console.log(JSON.stringify(err));
                    });
                    
                }
            }
        ]
    });
    alert.present();

    
  }

  _getCurrentEventModel(eventName:string, userId:number):SarvoEventModel
  { 

    var event = new SarvoEvent();
    event.name=eventName;
    event.organizer= userId;
    event.location="";
    event.imageBase64="";
    event.description="";
    event.organizationStatus["DATE"] = "pending";
    event.fixed_date_option_id=-1;
    event.participants=[userId];
    event.possible_dates = [];

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

  _initGDPR(val)
  {

    if(SignupPage.signedInInThisSession) // had to give his consent before
    {return;}

    SettingsSingleton.getInstance().optInVersion = val


    // CHECK VERSION ONLY 
    BackendFactory.Instance.getOpen("auth/gdprConsentVersion/").then((request_response) => {
        
        var gdprVersion = request_response["version"]
        
        // set true if I did agree already
        // VERSION USER AGREED TO: SettingsSingleton.getInstance().optInVersion
        // VERSION OF CURRENT GDPR gdprVersion
        if(SettingsSingleton.getInstance().optInVersion != gdprVersion)
        {

            // SHOW THE GDPR CONSENT PAGE 
            BackendFactory.Instance.getOpen("auth/gdprConsent/").then((request_response) => {
        
                var gdprVersion = request_response["version"]
          
                // set true if I did agree already
                // VERSION USER AGREED TO: SettingsSingleton.getInstance().optInVersion
                // VERSION OF CURRENT GDPR gdprVersion
                if(SettingsSingleton.getInstance().optInVersion != gdprVersion)
                {
                    let elem = <HTMLElement>document.querySelector(".tabbar");
                    if (elem != null) {
                        console.log("did enter " + elem.style.display);
                        elem.style.display = 'none';
                    }
                    
                    SettingsSingleton.getInstance().optInSignup = false; 
                    this.navCtrl.setRoot(GdprConsentPage);
                }
          
              }).catch((err) => {
                console.log(JSON.stringify(err));
                console.log("Unable to load GDPR Message")
              });
        }
  
      }).catch((err) => {
        console.log(JSON.stringify(err));
        console.log("Unable to load GDPR Message")
      });
  }

  _initCalendar(){
    this._user = new SarvoUser()

    this.get("curuser/full/").then((request_response) => {

      console.log("user name: -> " + request_response["name"])
      this._user.id = request_response["id"]
      this._user.model.id = request_response["id"]

      this._user.username = request_response["name"]
      this._user.model.username = request_response["name"]

      this._user.phonenumber = request_response["phonenumber"]
      this._user.model.phonenumber = request_response["phonenumber"]

      this._user.profilePictureBase64 = request_response["profilePictureBase64"]
      this._user.model.profilePictureBase64 = request_response["profilePictureBase64"]
      
      this._user.connectToCalendar = request_response["connectToCalendar"];
      this._user.model.connectToCalendar = request_response["connectToCalendar"];

      
      this._initGDPR(request_response["agreedDSGVO"]);

      // synchronize calendar
      CalendarSynchronizer.Instance.loadCalendarState(true, this._user); // on arriving on page i.e. constructor
      
    }).catch( (err) => {
      console.log(JSON.stringify(err));
    });
 

    


}

    

}
