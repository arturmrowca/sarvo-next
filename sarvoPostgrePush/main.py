import pandas as pd
import os
from push_events import generate_push_event

if __name__ == "__main__":

    event_content = pd.read_csv("events_source.csv", sep=";").fillna("")
    event_content_push = event_content#.loc[event_content['push']]

    for i in event_content_push.index:
        print("pushing %s" % str(event_content_push.loc[i,'title']))
        try:
            generate_push_event(date=event_content_push.loc[i,'date'],
                            title=event_content_push.loc[i,'title'],
                            image_name=event_content_push.loc[i,'image'],
                            descriptionIn=event_content_push.loc[i,'descriptionIn'],
                            starChosen=event_content_push.loc[i,'starChosen'],
                            category=event_content_push.loc[i,'category'],
                            location=event_content_push.loc[i,'location'],
                            numberPeople=event_content_push.loc[i,'numberPeople'],
                            duration=event_content_push.loc[i,'duration'],
                            whatYouNeed=event_content_push.loc[i,'whatYouNeed'].split('; '),
                            postMessage=event_content_push.loc[i,'postMessage'],
                            testMode=event_content_push.loc[i,'testMode'])
        except:
            print("->Failed")


        
