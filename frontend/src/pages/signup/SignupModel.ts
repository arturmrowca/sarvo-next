export class SignupModel {

  get verificationSend(): boolean {
    return this._verificationSend;
  }

  set verificationSend(value: boolean) {
    this._verificationSend = value;
  }

  get verificationSuccessfull(): boolean {
    return this._verificationSuccessfull;
  }

  set verificationSuccessfull(value: boolean) {
    this._verificationSuccessfull = value;
  }

  get correctVerification(): string {
    return this._correctVerification;
  }

  set correctVerification(value: string) {
    this._correctVerification = value;
  }

  get userPhoneNumber(): string {
    return this._userPhoneNumber;
  }

  set userPhoneNumber(value: string) {
    this._userPhoneNumber = value;
  }

  get userPhoneNumberValid(): boolean {
    return this._userPhoneNumberValid;
  }

  set userPhoneNumberValid(value: boolean) {
    this._userPhoneNumberValid = value;
  }

  get userEnteredVerification(): string {
    return this._userEnteredVerification;
  }

  set userEnteredVerification(value: string) {
    this._userEnteredVerification = value;
  }

  get verficicationCodeIsValid() : boolean {
    return this.userEnteredVerification == this.correctVerification;
  }

  private _verificationSend  : boolean;
  private _verificationSuccessfull  : boolean;
  private _correctVerification : string;
  private _userPhoneNumber : string;
  private _userPhoneNumberValid : boolean;
  private _userEnteredVerification : string;

  constructor() {
    this._verificationSend  = false;
    this._verificationSuccessfull  = false;
    this._correctVerification = "424242";
    this._userPhoneNumber = "";
    this._correctVerification = "4242";
    this._userPhoneNumberValid = false;
  }
}
