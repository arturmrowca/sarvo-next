from connectors.abstract_connector import AbstractConnector


class MuenchenMitVergnuegen(AbstractConnector):

    def __init__(self):
        AbstractConnector.__init__(self)

    def runUpdate(self):
        pass


    def __str__(self):
        return "München mit Vergnügen"


