import { Push, PushObject, PushOptions } from '@ionic-native/push';
import {SarvoUser} from "../../lib/SarvoUser";
import {Platform} from 'ionic-angular';

export class PushNotification {

    private pushMap: Map<string, Pusher>; // maps an id to the pusher object
    private deviceToken: string; // Current device token
    private options: any = {//PushOptions = {
        android: {senderID: '347630231542'}, // Got from firebase
        ios: {
              alert: 'true',
              badge: true,
              sound: 'false',
              clearBadge: true
        },
        windows: {},
        browser: {
            pushServiceURL: 'http://push.api.phonegap.com/v1/push'
        }
    };

    constructor(private push: Push, private platform: Platform)
    {
        // Initialize Objects
        this.push = push;
        this.platform = platform;
        this.deviceToken = "";
        this.pushMap = new Map<string, Pusher>();

        // check permission
        this.push.hasPermission()
            .then((res: any) => {
                console.log("Permission")

                if (res.isEnabled) {
                    console.log('We have permission to send push notifications');
                } else {
                    console.log('We do not have permission to send push notifications');
                }
            });
        
        
        }

    initializePusher(){
        // Define Push notification action -> DO THIS AS DESCRIBED IN TUTORIAL!
        const pushObject: PushObject = this.push.init(this.options);
        pushObject.on('notification').subscribe((notification: any) =>
            {
                console.log('Received a notification', notification);

                // read push id and call according pusher
                var pushId = notification.additionalData["pushId"];

                if (pushId in this.pushMap)
                {

                    var pusher = this.pushMap[pushId];
                    pusher.onReceivedNotification(notification);

                    // ON CLICKED
                    if (notification.additionalData.foreground) {}
                    else{
                        //if user NOT using app and push notification comes
                        console.log('Push notification clicked');
                        pusher.onNotificationClicked(notification);
                    }
                }
                else
                {
                    console.log("Received a push but no pusher defined for ID: " + pushId);
                }
            }
        );

        // On registration transmit device information
        pushObject.on('registration').subscribe((registration: any) =>
        {console.log('Device registered', registration);
            console.log('device token -> ' + registration.registrationId);

                // send device token and Type to server
                this.deviceToken = registration.registrationId;
                var user = new SarvoUser();
                user.deviceTokens = [this.deviceToken];
                // also send platform
                this.platform.ready().then(() => {
                    var pf = "";
                    if (this.platform.is('android')) {
                        pf = "android"
                    }
                    if (this.platform.is('ios')) {
                        pf = "ios"
                    }
                    if (this.platform.is('mobileweb')) {
                        pf = "browser"
                    }
                user.deviceTypes = [pf];

                user.postCurrentUserProperties(["deviceTokens", "deviceTypes"]);
            });
        });

        pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
    }


    /*
    This method allows to define push notifications
    Input is a class object with a method onReceivedPush
     */
    public addPushNotification(pusher: Pusher)
    {
        this.pushMap[pusher.pushId] = pusher;
    }
}
