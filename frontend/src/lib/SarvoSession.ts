import {NativeStorage} from "@ionic-native/native-storage";

export class SarvoSession {

  private static _instance: SarvoSession;

  public nativeStorage: NativeStorage;

  /**
   * Singleton, private constructor, there can only be one session
   */
  private constructor() {
    this.nativeStorage = new NativeStorage();
  }

  /**
   * used for getting an instance of the single, usage like
   * `const fac = BackendFactory.Instance;`
   * @constructor
   */
  public static get Instance() {
    // Do you need arguments? Make it a regular method instead.
    return this._instance || (this._instance = new this());
  }

    /**
     *
     * @param secret object with fields 'username' and 'secret'
     */
  public storeUser(secret: object) {
    this.nativeStorage.setItem('credentials', secret)
      .then(
        () => console.log('Stored secret!'),
        error => console.error('Error storing secret', error)
      );

    // Or to get a key/value pair
    this.nativeStorage.getItem('credentials').then((secret) => {
      console.log("stored secret ", JSON.stringify(secret), " in persistent storage.");
    });
  }
}
