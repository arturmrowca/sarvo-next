import { Component } from '@angular/core';
import {Platform, ModalController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {AlertController} from 'ionic-angular';
import {Camera} from "@ionic-native/camera";
import {Utility} from "../components/utility";
import { Push} from '@ionic-native/push';
import { TabsPage } from '../pages/tabs/tabs';

// custom imports
// internationalization / i18n
import { TranslateService } from '@ngx-translate/core';
import {EventInvitePusher} from "../lib/pusher/EventInvitePusher";
import { NativeStorage } from '@ionic-native/native-storage';
import { IntroSplashPage } from '../pages/intro-splash/intro-splash'; 
import { LoginProcessor } from '../lib/LoginProcessor';




@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;

  constructor(public platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, translateService: TranslateService,
              public push: Push, public camera:Camera, public alertCtrl: AlertController, private nativeStorage: NativeStorage, private modalCtrl: ModalController) {
    


    platform.ready().then(() => {


      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      //splashScreen.hide();

      let splash = this.modalCtrl.create(IntroSplashPage);
      splash.present();

      // setup i18n
      translateService.setDefaultLang('de');
      translateService.use('de')

      
      this.initializePusher();
      
      // Start Login
      LoginProcessor.getInstance().attemptLoginProcedure();
    });

    // override closing app on android return button
    /*platform.registerBackButtonAction(() => { 
    }); */
  }

  initializePusher(): void
  {
    Utility.initialize(this.camera, this.alertCtrl, this.push, this.platform, this.nativeStorage);
  }
}
