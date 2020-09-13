import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventDetailsPage } from './event-details';

// i18n
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [ 
  ],
  imports: [
    IonicPageModule.forChild(EventDetailsPage),
    TranslateModule.forChild()
  ],
})
export class EventDetailsPageModule {}
