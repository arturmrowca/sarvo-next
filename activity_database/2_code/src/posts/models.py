from django.db import models

class Post(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100)
    overview = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    mainImage = models.ImageField()

    # post content
    entryText = models.TextField(default="") # entry text of the post
    postTitle = models.CharField(max_length=100, default="") # title of the post
    url = models.CharField(max_length=100, default="")
    region = models.CharField(max_length=100, default="")
    country = models.CharField(max_length=100, default="")

    def __str__(self):
        return self.title


class PostEntry(models.Model):
    post = models.ForeignKey(Post, on_delete=models.deletion.CASCADE, related_name='entries')
    rank = models.IntegerField(default=0)
    title = models.CharField(max_length=100)
    image = models.ImageField()
    imageSourceHref = models.CharField(default="", max_length=1000)
    imageSourceText = models.CharField(default="", max_length=1000)
    infoText = models.TextField(default="")

    def __str__(self):
        return self.title


class MoneyEntry(models.Model):
    user = models.CharField(default="", max_length=100)
    date = models.DateTimeField()
    description = models.CharField(default="", max_length=1000)
    value = models.FloatField(default=0)