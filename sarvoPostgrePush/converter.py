import base64

from PIL import Image, ImageOps
from resizeimage import resizeimage


import re
from io import BytesIO

class ImageConverter(object):
    """
    This class is used to convert image data
    """

    def __init__(self):
        self.stdBase64Width = 512 # standard width for base 64 images when using functions here, height accordingly
        self.stdBase64PreviewWidth = 200 # standard preview width for base 64 images when using functions here

    def _resize(self, base64_image, size):
        """
        Resizes the input image
        :param base64:
        :param  size: tuple of width, heigth
        :return:
        """
        new_image = ImageOps.fit(base64_image, size, Image.ANTIALIAS)
        buffered = BytesIO()
        if new_image.mode == "RGBA":
            new_image.save(buffered, format="PNG")
        else:
            new_image.save(buffered, format="JPEG")
        str_image = base64.b64encode(buffered.getvalue())

        #img_base64 = bytes("data:image/jpeg;base64,", encoding='utf-8') + str_image
        img_base64 = "data:image/jpeg;base64," + str_image.decode("utf-8")
        return img_base64

    def stdBaseAndPreview(self, inputPath):
        """
        Takes a raw string and returns its converted version in
        standard format for both preview and actual image
        :param base64:
        :return:
        """

        # read image
        im = Image.open(inputPath)
        #image_data = re.sub('^data:image/.+;base64,', '', base64Input)
        #im = Image.open(BytesIO(base64.b64decode(image_data)))

        # resize to standard image
        fac = self.stdBase64Width / im.size[0]
        new_size = (int(fac * im.size[0]), int(fac * im.size[1]))
        std_image = self._resize(im, new_size)


        # resize to standard preview
        fac = self.stdBase64PreviewWidth / im.size[0]
        new_size = (int(fac * im.size[0]), int(fac * im.size[1]))
        std_preview = self._resize(im, new_size)

        return std_preview


def prepare(date):
    """2020-04-24T09:29:00Z"""
    if date == "jederzeit":
        return "Jederzeit"
    elif "jeden" in date.lower():
        return date
    elif date == '':
        return "tbd."

    year, month, day = date.split("T")[0].split("-")
    time_list = date.split("T")[1].split(":")
    time = time_list[0] + ":" + time_list[1]

    return day + "." + month + "." + year + " - " + time

def descriptionFromTemplate(descriptionIn, date, location, numberPeople, duration, whatYouNeed, image, postMessage):

    input = '<div align="left"><p style="font-size:medium">'
    #input += "</div>"
    #return input

    # RAHMENBEDINGUNGEN
    input += '<b>Rahmenbedingungen:</b></p>	<ul>'

    input += '<li><b>Zeitraum: </b>%s</li>' % str(prepare(date))
    if duration is not None:input += '<li><b>Dauer: </b> %s</li>' % str(duration)
    if numberPeople is not None:input += '<li><b>Anzahl: </b> %s</li>' % str(numberPeople)
    if location != "Empty":input += '<li><b>Ort: </b>%s</li>' % str(location)
    input += '</ul>'

    # BILD
    input += "<img src='"
    input += image
    input += "' alt='Red dot' />"

    # Description
    input += "<p style='font-size:medium'><b>Beschreibung:</b></p><p>%s</p>" % str(descriptionIn)

    # what you need
    if whatYouNeed:
        input +="<p style='font-size:medium'>Das brauchst du:</p>	<ul>"
        for element in whatYouNeed:
            input += '<li>%s</li>' % element
        input += '</ul>'
    if postMessage:
        input += '<p>%s</p>' % postMessage
    input += '</div>'
    return input.replace("'", "\"")

def insertEvent(conn, date, title, image, descriptionIn, starChosen, category, location, numberPeople=None, duration=None, whatYouNeed = [], postMessage= "", testMode = False):

    description = descriptionFromTemplate(descriptionIn, date, location, numberPeople, duration, whatYouNeed, image, postMessage)

    if testMode: # only show preview
        print(f"Test mode for event '{title}.'")
        import webbrowser

        filename = 'web_test/' + title.replace(' ', '') + '.html'
        f = open(filename, 'wb')
        message = description.encode("utf-8")
        f.write(message)
        f.close()
        # Change path to reflect file location
        webbrowser.open_new_tab(filename)

    else:
        print(f"Pushing event '{title}.'")
        #
        cur = conn.cursor()
        cur.execute("SELECT MAX(id) FROM public.rest_browseevent;")
        try:
            idd = cur.fetchall()[0][0] +1
        except:
            idd = 1
        cur = conn.cursor()
        print((str(idd), str(date), str(title), len(str(image)), str(description), starChosen, str(category), str(location)))
        a = cur.execute("INSERT INTO public.rest_browseevent (id, date, title, image, description, \"starChosen\", \"categoryTitle\", location) VALUES (%s, '%s', '%s', '%s', '%s', %s, '%s', '%s');" % (str(idd), str(date), str(title), str(image), str(description), starChosen, str(category), str(location)))
        #print(a)
        #print("Received: " + str(cur.fetchall()))
        conn.commit()
