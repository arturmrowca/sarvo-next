import { Component, ElementRef, ViewChild, Renderer } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicModule } from 'ionic-angular';

/**
 * Generated class for the IntroSplashPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-intro-splash',
  templateUrl: 'intro-splash.html',
})
export class IntroSplashPage {

  @ViewChild('mainImg', {read:ElementRef}) mainImg;

  constructor(public renderer: Renderer, public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams, public splashScreen: SplashScreen) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad IntroSplashPage');
  }

  ionViewDidEnter() {

    this.splashScreen.hide();

      

    setTimeout(() => {
      
    // Start animation
      this.viewCtrl.dismiss();
    }, 1000);
  }
}
