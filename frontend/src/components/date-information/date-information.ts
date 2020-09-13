import { Component, Input } from '@angular/core';
import { SarvoUser } from '../../lib/SarvoUser';


export class DateInformationComponentBoolean {
  public value:boolean;
  constructor()
  {this.value=true;}
}
 
/**
 * Generated class for the DateInformationComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'date-information',
  templateUrl: 'date-information.html'
})
export class DateInformationComponent {
 
  @Input() activeHeader: boolean;
  @Input() show: DateInformationComponentBoolean;
  @Input() _dateString: string;
  @Input()  _dayString:string;
  @Input()  _timeString:string;
  @Input() _sarvoContactsIn: Array<SarvoUser>;
  @Input()  _sarvoContactsMaybe:Array<SarvoUser>;
  @Input()  _sarvoContactsOut:Array<SarvoUser>;
 

  constructor() {

    /*this._dateString = "01.01.2019";
    this._dateString = "Mo";
    this._timeString = "22:00";*/

  }

  dateTitle()
  {
    return this._dateString + " " + this._dayString + " " + this._timeString +" Uhr";
  }

  backHit()
  {
    this.show.value = false;
  }

}
