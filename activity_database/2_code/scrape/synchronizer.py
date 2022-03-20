

class Synchronizer(object):

    def __init__(self, connectors):

        # List of connectors to run update on
        self._connectors = connectors

    def runUpdate(self):

        for connector in self._connectors:
            connector.run_update()