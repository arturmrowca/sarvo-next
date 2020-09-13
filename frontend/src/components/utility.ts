import {Camera} from '@ionic-native/camera';
import {Push} from '@ionic-native/push';
import {AlertController, NavController, Platform} from 'ionic-angular';
import {ImagePicker} from "./utilities/image-picker";
import {PushNotification} from "./utilities/push-notification";
import { Injectable } from "@angular/core";
import { NativeStorage } from '@ionic-native/native-storage';
import { Converter } from './utilities/converter';


@Injectable()
export class Utility {
    /*
    Contains the following utilities, which can be used
        - ImagePicker: This picker allows to select images from camera or the gallery
        - pushNotification: This object allows to send push notifications to any client
        - nativeStorage: This object allows to store items
     */

    public static imagePicker: ImagePicker;
    public static pushNotification: PushNotification;
    public static nativeStorage: NativeStorage;
    public static converter:Converter;

    constructor()
    {}

    public static initialize(camera:Camera, alertCtrl: AlertController, push: Push, platform: Platform,
                             nativeStorage: NativeStorage):void
    {
        
        Utility.imagePicker = new ImagePicker(camera, alertCtrl); 
        Utility.pushNotification = new PushNotification(push, platform);
        Utility.converter = new Converter();
        Utility.nativeStorage = nativeStorage;
    }
}
