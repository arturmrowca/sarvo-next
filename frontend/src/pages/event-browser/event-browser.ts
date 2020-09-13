import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Loadable } from '../../lib/generic/Loadable';
import { BackendFactory } from '../../lib/factory/BackendFactory';

/**
 * Generated class for the EventBrowserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-event-browser',
  templateUrl: 'event-browser.html',
})
export class EventBrowserPage extends Loadable{

  private eventsLocal:Map<string, Array<any>> = new Map<string, Array<any>>(); // key = category, value = name
  private uniqueCategories: Array<string> = []; // names of categories to iterate

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    super();

    // to do
    // event templates, event lists of provider (e.g. TEV Miesbach), sorted by categories
    // load view
    this._loadView()
  }

  cleanEvents(map: Map<string, any>, key: string)
  {
    var res  = []
    try {
      res = map[key] 
    }
    catch(error)
    {}
   return res;
  }

  cleanEventsTitle(map: Map<string, any>, key: string)
  {
    var res  = []
    try {
      res = map[key] 
      return res[0].categoryTitle
    }
    catch(error)
    {}
   return "Unknown";
  }

  /*
  Loads the initial events to be shown
  */
  _loadView()
  {

    // Load 
    this.get("eventbrowse/categories/").then((requestResponse) => {

      this.uniqueCategories = requestResponse["categories"]

      for(let cat of requestResponse["categories"])
      {
        // load those categories from to index
        var m = {}
        m["category"] = cat
        m["from"] = 0
        m["to"] = 4 // Load first 6 entries - rest on clicking more

        this.post("/eventbrowse/categories/detail/", m).then((requestResponse2) => {

          this.eventsLocal[cat] = [];
          
          
            this.eventsLocal[cat] = requestResponse2        
          
        }).catch( (err) => {
          console.log(JSON.stringify(err));
        });
      }
    });

  }

  setUniqueCategories()
  {
    this.uniqueCategories = ["sports", "corona", "football"]
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventBrowserPage');
  }

description()
{
  return "Dies ist ein sehr langer Text der sehr lang ist weil er lang sein muss damit man testen kann ob die Länge des Textes auf dem langen screen des langen Handies auch ausreichend lang und breit aber auch schön und gut gezeigt wird oder ob es doch alles für n arsch und hässlich wie die Nacht ist. "
}


}
