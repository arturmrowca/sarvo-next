import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup} from "@angular/forms";
import { UserFeedback } from "../../lib/UserFeedback";
import { UserFeedbackModel } from "../../lib/models/UserFeedbackModel";
import { IonicModule } from 'ionic-angular';
/**
 * Generated class for the FeedbackPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage {

  private _feedbackGroup: FormGroup;
  private _categoryDummy: Array<any>;
  private _feedback: UserFeedback;
  private _model: UserFeedbackModel;
  private _result;

  constructor(private alertCtrl:AlertController, public navCtrl: NavController, public navParams: NavParams, private _formBuilder: FormBuilder) {
    this._feedbackGroup = this._formBuilder.group({
      category: ['', Validators.required],
      text: [''],
      rating: ['', Validators.required]
    });
    // to be removed as soon as we have decided on a template.
    this._categoryDummy = [{name: "Organisation", value: "lw"},
                           {name: "Design", value: "bw"},
                           {name: "Verbesserungsideen", value: "blw"}];
    this._model = new UserFeedbackModel();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FeedbackPage');
  }

  onSendClicked(_feedbackGroup: FormGroup) {
    this._feedback = new UserFeedback(this._model);
    this._feedback.category = _feedbackGroup.value['category'];
    this._feedback.text = _feedbackGroup.value['text'];
    this._feedback.rating = _feedbackGroup.value['rating'];

    this._feedback.sendToBackend()
      .then((res:object) => {
        this._result = JSON.stringify(res);
      }).catch((err: object) => {
        this._result = JSON.stringify(err);
    });
    //this.navCtrl.pop();

    let alert = this.alertCtrl.create({
      title: 'Thanks!',
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

  }
}

