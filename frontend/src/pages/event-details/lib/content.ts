import { SarvoUser } from "../../../lib/SarvoUser";
import { DateInformationComponentBoolean } from "../../../components/date-information/date-information";

/*
    Contains the fields of the description fields
*/ 
export class DescriptionBox{
    public descriptionText:string;
    public descriptionTextShow:string;
    public descriptionExpanded:boolean;
    public descriptionExpandButtonText:string;
    public noDescriptionText:boolean;
}

/*
    Contains the fields of the description fields
*/ 
export class EventSpecificaBox{ 
    descriptionChangeButton = "Edit"; // Text on description Edit button
    timeToEvent = ""; // Time to event counter label
    addDateChosen = ""; // chosen Date
    maxDateChoseable = ""; // latest Date to be choosable
    fixedAttendOption:any = null; // Specifies details about attend options
    changeFixedDateChosen:string = ""; // Date chosen in main screen when choosing events
  };


/*
   This class holds the content of GUI elements that cannot be assigned to any box
*/ 
export class GeneralBox{
    tabBar:any; // Reference to the lower tab bar
     dateDetailsDay: string;
     dateDetailsTime: string;
     dateDetailsDate: string;
     dateDetailsSarvoContactsIn:Array<SarvoUser>;
     dateDetailsSarvoContactsMaybe:Array<SarvoUser>;
     dateDetailsSarvoContactsOut:Array<SarvoUser>;
     dateDetailsShowOverlay:DateInformationComponentBoolean;
     dateDetailsShowHeader:boolean;
}

/*
   This class holds all GUI elements
*/ 
export class GUIElements{

    public descriptionBox: DescriptionBox; // Description part
    public eventSpecsBox:EventSpecificaBox; // Event Specifica part (Start time etc.)
    public generalBox: GeneralBox;
    
    constructor()
    { 
        this.descriptionBox = new DescriptionBox();
        this.eventSpecsBox = new EventSpecificaBox();
        this.generalBox = new GeneralBox();


        // For testing
        this.generalBox.dateDetailsDay = ""
        this.generalBox.dateDetailsTime = ""
        this.generalBox.dateDetailsDate =  ""
        this.generalBox.dateDetailsSarvoContactsIn = [];
        this.generalBox.dateDetailsSarvoContactsMaybe = [];
        this.generalBox.dateDetailsSarvoContactsOut = [];
        this.generalBox.dateDetailsShowOverlay = new DateInformationComponentBoolean();
        this.generalBox.dateDetailsShowOverlay.value = false;
        this.generalBox.dateDetailsShowHeader = true;
    }
}