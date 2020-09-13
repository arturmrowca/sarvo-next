import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { TranslateService } from "@ngx-translate/core";
import { ProfilePage} from "../profile/profile";
import { SignupModel } from "./SignupModel";
import {SarvoVerification} from "../../lib/SarvoVerification";
import {SarvoVerificationModel} from "../../lib/models/responses/SarvoVerificationModel";
import { trackclicks } from '../../lib/generic/Trackable';
import { HomePage } from '../home/home';
import { EventListComponent } from '../../components/event-list/event-list';
import { Utility } from '../../components/utility';
import { LoginProcessor } from '../../lib/LoginProcessor';
import { GdprConsentPage } from '../gdpr-consent/gdpr-consent';
import { SettingsSingleton } from '../../lib/SettingsSingleton';
import {CollabListComponent} from "../../components/collab-list/collab-list";
/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
  

  public model : SignupModel;
  public verify : SarvoVerification;
  public static oneDirection:boolean = false;
  private doShowTab = false;
  public static signedInInThisSession:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public translate: TranslateService, private alertCtrl: AlertController) {
    let elem = <HTMLElement>document.querySelector(".tabbar");
    if (elem != null) {
        console.log("did enter " + elem.style.display);
        elem.style.display = 'none';
    }
    this.doShowTab = false

    this.model = new SignupModel();
    this.verify = new SarvoVerification();
    
    LoginProcessor.getInstance().setExpected(1);
  }
  
  ngAfterViewInit() { // or ngOnInit or whatever
    
    LoginProcessor.getInstance().setExpected(1);
}
  

  tmpSkip(){
    //this.navCtrl.setRoot(HomePage, {signedIn:true});
  }

  ngDoCheck() {
    let elem = <HTMLElement>document.querySelector(".tabbar");
    if (elem != null) {
        console.log("did enter " + elem.style.display);
        elem.style.display = 'none';
    }
    this.doShowTab = false

  }

  checkPhoneNumber(input): any {

    console.log("checkPhoneNumber:  " + input);

    let regExp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,9}$/im;
    
    if (!regExp.test(input)) {
      this.model.userPhoneNumberValid = false;
    } else {
      this.model.userPhoneNumberValid = true;
    }
    return null;
  }

  
  attemptVerfication(event) {
    // Check if consent to DSGVO was given - if not do not allow sending
    if(!SettingsSingleton.getInstance().optInGiven)
    {
        let alert = this.alertCtrl.create({
          title: "Datenschutz und Nutzungsbedingungen",
          message: "Wenn du S'arvo Nutzen möchtest musst du unseren Datenschutzrichtlinien und den Nutzungsbedingungen zustimmen.",
          buttons: [
              {
                  text: 'Ok',
                  handler: () => {
                    
                    alert.dismiss(false);
                    this.model.verificationSend = false;
                    return false;
                  }
              }
          ]
      });
      alert.present();
      return;
    }




    console.log("attempting verfication using phone number " + this.model.userPhoneNumber);
    SignupPage.signedInInThisSession = true;

    this.verify.attemptVerification(this.model.userPhoneNumber, Utility.converter.hash(this.model.userPhoneNumber))
      .then((res : SarvoVerificationModel) => {
        console.log("FOR DEBUG ELSE REMOVE - " + res.challenge)
        this.model.correctVerification = res.challenge;
      })
      .catch((err : SarvoVerificationModel) => {
        console.log("failed fetching verification challenge");
        console.log(err.errorObject);
      });

    this.model.verificationSend = true;
  }

  showProfile(event) {
    // Check if consent to DSGVO was given - if not do not allow sending
    if(!SettingsSingleton.getInstance().optInGiven)
    {
        let alert = this.alertCtrl.create({
          title: "Wenn du S'arvo Nutzen möchtest musst du den Datenschutzbestimmungen zustimmen.",
          buttons: [
              {
                  text: 'Ok',
                  handler: () => {
                    
                    alert.dismiss(false);
                    this.model.verificationSend = false;
                    return false;
                  }
              }
          ]
      });
      alert.present();
      return;
    }


    //this.navCtrl.setRoot(ProfilePage); // set root to disable the "back" function

    this.navCtrl.setRoot(ProfilePage, {
      signup: true,
      number: this.model.userPhoneNumber
    });
  }

  
    /*Show tab bar on page leaving */
    ionViewDidLeave()
    {
      if(this.doShowTab)
        return;

        let elem = <HTMLElement>document.querySelector(".tabbar");
        if (elem != null) {
        elem.style.display = '';
        }
    }

    ionViewDidEnter()
    {
      console.log("_-------------------asdsadasdsad")
      this.doShowTab = false
    }

    /* Open page to agree or disagree to privacy policy
      */ 
    showConsentPage()
    {
      this.doShowTab = true
      SettingsSingleton.getInstance().optInSignup = true;
      this.navCtrl.push(GdprConsentPage);
    }
}
