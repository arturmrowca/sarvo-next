from free.models import FreetimeActivity
from lib.tools.singleton import Singleton


class MainViewActivityFilter(Singleton):

    def __init__(self):
        self.user = None

    def getActivities(self, currentUser, filterCategory1):
        """
        Main function that shows the Activities to show on the main page to the user
         currentUser: Current User
         filterChosen: List of Categories for filtering
        """
        print("\n\t---->New Request")
        print(currentUser)
        print(filterCategory1)

        # Filter
        if filterCategory1:
            resultSet = FreetimeActivity.objects.filter(category_level_1__iregex=r'(' + '|'.join(filterCategory1) + ')')
        else:
            resultSet = FreetimeActivity.objects.all()
        print(resultSet)

        return self._formatActivities(resultSet)

    def _formatActivities(self, resultSet, n=50):

        for r in resultSet:
            if len(r.description) > n:
                r.description = r.description[:n] +"..."
            #else:
            #    r.description = r.description + ".  "*(n-len(r.description))

        return resultSet