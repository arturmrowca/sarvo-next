import {Component, IterableDiffers, KeyValueDiffer, KeyValueDiffers, Renderer, ElementRef} from '@angular/core';
import {IonicPage, NavController, NavParams, AlertController} from 'ionic-angular';
import {GroupsOverviewPage} from '../groups-overview/groups-overview';
import {Loadable} from "../../lib/generic/Loadable";
import {SarvoUser} from "../../lib/SarvoUser";
import {SarvoGroup} from "../../lib/SarvoGroup";
import {EventMgmtAttendPage} from "../event-mgmt-attend/event-mgmt-attend";
import {EventListComponent} from "../../components/event-list/event-list";
import {ManageGroups} from "../../lib/ManageGroups";
import {SarvoEvent} from "../../lib/SarvoEvent";
import {Utility} from "../../components/utility";
import {ViewChild } from '@angular/core';
import { HomePage } from '../home/home';
import {Platform} from "ionic-angular";
import { SettingsSingleton } from '../../lib/SettingsSingleton';
import {BackendFactory} from '../../lib/factory/BackendFactory';
import {EventDetailsPageView} from  '../event-details/lib/view';
import {TranslateService} from "@ngx-translate/core"; 
import { IonicModule } from 'ionic-angular';
import { CalendarSynchronizer } from '../../lib/generic/calendarSynchronizer';
import { Clipboard } from '@ionic-native/clipboard';
import { interval } from 'rxjs/observable/interval';
import { Observable } from 'rxjs';


@IonicPage()
@Component({
    selector: 'page-event-details',
    templateUrl: 'event-details.html',
})
export class EventDetailsPage extends Loadable {

    @ViewChild('mainIonContent', {read:ElementRef}) mainIonContent;
    @ViewChild('acceptFixIcon', {read:ElementRef}) acceptFixIcon;
    @ViewChild('maybeFixIcon', {read:ElementRef}) maybeFixIcon;
    @ViewChild('denyFixIcon', {read:ElementRef}) denyFixIcon; 
    
    

    // General Information
    private _event: SarvoEvent;
    private _user: SarvoUser;
    private _storeTargetGroup: boolean; // if true stores target groups to backend and loads its  
    private _organizerName: string;
    private _swipeText: string;
    
    // Pages
    groupPage = GroupsOverviewPage;
    eventMgmtAttend = EventMgmtAttendPage;
    homePage = HomePage;


    private _attendOptions: Array<any>; // Options, who is attending: In, Out, Unsure 


    // Contacts Module
    private _targetContacts: Array<SarvoUser>; // Invited Contacts
    private _myGroups: Array<SarvoGroup>; // Required for Invitation
    private _targetGroup: Array<SarvoGroup>; // Invited Groups

    // Helper Modules
    private differ: IterableDiffers;
    private kvDiffer: KeyValueDiffer<string, any>;
    private kvDiffer2: KeyValueDiffer<string, any>;
    private isVisible: boolean = false;
    private _receivedGroupIds: number[];
    private _firstLoad: boolean = true; 
    private _dateOptionsDropdown: Array<object>; // List of dates as strings
    private _previousContactIds: Array <number> = [];
    public _previousContacts:Array<SarvoUser>;
    private descriptionEditingActive:boolean;
 
    private eventView:EventDetailsPageView; // This module holds view modifications 

    constructor(public renderer:Renderer, private kvDiffers: KeyValueDiffers,
                public navCtrl: NavController, public navParams: NavParams,
                private alertCtrl: AlertController, private differs: IterableDiffers,
                public platform: Platform, public translate: TranslateService, 
                private clipboard:Clipboard) {
        
        super();

        // Submodules 
        this.eventView = new EventDetailsPageView();
        this.eventView.initializeView(<HTMLElement>document.querySelector(".tabbar"));        
    
        this.translate.get('EVENT_DETAILS.LABELS.EVENT_SWIPE_CHAT').subscribe(
            value => {this._swipeText = value;});

        // Differ
        this.differ = differs;
        this.kvDiffer = this.kvDiffers.find({}).create();
        this.kvDiffer2 = this.kvDiffers.find({}).create();

        // Object information
        this._user = new SarvoUser(); 
        this._event = new SarvoEvent();
        this._event.id = navParams.get('eventId');
        this._storeTargetGroup = false;  // if true stores chosen groups to backend
        this.descriptionEditingActive = false; // if active description can be edited
 
        // Initialize Components
        this._attendOptions = []; 
        this._dateOptionsDropdown = [];
        //this._fixedAttendOption = {date: '', nrIn: 0, nrOut: 0, nrUnsure: 0, contacts: []};

        // initialize from prev. Screen and server
        this._targetContacts = []; // Invited Contacts
        this._targetGroup = []; // Invited Contacts
        var cameFromEventCreate = false;


        try {
            var contact = navParams.get("targetContacts"); // Invited Contacts
            var group = navParams.get("targetGroups"); // Invited Contacts
            
            if (contact != undefined)
                this._targetContacts = contact
            if (group != undefined)
                this._targetGroup = group

            var fromPrevPage = navParams.get("createPage");
            if (fromPrevPage != undefined)
                cameFromEventCreate = fromPrevPage;
        }
        catch (e) {
            this._targetContacts = []; // Invited Contacts
            this._targetGroup = []; // Invited Contacts
        } 
        this._load_from_server(this._event.id, cameFromEventCreate);


        // Android Back button pressed
        platform.registerBackButtonAction(() => { 
            this.backToHome();
        });

    }

    /*  ----------------------------------------------------------
            CLICK EVENTS
        ---------------------------------------------------------- */

    _changeFixedDateClose()
    {
        if(this.eventView.options.changeFixedDateExpanded)
        {

        // Schliessen der Auswahl
        // start an alert asking to change the date if yes send
        let alert = this.alertCtrl.create({
            title: 'Wollen Sie das Datum ändern? Achtung: Zu/Absagen dadurch ungenau.',
            buttons: [{
                text: 'Nein', role: 'cancel',
                handler: data => {
                    console.log('Cancel clicked');
                    // Hide expansion 
                    this.eventView.options.changeFixedDateExpanded = false
                }},
                {
                    text: 'Ja',
                    handler: data => {
                        this._setFixedDateSelect();
                    }
                }
            ]
        });
        alert.present();
    
    }
    // enable date selection
    else
    {
        this.eventView.gui.eventSpecsBox.changeFixedDateChosen = this.eventView.gui.eventSpecsBox.fixedAttendOption.date
        this.eventView.options.changeFixedDateExpanded = true;
    }
    }

    _setFixedDateSelect()
    {

            // Change fixed attend option to selection
            //this.eventView.gui.eventSpecsBox.changeFixedDateChosen
            // Hide expansion 
            this.eventView.options.changeFixedDateExpanded = false


        // Change GUI
        var messageEntry = {};
        messageEntry["date"] = this.eventView.gui.eventSpecsBox.changeFixedDateChosen
        this.eventView.gui.eventSpecsBox.fixedAttendOption.date = this.eventView.gui.eventSpecsBox.changeFixedDateChosen
        var message = messageEntry

        // Update change in event object
        this._event.fixedDate = this.eventView.gui.eventSpecsBox.fixedAttendOption.date
        var message2 = {}
        message2["fixedDateOnly"] = this._event.fixedDate
        this.eventView.set_time_diff(this._event.fixedDate);
        this.post("/event/" + this._event.id + "/", message2).then((request_response) => {

            // after setting it fixed synchronize calendar
            CalendarSynchronizer.Instance.loadCalendarState(true, this._user); 

        }).catch((err) => {
          console.log(JSON.stringify(err));
        });

        // Post change in dateto server
        this.post("/dateoption/" +  this._event.fixed_date_option_id + "/", message).then((request_response) => {
            console.log(request_response)
            
            // GO TO EVENT DETAIL PAGE
        }).catch((err) => {
            console.log(JSON.stringify(err));
        }); 
    }

    _changeFixedDateClicked()
    {
        if(!this.eventView.options.fixedDate)
        {
            return;
        }
        this.eventView.gui.eventSpecsBox.changeFixedDateChosen = this._event.fixedDate
        this.eventView.options.changeFixedDateExpanded = !this.eventView.options.changeFixedDateExpanded;
        
    }

    _fixedShowDetailsClicked()
    {
        this.eventView.gui.generalBox.dateDetailsShowOverlay.value = true;
        this.eventView.options.overlayActive = true;

        // show fixed attend option
        this.getDirect("dateoption/" + this.eventView.gui.eventSpecsBox.fixedAttendOption.id.toString() + "/").then((requestResponse) => {
            var acc_names = requestResponse["acc_participants"]
            var maybe_names = requestResponse["inter_participants"]
            var dec_names = requestResponse["dec_participants"] 

            this.eventView.showAttendOptionParticipants(this.eventView.gui.eventSpecsBox.fixedAttendOption, acc_names, maybe_names, dec_names);
        });
    }

    _editButtonClicked(){
       this.eventView.changeEditMode();
    }

    openDateVoteClicked()
    {
        this.eventView.dateVoteOverlayMode(true);
    }

    openAddSetOptionsClicked()
    {
        this.eventView.addOptionsOverlayMode(true);
    }

    _changeImageFromCamera() : void { 

        // Set Image Camera 
        Utility.imagePicker.getPhoto(1).then((imageDataRaw) => { 
        
            Utility.imagePicker.compress('data:image/jpeg;base64,' + imageDataRaw).then((imageData: string) => 
            {

            // Upsert the setting
            this._event.imageBase64 =  imageData;
            // set this image
            //this.renderer.setElementStyle(this.mainIonContent.nativeElement, 'background-image', "url('"+ this._event.imageBase64 +"')");

            this._event.postEventProperties(["imageBase64"])
        }, (err) => {});
    }, (err) => {}); 
    }

    _changeImageFromGallery() : void { 

        // Set Image Camera 
        Utility.imagePicker.getPhoto(0).then((imageDataRaw) => { 
        
            Utility.imagePicker.compress('data:image/jpeg;base64,' + imageDataRaw).then((imageData: string) => 
            {

            // Upsert the setting
            this._event.imageBase64 =  imageData;
            // set this image
            //this.renderer.setElementStyle(this.mainIonContent.nativeElement, 'background-image', "url('"+ this._event.imageBase64 +"')");

            this._event.postEventProperties(["imageBase64"])
        }, (err) => {});
    }, (err) => {}); 
    }

    openInGmapsClicked(): void {
        var link = "https://maps.google.com/?q=" + this._event.location
        if (this.platform.is("android")) {
            window.open(link, '_system', 'location=yes');}
        else {
            window.open("maps://?q=" + this._event.location, '_system');
        }
    }

    addFriendClicked(targetContacts: Array<SarvoUser>, myGroups: Array<SarvoGroup>, targetGroup: Array<SarvoGroup>): void {
        
        // Store a list of user ids before pushing 
        this._previousContactIds =  [];
        this._previousContacts = [];
        targetContacts.forEach((element:SarvoUser) => {
            this._previousContactIds.push(element.id);
            this._previousContacts.push(element);
        });

        // Non-admins are only allowed to add users (no kicking - only by admin)
        // Called on Add Friend clicked -> opens the attendance manager
        this.navCtrl.push(this.eventMgmtAttend, {
            targetContacts: targetContacts,
            myGroups: myGroups,
            targetGroup: this._targetGroup
        });
    }

    linkify(inputText) {
        //URLs starting with http://, https://, or ftp://
        var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
        var replacedText = inputText.replace(replacePattern1, '<a href="$1">$1</a>');
    
        //URLs starting with www. (without // before it, or it'd re-link the ones done above)
        var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        var replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2">$2</a>');
    
        //Change email addresses to mailto:: links
        var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
        var replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
    
        return replacedText
    }
    /*
    On click on change description Button a dialog appears and results are pushed to server
     */
    changeDescriptionClicked(): void {

        // open ion text area
        if(!this.descriptionEditingActive)
        {
            this.descriptionEditingActive = true;
            this._event.description = this._event.description.replace(/<a[^>]* href="([^"]*)">/g, "").replace("</a>", "")
 
            this._event.description = this._event.description.replace(/<br\s?\/?>/g,"\n");

            this._event.description = this._event.description.replace("</a>", "")
        }
        else
        {
            // store
            this.descriptionEditingActive = false;
            this._event.description = this.linkify(this._event.description)
            this._event.description = this._event.description.replace(/\r\n|\r|\n/g,"<br />")
            

            this.eventView.setDescription(this._event.description);

            // Upsert
            this._event.postEventProperties(["description"]);
        }
        // Start an alert to ask for the description
        /*let alert = this.alertCtrl.create({
            title: 'Beschreibung: ',

            inputs: [{name: 'place', value: this._event.description,}],
            buttons: [{
                text: 'Abbruch', role: 'cancel',
                handler: data => {console.log('Cancel clicked');}},
                {
                    text: 'OK',
                    handler: data => {

                        // Store to GUI
                        this._event.description = data.place;
                        console.log("Desc" + this._event.description);
                        this.eventView.setDescription(this._event.description);

                        // Upsert
                        this._event.postEventProperties(["description"]);
                    }
                }
            ]
        });
        alert.present();*/
    }

    /*
    On click on change description Button a dialog appears and results are pushed to server
     */
    changeNameClicked(): void {
        let alert = this.alertCtrl.create({
            title: 'Event Name: ',
            inputs: [{name: 'place', value: this._event.name,}],
            buttons: [{
                text: 'Abbruch', role: 'cancel',
                handler: data => {
                    console.log('Cancel clicked');
                }
            },
                {
                    text: 'OK',
                    handler: data => {
                        // Log and store 
                        this._event.name = data.place;
                        this._event.postEventProperties(["name"]);
                    }
                }
            ]
        });
        alert.present();
    }

    /*
    Deletes the event entirely if clicked
    */
    deleteEventClicked():void
    {
        let alert = this.alertCtrl.create({
            title: 'Möchtest du die Veranstaltung wirklich löschen?',
            buttons: [
                {
                    text: 'Ja',
                    handler: () => {
                        this._event.postDelete(this._event.id);
                        alert.dismiss(true);
                        this.navCtrl.setRoot(this.homePage);
                        return false;
                    }
                }, {
                    text: 'Nein',
                    handler: () => {
                        alert.dismiss(false);
                        return false;
                    }
                }
            ]
        });
        alert.present();
    }

    /*
    On click current user can exit the event
     */
    leaveEventClicked():void
    {
        let alert = this.alertCtrl.create({
            title: 'Möchtest du wirklich aus der Veranstaltung austreten?',
            buttons: [
                {
                    text: 'Ja',
                    handler: () => {
                        alert.dismiss(true);
                        this._event.participants = this._event.participants.filter(item => item !== this._user.id);
                        this._event.postEventProperties(["participants"]);
                        this.navCtrl.setRoot(this.homePage);
                        return false;
                    }
                }, {
                    text: 'Nein',
                    handler: () => {
                        alert.dismiss(false);
                        return false;
                    }
                }
            ]
        });
        alert.present();
    }

    /*
    On click on change Location Button a dialog appears and results are pushed to server
     */
    changeLocationClicked(): void {
        let alert = this.alertCtrl.create({
            title: 'Veranstaltungsort: ',
            inputs: [{name: 'place', value: this._event.location}],
            buttons: [{text: 'Abbruch', role: 'cancel', handler: data => {console.log('Cancel clicked');}
            },
                {
                    text: 'OK',
                    handler: data => {

                        // Log and store
                        this._event.location = data.place;

                        // Upsert
                        this._event.postEventProperties(["location"]);
                    }
                }
            ]
        });
        alert.present();
    }

    /*
    On click on accept if fixed event
     */
    acceptOnFixedClicked(attendOption: any)
    {
        console.log("accept pressed")
        this.renderer.setElementStyle(this.acceptFixIcon.nativeElement, 'color', "#1c3144");
        this.renderer.setElementStyle(this.maybeFixIcon.nativeElement, 'color', "gray");
        this.renderer.setElementStyle(this.denyFixIcon.nativeElement, 'color', "gray");

        this.attendOptionInClicked(attendOption);

    }

    /*
    On click on accept if fixed event
     */
    maybeOnFixedClicked(attendOption: any)
    {
        console.log("maybe pressed")
        this.renderer.setElementStyle(this.acceptFixIcon.nativeElement, 'color', "gray");
        this.renderer.setElementStyle(this.maybeFixIcon.nativeElement, 'color', "#1c3144");
        this.renderer.setElementStyle(this.denyFixIcon.nativeElement, 'color', "gray");
        this.attendOptionUnsureClicked(attendOption);
    }

    /*
    On click on accept if fixed event
     */
    denyOnFixedClicked(attendOption: any)
    {
        console.log("deny pressed")
        this.renderer.setElementStyle(this.acceptFixIcon.nativeElement, 'color', "gray");
        this.renderer.setElementStyle(this.maybeFixIcon.nativeElement, 'color', "gray");
        this.renderer.setElementStyle(this.denyFixIcon.nativeElement, 'color', "#1c3144");
        this.attendOptionOutClicked(attendOption);
    }


    /*  ----------------------------------------------------------
            ON ENTER/LEAVE/REGULAR 
        ---------------------------------------------------------- */
    /*
        Show tab bar on page leaving 
    */
   ionViewDidLeave()
   {
       this.eventView.tabBarState(true); 

   }

   /*
       Hide tab bar on page entering 
   */
   ionViewWillEnter()
   {
       this.eventView.tabBarState(false);

   }

   

   /*  ----------------------------------------------------------
            TRANSLATE INPUT IN HTML
        ---------------------------------------------------------- */

   _verifyStartTimeString(input:string)
   {
       if (input.length == 0)
       {
           return "t.b.d.";
       }
       return input;
   }

   _verifyStartFixedDateString(input:string)
   {
       if (input.length == 0 || input.match("reset") !== null)
       {
           return "...";
       }
       var date = this._dateExtractString(input);
       var time = this._timeExtractString(input);
       return date + " " + time;
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

    _verifyLocationString(input:string)
    {
        if (input.length == 0)
        {
            return "Noch unklar";
        }
        return input;
    }
    
    ngAfterContentChecked(): void
    {

        if (this.isVisible == false && this.navCtrl.getActive().component.name == "EventDetailsPage")
        { 
            this.isVisible = true;

            // read events if changed
            this._targetContactsOnChange();
        }
        else if (this.isVisible == true && this.navCtrl.getActive().component.name != "EventDetailsPage")
        {
            
            // load group from server
            if(this._storeTargetGroup)
            {
                for(let group of this._myGroups)
                {
                    if(this._receivedGroupIds.indexOf(group.id) > -1 && !(this._targetGroup.indexOf(group) > -1))
                        this._targetGroup.push(group);
                }
            }

            console.log('isVisible switched from true to false');
            this.isVisible = false;
        }
    }

    backToHome()
    { 
        if (this.eventView.options.overlayActive)
        {
            // go back to main screen 
            this.eventView.options.overlayActive = false;
            this.eventView.options.chooseOptionsActive = false;
            this.eventView.options.addOptionsActive = false;
            this.eventView.gui.generalBox.dateDetailsShowOverlay.value = false;
        }
        else
        {   
            this.navCtrl.setRoot(HomePage);            
        }
    }

    /* Returns if there are non-sarvo users 
     */
    hasNonSarvoContacts()
    {
        let l = this._targetContacts.filter((item) => {
            if (item.isRegistered || item.id == this._user.id  || item.username.indexOf("Invited User") != -1 ) {
              return false
            }
            return true
          }).length

        if(l>0)
        {
            return true;
        }
        else
        {
            return false;
        }

    }

    /*
    This method monitors target variables and allows to run a callback
    on change of this variable
    */
    ngDoCheck() {
        try {
            this.renderer.setElementStyle(this.mainIonContent.nativeElement, 'background-image', "url('"+ this._event.imageBase64 +"')");
      

        } catch (error) {
            
        }
      
        try {
            if(this.eventView.gui.eventSpecsBox.fixedAttendOption.fixedSelection == "fixed")
            {
                this.setFixedAttendOptionColor(this.eventView.gui.eventSpecsBox.fixedAttendOption.selection);
            }
       
            
        } catch (error) {
            
        }


        // If date option selection changed
        const dateOptionAddChanged = this.kvDiffer.diff({"variable": this.eventView.gui.eventSpecsBox.addDateChosen});
        if (dateOptionAddChanged) {
            this._dateOptionChosen();
        }

        const dateInformationChanged = this.kvDiffer2.diff({"variable": this.eventView.gui.generalBox.dateDetailsShowOverlay.value});
        if (dateInformationChanged) {
            if(!this.eventView.gui.generalBox.dateDetailsShowOverlay.value)
            {
                this.eventView.options.overlayActive = false;
            }
        } 
    }
     
    /*
    Called when a date selection was made
     */
    _dateOptionChosen(): void{
        if(this._user.id==-1)
            return;
        
        this.eventView.options.addOptionClicked = false; 

        // POST TO SERVER
        var message = [];
        var messageEntry = {};
        messageEntry["date"] = this.eventView.gui.eventSpecsBox.addDateChosen;
        messageEntry["acc_participants"] = [this._user.id];
        messageEntry["inter_participants"] = [];
        messageEntry["dec_participants"] = [];
        message.push(messageEntry);

        // ADD NEW ENTRY TO SERVER AND UPDATE VIEW
        this.post("/event/" + this._event.id + "/dateoptions/", message).then((request_response) => {
            let elem = request_response["ids"] as any;
            let recId = parseInt(elem[0]);
            
            
            let element = {
                id: recId,
                userIn: true,
                userOut: false,
                userUnsure: false,
                date: this.eventView.gui.eventSpecsBox.addDateChosen,
                nrIn: 1,
                nrOut: 0,
                nrUnsure: 0,
                contacts: [],
                selection: "in"
            };
            this._attendOptions.push(element); 

            // GO TO EVENT DETAIL PAGE
        }).catch((err) => {
            console.log(JSON.stringify(err));
        }); 
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
            bf.post('/invite/', options)
            .then((obj) => {
                console.log("user invited");
                console.log(phoneNumber1)
                resolve(true);
            })
            .catch((err: any) => {
                console.log("user invite failed");
                reject(false);
            });
        });
      }

      /*
      If a non admin user tried to remove users from the event a violation is detected
      and the action is forbidden
      */
      _openAlertTargetContactDidNotChange()
      {
        
        let alert = this.alertCtrl.create({
            title: 'Information:',
            subTitle: 'Du hast versucht Leute aus der Veranstaltung zu entfernen. Um Leute zu entfernen wende dich an den Organisator der Veranstaltung. Neue Leute wurden aber hinzugefügt.',
            buttons: [
                {
                    text: 'OK',
                    handler: data => {
                        
                    }
                }
            ]
        });
        alert.present();

      }


    /*
    If the target Contacts Variable changes this method is called and
    sets the current users to the participants list
    Happens after contacts selection component was called
     */
    _targetContactsOnChange(): void {

        // Read Ids
        var newList = [];
        for (let sarvoUser of this._targetContacts) {
            if (sarvoUser.id != -1)
            newList.push(sarvoUser.id);
        }

        // previous Ids -> if I am admin everything allows
        // if not admin -> check if this action was allowed
        if (!this.eventView.options.admin)
        {
            var violation = false;
            this._previousContactIds.forEach((idd:number) => 
            {
                // all previous contacts need to be in there -> else warning 
                const index = newList.indexOf(idd, 0);
                if (index == -1) {
                    // violation detected
                    violation = true;

                    // add this user back to the list
                    newList.push(idd);
                }
            });
            if(violation)
            {
                // reset target contacts
                this._targetContacts = this._previousContacts;

                this._openAlertTargetContactDidNotChange();
            }

            // Check if users were added that are not in S'arvo
            if(this.hasNonSarvoContacts())
            {
                this._displayNonRegisteredInformation();
            }
        }



        for (let nonSarvoUser of this._targetContacts as Array<SarvoUser>) {
            if (!nonSarvoUser.isRegistered) {
                var seen = []
                if(nonSarvoUser.username.indexOf("Invited User") == -1 && seen.indexOf(nonSarvoUser.username.replace(" (invited)", "")) == -1){

                    seen.push(nonSarvoUser.username.replace(" (invited)", ""));

                    console.log("-----------> INVITING" + nonSarvoUser.username)
              this.inviteUser(this._event.id, Utility.converter.unhash(nonSarvoUser.phonenumber), nonSarvoUser.phonenumber)
            }
            
        }
        }

        // Add Members of groups
        if(this.eventView.options.admin)
        {
            var groupIds = []
            for (let group of this._targetGroup)
            {
                for (let sarvoUserId of group.members) {
                    if (sarvoUserId != -1)
                    newList.push(sarvoUserId);
                }
                groupIds.push(group.id)
            }
            // post chosen groups
            if(!this._firstLoad && this._storeTargetGroup)
            {
                this._receivedGroupIds = groupIds;
                this._event.targetGroups = groupIds;
                this._event.postEventProperties(["targetGroups"])
            }
        }
        this._firstLoad = false
        

        // Drop duplicates
        let x = (a) => a.filter((v,i) => a.indexOf(v) === i)
        newList = x(newList);

        

        // Check if it changed -> then send
        if(newList.sort().toString() != this._event.participants.sort().toString())
        {
            this._event.participants = newList;
            this._event.postEventProperties(["participants"]); // post update to Backend
        } 
    }

    _displayNonRegisteredInformation()
    {
        let textPreList = "Einige deiner eingeladenen Nutzer sind noch nicht in S'arvo registriert.";
        let iosLink = "https://apps.apple.com/de/app/sarvo/id1462945156"
        let androidLink = "https://play.google.com/store/apps/details?id=sarvo.release"   
        
        let clipboardMessage = this._organizerName + " hat dich zu Veranstaltung '" + this._event.name + "' auf S'arvo eingeladen. Um daran teilzunehmen hole dir die App auf iOS unter " +  iosLink + " oder für Android unter " + androidLink
        
        
        let textPostList = "Lade Sie mit folgendem Text ein damit sie an deiner Veranstaltung teilnehmen können. "
        textPostList += "<ul>"
        textPostList += clipboardMessage
        textPostList += "</ul>"     
        
        let unregistered = this._targetContacts.filter((item) => {
            if (item.isRegistered || item.id == this._user.id || item.username.indexOf("Invited User") != -1 ) {
              return false
            }
            return true
          });

        let mylist = "<ul>"
        
        for (let i = 0; i < unregistered.length; i++) {
            mylist += "<li>";
            mylist += unregistered[i].username;
            mylist += "</li>";
        }
        mylist += "</ul>"; //"<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul><li>Item 4</li></ul><li>Item 5</li></ul>";
        

        let alert = this.alertCtrl.create({ 
            title: "Non-Sarvo Nutzer",
            mode: 'md',
            message: '<div style="overflow-y:auto;max-height:280px;">' + textPreList + mylist + textPostList + '</div>',
            buttons: [

                // IF TEXT COPY CLICKED - COPY IT TO CLIPBOARD AND ALERT
                {
                    text: 'Text in Zwischenablage kopieren',
                    cssClass: 'secondary',
                    handler: (blah) => {

                        // COPY MESSAGE TO CLIPBOARD 
                        this.clipboard.copy(clipboardMessage)
                            
                        let alert2 = this.alertCtrl.create({
                            title: 'Kopieren erfolgreich',
                            message: "Der Einladungstext wurde erfolgreich in deine Zwischenablage kopiert! Sende ihn an deine eingeladenen Freunde, damit sie an der Veranstaltung teilnehmen können.",
                            buttons: [
                                {
                                    text: 'OK',
                                    handler: data => {
                                        // Log and store  
                                    }
                                }
                            ]
                        });
                        alert2.present();
                    return false;
                    }
                  },

                  // IF OK PRESSED - JUST CLOSE
                  {
                    text: 'OK',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                      console.log('Confirm Cancel: blah');
                    }
                  }
            ]
          });
        
        alert.present();
        
    }


    /*
    This method loads the current event and user from the server and
    initializes the view
     */
    _load_from_server(eventId: number, cameFromEventCreate: boolean): void {

        // Sets the Event Details from the server information
        let responseDict = {};
        if (!cameFromEventCreate)
            this._targetContacts = [];

        // 1. Get user id
        this.getDirect("curuser/id/").then((request_response) => {
            let s = request_response["userId"];
            this._user.id = parseInt(s);


            this.getDirect("event/" + eventId + "/").then((obj) => {
                // Do something after this promise
                responseDict = JSON.parse(JSON.stringify(obj));

                // Do something with parsed
                this._event.name = responseDict["name"];
                this._event.location = responseDict["location"];
                this._event.description = responseDict["description"];
                this.eventView.setDescription(this._event.description);
                this._event.organizer = responseDict["organizer"];
                this._event.organizationStatus = responseDict["organization_status"];
                this._event.participants = responseDict["participants"];
                this._event.fixed_date_option_id = responseDict["fixed_date_option_id"];
                
                var fixed_date_option = responseDict["fixed_date_option_id"];
                var fixed_date = responseDict["fixed_date"];
                this._receivedGroupIds = responseDict["targetGroups"];


                // load image async
                this.get("event/" + this._event.id.toString() + "/imageFull/").then((requestResponse) => {
                    this._event.imageBase64 = requestResponse["imageBase64"];
                    // set this image
                this.renderer.setElementStyle(this.mainIonContent.nativeElement, 'background-image', "url('"+ this._event.imageBase64 +"')");

                });

                // load organizer name
                this.getDirect("user/" + this._event.organizer.toString() + "/").then((requestResponse) => {
                    this._organizerName = requestResponse["name"];

                    // Show notification if required
                    if(this.hasNonSarvoContacts())
                    {
                        this._displayNonRegisteredInformation();
                    }
                });
 

                
                // todo
                this._attendOptions = [];
                
                for (let option of responseDict["possible_dates"]) {

                    //console.log("---entry")
                    if(option["date"].length == 0)
                    {
                        continue;
                    }
                    //console.log(option["date"]);
                    // if id == fixed_date_option = responseDict["fixed_date_option_id"];
                    var recOption = {};
                    recOption["id"] = option["id"];
                    recOption["date"] = option["date"];
                    recOption["nrIn"] = option["acc_participants"].length;
                    recOption["nrOut"] = option["dec_participants"].length;
                    recOption["nrUnsure"] = option["inter_participants"].length;
                    recOption["contacts"] = [{name: "c1", pic: "c2"}];
                    recOption["selection"] = this.eventView.selectionFromParticipants(option["acc_participants"], option["inter_participants"], option["dec_participants"], this._user.id);
                    recOption["fixedSelection"] = "open"

                    this._attendOptions.push(recOption)
                }
                if(this._attendOptions.length == 0 || this._attendOptions === undefined)
                {
                    // dummy 
                    var recOption = {};
                    recOption["id"] = -1;
                    recOption["date"] = "";
                    recOption["nrIn"] = [];
                    recOption["nrOut"] = [];
                    recOption["nrUnsure"] = [];
                    recOption["contacts"] = [{name: "c1", pic: "c2"}];
                    recOption["selection"] = "in";
                    recOption["fixedSelection"] = "open"
                    this._attendOptions.push(recOption)
                }

                // get target contacts
                if (!cameFromEventCreate)
                {
                    for (let id of this._event.participants) {
                        let participant = new SarvoUser();
                        participant.getFromBackendMapNative(id);
                        if (participant.id != this._user.id) {
                            this._targetContacts.push(participant);
                        }
                    }
                }
                

                // if Date option fixed
                if (fixed_date_option != -1) {

                    this.eventView.fixedEventMode();

                    
                    this._event.fixedDate = fixed_date;
                    this.eventView.set_time_diff(this._event.fixedDate);

                    // set the fixed Attend Option
                    var idx = -1;
                    for (let option of this._attendOptions) {
                        idx = idx + 1;

                        if (option.date.replace(/\s/g, "") == this._event.fixedDate) // $event.replace(/(\r\n\t|\n|\r\t)/gm,"").replace(/\s/g, ""))
                        {
                            option.fixedSelection = "fixed";
                            this.eventView.gui.eventSpecsBox.fixedAttendOption = option;
                            
                            
                            break;
                        }
                    }
                }



                // set VIEW to organizer or user mode
                this.eventView.adminMode(this._user.id == this._event.organizer);

            
            // Stop loader
            this.eventView.options.loading=false;


            


            }).catch((err) => {
                console.log(JSON.stringify(err));
            });

        }).catch((err) => {
            console.log(JSON.stringify(err));
        });


    }

    setFixedAttendOptionColor(selection:string)
  {
    if (selection == "in") {
        this.renderer.setElementStyle(this.acceptFixIcon.nativeElement, 'color', "#1c3144");
        this.renderer.setElementStyle(this.maybeFixIcon.nativeElement, 'color', "gray");
        this.renderer.setElementStyle(this.denyFixIcon.nativeElement, 'color', "gray");
      return; // means I am in already - so quit
    }
    if (selection == "maybe") {
        this.renderer.setElementStyle(this.acceptFixIcon.nativeElement, 'color', "gray");
        this.renderer.setElementStyle(this.maybeFixIcon.nativeElement, 'color', "#1c3144");
        this.renderer.setElementStyle(this.denyFixIcon.nativeElement, 'color', "gray");
      return; // means I am in already - so quit
    }
    if (selection == "out") {
        this.renderer.setElementStyle(this.acceptFixIcon.nativeElement, 'color', "gray");
        this.renderer.setElementStyle(this.maybeFixIcon.nativeElement, 'color', "gray");
        this.renderer.setElementStyle(this.denyFixIcon.nativeElement, 'color', "#1c3144");
      return; // means I am in already - so quit
    }
    
  
  }
    
    
    /* 
    Attend item changes
    */
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
    this.post("/event/" + this._event.id + "/dateoptions/" + attendOptionItem.id + "/", message).then((request_response) => {
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
          this.post("/event/" + this._event.id + "/dateoptions/" + attendOptionItem.id + "/", message).then((request_response) => {
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
          this.post("/event/" + this._event.id + "/dateoptions/" + attendOptionItem.id + "/", message).then((request_response) => {
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

    
}
