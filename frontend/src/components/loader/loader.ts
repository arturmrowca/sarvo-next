import { Component } from '@angular/core';
import { IonicModule } from 'ionic-angular';
/**
 * Generated class for the LoaderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'loader',
  templateUrl: 'loader.html'
})
export class LoaderComponent {

  text: string;

  constructor() {
    
    this.text = 'Hello World';
  }

}
