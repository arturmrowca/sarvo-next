from engine.tools.singleton import Singleton
import copy
import os
import re

from project.settings import BASE_DIR


class GdprAndUserConsent(Singleton):
    """
    Class that hold current consent information
    User needs to have agreed to this

    The information shown to the user is a list of

    Headertext

    Text-1

    Text-2

    Text-3: link

    Headertext
    ...
    unlimited times - by using booleans for the text fields also 3 similar units can be shown
    """

    def __init__(self):
        self.content = self._current_consent_content()
        self.consent_version = 1 # users that agreed to any lower version than this need to agree to this version

    def _current_consent_content(self):
        """
        Specifies the content to show to the user
        :return:
        """

        path = os.path.join(BASE_DIR, r"rest/views/html/privacy.html")
        content = self.contentListFromHtmlFile(path)

        """
        content = []

        # Passage 1
        header1 = [True, "Nutzungsbedingungen und Datenschutzerklärung"]
        header2 = [False, ""]
        header3 = [False, ""]
        text  = [True, "S'arvo bietet Ihnen die Möglichkeit mehr aus Ihrer Freizeit zu machen. Damit wir unsere Dienste bereitstellen können müssen wir Daten erfassen und verarbeiten. Wir sind dabei stets interessiert Ihre Daten zu schützen und Sie bestmöglich zu informieren. Hierzu haben wir unsere Datenschutzerklärung verfasst. Diese finden Sie  nachfolgend auf dieser Seite. Zudem  stimmen Sie mit der Nutzung unserer App  den Nutzungsbedingungen zu. Diese finden Sie ebenso auf dieser Seite"]

        content += [[header1, header2, header3, text]]

        # Passage 2
        header1 = [True, "Krasser Kram"]
        header2 = [True,
                  "Dies ist ein Test text, mit dem wir die Zustimmung vom User holen wollen. Dies ist ein Test text, mit dem wir die Zustimmung vom User holen wollen. Dies ist ein Test text, mit dem wir die Zustimmung vom User holen wollen. Dies ist ein Test text, mit dem wir die Zustimmung vom User holen wollen. "]
        header3 = [True,
                  "Ein weiterer Infotext mit Info. Ein weiterer Infotext mit Info. Ein weiterer Infotext mit Info. Ein weiterer Infotext mit Info. Ein weiterer Infotext mit Info. Ein weiterer Infotext mit Info. "]
        text = [True, "Link zur Erklärung: " r"https://ionicframework.com/docs/cli/commands/generate"]

        content += [[header1, header2, header3, text]]"""


        return content

    def get_message(self):
        """
        Returns the message to transmit
        """
        return {"version": self.consent_version, "content" : self.content}

    def get_message_version(self):
        """
        Returns the message to transmit
        """
        return {"version": self.consent_version}


    def contentListFromHtmlFile(self, path):
        # Open the file with read only permit
        f = open(path, "r", encoding="utf-8")

        content = []
        currentHeader = ""
        currentText = ""
        currentHeaderType = -1  # can be 1, 2, 3
        header1, header2, header3, text = [False, ""], [False, ""], [False, ""], [False, ""]

        def filterTags(txt):
            """ Filter < and >tags"""

            cleantext = txt.replace("<b>", " - ")

            cleanr = re.compile('<.*?>')
            cleantext = re.sub(cleanr, '', cleantext)

            return cleantext

        for line in f.readlines():

            if str.startswith(line, "<h"):
                if currentHeaderType != -1:
                    # IF multiple paragraphs -> split text to multiple
                    txtParts = currentText.split("<p>")
                    first = True
                    for currentText in txtParts:
                        content += [[copy.deepcopy(header1), copy.deepcopy(header2), copy.deepcopy(header3),
                                     copy.deepcopy(text)]]
                        content[-1][currentHeaderType - 1][1] = currentHeader.split(">")[1].split("<")[0]
                        content[-1][currentHeaderType - 1][0] = first
                        content[-1][3][1] = filterTags(currentText)
                        content[-1][3][0] = True
                        first = False

                currentHeader = line
                currentHeaderType = int(line[2])
                currentText = ""
                continue

            # add text
            currentText += line

        if currentHeaderType != -1:
            # IF multiple paragraphs -> split text to multiple
            txtParts = currentText.split("<p>")
            first = True
            for currentText in txtParts:
                content += [
                    [copy.deepcopy(header1), copy.deepcopy(header2), copy.deepcopy(header3), copy.deepcopy(text)]]
                content[-1][currentHeaderType - 1][1] = currentHeader.split(">")[1].split("<")[0]
                content[-1][currentHeaderType - 1][0] = first
                content[-1][3][1] = filterTags(currentText)
                content[-1][3][0] = True
                first = False

        f.close()

        return content