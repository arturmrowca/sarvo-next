from converter import *

def generate_push_event(date="jederzeit", title="Titel", image_name="std_img,jpg",
                        descriptionIn="Beschreibung", starChosen=False,
                        category="Abendprogramm", location="Online",
                        numberPeople="2 Personen", duration="1 bis 3 Stunden",
                        whatYouNeed=[], postMessage="Viel Spaß",
                        testMode=False):
    """
    Generate an event and push it to DB.

    :param date: Date either as "jederzeit" or as YYYY-MM-DDThh:mm:ss:00Z. As String.
    :param title: Title of the event. As String.
    :param image_name: Name of image as "name.jpg" stored in img/ folder. As String.
    :param descriptionIn: Description of the event. As String.
    :param starChosen: As Boolean.
    :param category: Category of the event which will be shown in App. As String.
    :param location: Location of event. As String.
    :param numberPeople: Number of people which can participate in event. As String.
    :param duration: Duration of event. As String.
    :param whatYouNeed: Requirements/ prerequisites to participate/ do event. As List of Strings.
    :param postMessage: Message which will be shown at the end of the event screen. As String.
    :param testMode: Whether test mode to be active or not (shown in browser). As Boolean.
    """
    # hostname and credentials for db.
    hostname = 'ls-4bd4b70dde975f755fa784f44fb7c6defa761dc9.cp2sma0o3rti.eu-central-1.rds.amazonaws.com'
    username = 'dbmasteruser'
    password = '*TB?WLR1XP=fk7~O3v*,osBix]%,K+wi'
    database = 'postgres'
    #'PORT': "5432"

    # Convert image.
    try:
        image = ImageConverter().stdBaseAndPreview(r"img/" + image_name)
    except:
        print("Fail %s" % str(image_name))

    # Simple routine to run a query on a database and print the results:
    import psycopg2
    myConnection = None
    if not testMode:myConnection = psycopg2.connect(host=hostname, user=username, password=password, dbname=database)
    insertEvent(myConnection, date, title, image, descriptionIn, starChosen, category, location, numberPeople, duration, whatYouNeed, postMessage, testMode)
    if not testMode:myConnection.close()
