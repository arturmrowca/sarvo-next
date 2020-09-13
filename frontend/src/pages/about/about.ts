import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { AlertController } from 'ionic-angular';
import { IonicModule } from 'ionic-angular';
@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  latitude: number;
  longitude: number;

  showAlert() {
    const alert = this.alertCtrl.create({
      title: 'New Event Invite!',
      subTitle: 'Your friend invited you to a new event!',
      buttons: ['OK']
    });
    alert.present();
  }

  constructor(public navCtrl: NavController, 
    private geolocation: Geolocation,
    public alertCtrl: AlertController) {

      this.geolocation.getCurrentPosition().then((resp) => {
        // resp.coords.latitude
        // resp.coords.longitude
      }).catch((error) => {
        console.log('Error getting location', error);
      });

  let watch = this.geolocation.watchPosition();
  watch.subscribe((data) => {
   // data can be a set of coordinates, or an error (if an error occurred).
   // data.coords.latitude
   // data.coords.longitude
   if(data.coords !== undefined)
   {
     this.longitude = data.coords.longitude;
     this.latitude = data.coords.latitude;
   }
   else
   {
    this.longitude = 0.0
    this.latitude = 0.0
   }
   });
   this.showAlert();
 }
}
