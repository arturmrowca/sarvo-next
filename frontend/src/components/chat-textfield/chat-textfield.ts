import { Component } from '@angular/core';
import { IonicModule } from 'ionic-angular';
/**
 * Generated class for the ChatTextfieldComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'chat-textfield',
  templateUrl: 'chat-textfield.html'
})
export class ChatTextfieldComponent {

  text: string;

  constructor() {
    console.log('Hello ChatTextfieldComponent Component');
    this.text = 'Hello World';
  }

}
