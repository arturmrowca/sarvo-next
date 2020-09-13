import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Loadable } from '../../lib/generic/Loadable';
import { BackendFactory } from '../../lib/factory/BackendFactory';
import { SettingsSingleton } from '../../lib/SettingsSingleton';
import { HomePage } from '../home/home';

/**
 * Generated class for the GdprConsentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-gdpr-consent',
  templateUrl: 'gdpr-consent.html',
})
export class GdprConsentPage extends Loadable {

  private contentList = []
  private consentGiven:boolean = false;
  private version:number = -1;
  private justLeave:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController) {
    super();
    this.justLeave = SettingsSingleton.getInstance().optInSignup;
    this.contentList = []
    this._loadContent();
  }

  /*
  Load current content
  */
  _loadContent()
  {

    BackendFactory.Instance.getOpen("auth/gdprConsent/").then((request_response) => {
      let elem = <HTMLElement>document.querySelector(".tabbar");
      if (elem != null) {
          console.log("did enter " + elem.style.display);
          elem.style.display = 'none';
      }
      this.version = request_response["version"]
      this.contentList = request_response["content"] 
      /*  List of lists
        [
          [[bool, header], [bool, text], [bool, text], [bool, text, link]], 
          [[bool, header], [bool, text], [bool, text], [bool, text, link]],
          ...
        ]
      */
      
      console.log(this.contentList)

      // set true if I did agree already
      if(SettingsSingleton.getInstance().optInVersion == this.version)
      {
        this.consentGiven = true;
      }


    }).catch((err) => {
      console.log(JSON.stringify(err));
      console.log("Unable to load GDPR Message")
    });
  }

  ionViewDidLoad() {
    let elem = <HTMLElement>document.querySelector(".tabbar");
    if (elem != null) {
        console.log("did enter " + elem.style.display);
        elem.style.display = 'none';
    }

    
  }

  /* Show tab bar on page leaving */
  ionViewDidLeave()
  {
      let elem = <HTMLElement>document.querySelector(".tabbar");
      if (elem != null) {
        elem.style.display = '';
      }
  }
  ngDoCheck()
  {
    let elem = <HTMLElement>document.querySelector(".tabbar");
      if (elem != null) {
          elem.style.display = 'none';
      }
  }

  leaveScreen()
  {

    // Opt In Version agreed (if agreed)
    if (this.consentGiven)
    {
      SettingsSingleton.getInstance().optInVersion = this.version;
      SettingsSingleton.getInstance().optInGiven = true;
    }
    else
    {
      SettingsSingleton.getInstance().optInVersion = 0;
      SettingsSingleton.getInstance().optInGiven = false;
    }


    this.navCtrl.pop();
  }

  /*
  User gave his Opt-In
  */
  leaveScreenCheckConsent()
  {

    // post agreement if given post it
    if(this.consentGiven)
    {
      // post consent
      var message = {};

      message["agreedDSGVO"] = this.version.toString();

        // Do upsert
        this.post("/curuser/full/", message).then((request_response) => {

        }).catch((err) => {
          console.log(JSON.stringify(err));
        });
        
        this.navCtrl.setRoot(HomePage, {gdprDone:true});
    }
    else
    {
        let alert = this.alertCtrl.create({
          title: "Wenn du S'arvo Nutzen möchtest musst du den Datenschutzbestimmungen zustimmen.",
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
      return;
    }
 
  }

  doNotConsent()
  {
    let alert = this.alertCtrl.create({
      title: "Wenn du S'arvo Nutzen möchtest musst du den Datenschutzbestimmungen zustimmen.",
      buttons: [
          {
              text: 'Ok',
              handler: () => {
  
                alert.dismiss(false);
                navigator["app"].exitApp();
                return false;
              }
          }
      ]
  });
  alert.present();
  return;

  }

  /*
  content Changed
  */
 changedConsent()
  {
    console.log(this.consentGiven)
  }
}
