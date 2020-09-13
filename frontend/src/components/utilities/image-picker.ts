import { Camera, CameraOptions } from '@ionic-native/camera';
import { AlertController } from 'ionic-angular'; 
export class ImagePicker {

    public targetLength: number; // target size of an image
    private optionsCamera: CameraOptions = {
        quality: 100,
        targetWidth: 600,
        targetHeight: 600,
        sourceType: this.camera.PictureSourceType.CAMERA,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
    };

    private optionsGallery: CameraOptions = {
        quality: 100,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
    };

    constructor(public camera:Camera, private alertCtrl: AlertController)
    {
        this.camera = camera;
        this.targetLength = 2000000
    }

    public photoAlert()
    {
        var imageBase64 = "";

        return imageBase64;
    }

    public compressImage(src, targetMax) {
        

        return new Promise((res, rej) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            const elem = document.createElement('canvas');

            let scale = 0
            if (img.height > img.width)
                scale = targetMax/img.height
            else
                scale = targetMax/img.width

            elem.width = scale * img.width;
            elem.height = scale * img.height;
            const ctx = elem.getContext('2d');
            ctx.drawImage(img, 0, 0, scale * img.width, scale * img.height);
            const data = ctx.canvas.toDataURL();
            res(data);
          }
          img.onerror = error => rej(error);
        })
      }

    public compress(imageBase64: string)
    {
        // parameter
        let targetMax= 1024; // the bigger dimension is scaled

        return this.compressImage(imageBase64, targetMax);
        
    }


    public getPhoto(option: number){
        /*
        Take a picture and get the base64 representation
        option = 0 -> open gallery and choose image
        option = 1 -> open camera and capture image

        NOTE:   the version of the camera package needs to be 4. I.e. install with
                ionic cordova plugin add cordova-plugin-camera
                npm install --save @ionic-native/camera@4
         */
        var optionSet: any;
        if(option == 0)
        {
            optionSet = this.optionsGallery
        }
        if(option == 1)
        {
            optionSet = this.optionsCamera
        }
        let base64Image = "";
        
        return this.camera.getPicture(optionSet);
//        this.camera.getPicture(optionSet).then((imageData) => {
//            base64Image = 'data:image/jpeg;base64,' + imageData;
//        }, (err) => {
//            // Handle error
//        });

//        return base64Image;
    }

}
