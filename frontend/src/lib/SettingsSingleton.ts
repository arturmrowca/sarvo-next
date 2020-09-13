export class SettingsSingleton {
    private static instance: SettingsSingleton;

    public user_id: Number;
    public server_url: String;
    public dayNameMap: Map<number, string>;
    public dayNameMapLong: Map<number, string>;

    public optInVersion:number;
    public optInGiven:boolean = false;
    public optInSignup:boolean;
    public prod:boolean = false; // if true production mode

    /**
     * private constructor
     * Call like
     * const globalSettings = SettingsSingleton.getInstance();
     */
    private constructor() {
        this.prod = true // if true production mode
        console.log("MODE ---> Productive = " + this.prod)
        
        this.user_id = NaN;
        this.optInVersion = 0; // Version the user agreed
        this.optInSignup = false;
        if (this.prod)
        {
          this.server_url = "api.sarvo-api.xyz" // "192.168.2.116"// "api.sarvo.io"// "192.168.2.103"//"api.sarvo.io"// "192.168.2.116"// "api.sarvo.io"
        }
        else
        {
          this.server_url = "192.168.2.116"
        }
        
    
        this.setDateMap(); 
    }

    static getInstance(): SettingsSingleton {
      if (!SettingsSingleton.instance) {
        SettingsSingleton.instance = new SettingsSingleton();
      }
  
      return SettingsSingleton.instance;
    }

    setDateMap()
    {
      this.dayNameMap = new Map<number, string>();
      this.dayNameMap[0] = "So";
      this.dayNameMap[1] = "Mo";
      this.dayNameMap[2] = "Di";
      this.dayNameMap[3] = "Mi";
      this.dayNameMap[4] = "Do";
      this.dayNameMap[5] = "Fr";
      this.dayNameMap[6] = "Sa";

      this.dayNameMapLong = new Map<number, string>();
      this.dayNameMapLong[0] = "Son";
      this.dayNameMapLong[1] = "Mon";
      this.dayNameMapLong[2] = "Die";
      this.dayNameMapLong[3] = "Mit";
      this.dayNameMapLong[4] = "Do";
      this.dayNameMapLong[5] = "Fre";
      this.dayNameMapLong[6] = "Sam";
    }
  }



