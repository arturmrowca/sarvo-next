cd C:\workspace\sarvo\sarvo\frontend\SarvoApp
ionic cordova build android --prod --release
move C:\workspace\sarvo\sarvo\frontend\SarvoApp\platforms\android\app\build\outputs\apk\release\app-release-unsigned.apk C:\workspace\sarvo\app-release-unsigned.apk
cd C:\workspace\sarvo
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore key_app_store.jks app-release-unsigned.apk upload
C:\Users\artur\AppData\Local\Android\Sdk\build-tools\28.0.3\zipalign.exe  -v 4 app-release-unsigned.apk signed-app.apk