import shutil
import sys
import pandas as pd

from posts.models import Post, PostEntry
import random
from django.core.files.images import ImageFile
from truv.settings import MEDIA_ROOT
import os
from pathlib import Path


def fill_main():


    ########################################################################
    # Auto fill entries from list
    ########################################################################
    if True:
        ####################################################################
        # INPUT FILE
        region = "las_vegas"
        AI_GENERSTED = False
        shuffle_rank = False # reads rank from predefined ranking
        regionPath = r"C:\scraped\all_content_%s_prepared_merged.parquet" % str(region)
        ####################################################################

        print("\n\n--------------- WRITE MODE ---------------\n")

        # Generate Entry
        df = pd.read_parquet(regionPath)
        originalRegion = region

        # Create new post
        newPost = Post.objects.create()

        # Generate Title
        possibleImages = []
        if shuffle_rank:
            df = df.sample(frac=1)
        for i in range(len(df)):
            titles = df.iloc[i]["mergeTitle"]
            texts = df.iloc[i]["mergeText"]
            categories = df.iloc[i]["mergeCategory"]
            attractions = df.iloc[i]["mergeAttraction"]
            region = df.iloc[i]["mergeRegion"]
            image = df.iloc[i]["imgPath"]
            imageHref = df.iloc[i]["imgHref"]
            imageSource = df.iloc[i]["imgSource"]

            # Put this into the database
            entry = PostEntry.objects.create(post_id=newPost.id)
            entry.rank = i + 1
            entry.title = df.iloc[i]["titleToUse"] #random.choice(titles).replace("Wikipedia: ", "")

            informationText = ""
            for k in range(len(texts)):
                title = titles[k]
                attraction = attractions[k]
                category = categories[k]
                text = str(texts[k]) #<br>

                metaInfo = "\n\n(Title: %s, Element: %s, Category: %s)\n" % (str(title), str(attraction), str(category))

                if len(texts) > 1 or not AI_GENERSTED:
                    whole = metaInfo + text
                    informationText += "\n"
                    informationText += whole
                else:
                    informationText = text

            entry.infoText = informationText

            # ADD IMAGE
            if image:
                # move to media root
                imgDest = os.path.join(MEDIA_ROOT, Path(image).name)
                shutil.copy(image, imgDest)

                entry.image = Path(image).name#ImageFile(open(imgDest, "rb"))
                possibleImages += [entry.image]
                entry.imageSourceHref = imageHref
                entry.imageSourceText = imageSource
            else:
                entry.image = "default.jpg"
                entry.imageSourceHref = "No Picture Found"
                entry.imageSourceText = "Change Manually"
            print("-> Write %s %s" % (str(entry.title), str(possibleImages)))
            entry.save()

        # add post information
        print("------------")
        print(possibleImages)
        print("------------")
        newPost.title = originalRegion.replace("_", " ").capitalize()
        newPost.overview = df["overview_text"].iloc[0] if "overview_text" in df.columns else "Some entry Text"
        newPost.mainImage = random.choice(possibleImages) if possibleImages else "default.jpg"

        # post content
        newPost.entryText = df["entry_text"].iloc[0] if "entry_text" in df.columns else "Some entry Text"  # entry text of the post
        newPost.postTitle = str(len(df)) + " Best Things to do in " + newPost.title
        newPost.url = "best-things-to-do-in-%s" % region.replace(" ", "-")
        newPost.region = df["region"].iloc[0] if "region" in df.columns else "<UNKNOWN>"
        newPost.country = df["country"].iloc[0] if "country" in df.columns else "<UNKNOWN>"
        newPost.save()

        print("Stored new Post")
    sys.exit(0)