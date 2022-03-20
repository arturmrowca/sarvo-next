"""

"""


class FreetimeActivity(object):

    def __init__(self):
        #id = models.AutoField(primary_key=True)
        self.type = None # models.CharField(max_length=20, default="unknown") # anytime,
        self.valid_until = None # models.DateTimeField(null=True)
        self.created = None # models.DateTimeField(default=datetime.now, blank=True)

        # Basic information
        self.title = None # models.CharField(max_length=100)
        self.description = None # models.TextField(max_length=1000)
        self.location = None # models.TextField(max_length=1000, blank=True)
        self.activity_duration = None # models.DurationField(null=True, blank=True)
        self.activity_date = None # models.DateTimeField(null=True, blank=True)
        self.image = None # models.ImageField(null=True, blank=True)
        self.video = None # models.FileField(upload_to=settings.MEDIA_ROOT,null=True,

        # category assignment
        self.category_level_1 = None # models.CharField(max_length=100, null=True, blank=True) # can be assigned categories
        self.category_level_2 = None # models.CharField(max_length=100, null=True, blank=True) # can be assigned subcategories

        # Filter information
        self.tags = None # ArrayField(models.CharField(max_length=32, blank=True), null=True, blank=True) # family, active, easy, ...
        self.activity_complexity = None # ArrayField(models.CharField(max_length=32, blank=True), null=True, blank=True) # Komplexitaet (was brauch ich dazu? Ist es weit weg…)

        # Reference to original post
        self.original_url = None # models.URLField(max_length=500, default="", blank=True)
        self.source_name = None # models.CharField(max_length=100, null=True, blank=True) # can be assigned subcategories

