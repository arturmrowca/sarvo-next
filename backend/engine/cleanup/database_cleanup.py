from engine.tools.singleton import Singleton


class DataBaseCleanup(Singleton):

    def __init__(self):
        super().__init__()
        self.mode = None # run mode

    def active(self):
        if self.mode is None:
            return False
        return True

    def run(self):
        if self.mode == "cleanupusers":
            self.cleanup_users()

    def cleanup_users(self):
        """
        Checks for duplicate users in the database and removes those
        :return:
        """
        from django.contrib.auth.models import User
        from rest.models import SarvoUser
        import pandas as pd

        sUserDF = pd.DataFrame([(f.phonenumber, f.name, f.id) for f in SarvoUser.objects.all()],
                     columns=["phone", "name", "id"])
        aUserDF = pd.DataFrame([(u.username, u.id) for u in User.objects.all()], columns = ["phone2", "id2"])

        # duplicates
        duplicates = sUserDF[sUserDF[["phone"]].duplicated()]

        if not duplicates:
            print("No duplicates found")

        # duplicate phone numbers
        for number in list(duplicates["phone"].unique()):
            print("Dropping %s" % str(number))
            elements2 = User.objects.filter(username=number)
            # take first id and only keep it
            id_to_keep = elements2[0].id

            elements = SarvoUser.objects.filter(phonenumber=number)
            for e in elements:
                if e.id == id_to_keep:
                    continue
                e.delete()

            elements = User.objects.filter(username=number)
            for e in elements:
                if e.id == id_to_keep:
                    continue
                e.delete()

    def enable(self, operation):
        if operation in ["cleanupusers"]:
            self.mode = operation##########