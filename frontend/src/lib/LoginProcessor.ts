import { BackendFactory } from "./factory/BackendFactory";
import { Utility } from "../components/utility";
import { EventInvitePusher } from "./pusher/EventInvitePusher";
import { NavController } from "ionic-angular";
import { SignupPage } from "../pages/signup/signup";
import { HomePage } from "../pages/home/home";


export class LoginProcessor {
  private static instance: LoginProcessor;

  static getInstance(): LoginProcessor {
    if (!LoginProcessor.instance) {
      LoginProcessor.instance = new LoginProcessor();
    }
    return LoginProcessor.instance;
  }

  public loginInitialized:boolean; 
  public loginSuccessful:boolean;
  public homeOpen:boolean;
  public navCtrl: NavController;
  public shouldBe:number;

  constructor()
  {
    this.loginInitialized = false;
    this.homeOpen = false;
    this.loginSuccessful = false;
    this.shouldBe = 0; // 0 == home 1== signup
  }

  setExpected(itIs:number)// 0 == home 1== signup
  {
    if (itIs != this.shouldBe)
    {
      if (this.shouldBe == 0)
      {
        this.navCtrl.setRoot(HomePage, {signedIn:true});
      }
      if (this.shouldBe == 1)
      {
        this.navCtrl.setRoot(SignupPage);
      }
    }


  }

  /* 
    Attempt login - if already initialized do not repeat
    If Login required link to sign in
    if not required link to home
  */
 attemptLoginProcedure()
 { 
  if(!this.loginInitialized)
  {  
  const bf = BackendFactory.Instance;
  bf.signin().then(() => {  
      this.loginInitialized = true;
      this.loginSuccessful = true;
      
      // Enable push -> send only on first usage 
      Utility.pushNotification.initializePusher();
      var invitePusher = new EventInvitePusher();
      Utility.pushNotification.addPushNotification(invitePusher);  
      this.homeOpen = true;
      console.log("D");
      this.shouldBe = 0
      this.navCtrl.setRoot(HomePage, {signedIn:true});

  }).catch(()=> {
    

        console.log("G");
        this.shouldBe = 1;
        this.navCtrl.setRoot(SignupPage);

      });  
  }

 }
}
