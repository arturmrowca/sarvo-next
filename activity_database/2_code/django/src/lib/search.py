from django.db.models import Q


# NLTK BEIM DOWNLOAD DO!!!!!!
# sudo python -m nltk.downloader -d /home/nltk_data stopwords

def searchQueryPost(postObjectClass, postEntryObjectClass, searchTerm):
    """
    Return result set of querying a post
    :param queryObjectClass:
    :param query:
    :return:
    """
    # Split words
    text_tokens = [s.strip() for s in searchTerm.split(" ")]
    tokens_without_sw = [word.lower() for word in text_tokens if
                         not word in ["in", "at", "on", "for", "things", "do", "to", "up"]]

    # 1. Query whole result is in header - always return POST and if existing relevant POST ENTRY
    result1 = [(p, None) for p in postObjectClass.objects.filter(
        Q(title__icontains=searchTerm) | Q(region__icontains=searchTerm) | Q(country__icontains=searchTerm))]

    # 2. Query whole result is in entry
    result2 = [(p.post, p) for p in postEntryObjectClass.objects.filter(title__icontains=searchTerm)]

    # 3. Query results where most words overlap in header
    results = []
    for word in tokens_without_sw:
        results += [(p, None) for p in postObjectClass.objects.filter(title__icontains=word)]

    # 4. Query results where most words overlap in entry
    resultsB = []
    for word in tokens_without_sw:
        resultsB += [(p.post, p) for p in postEntryObjectClass.objects.filter(title__icontains=word)]

    fin = list(set(result1)) + list(set(result2)) + list(set(results)) + list(set(resultsB))
    fin = list(dict.fromkeys(fin))
    print(fin)
    return fin

    # split words
    """from nltk.corpus import stopwords
    import re
    import nltk
    nltk.data.path.append(r"/home/nltk_data")

    import os
    from pathlib import Path
    path = Path(os.getcwd())
    nltk.download('stopwords', download_dir=r"/home/nltk_data")
    nltk.download('punkt', download_dir=r"/home/nltk_data")
    from nltk.tokenize import word_tokenize

    # Split words
    text_tokens = word_tokenize(searchTerm)
    tokens_without_sw = [word.lower() for word in text_tokens if not word in stopwords.words() and re.sub('[^a-zA-Z]+', '', word)]

    # 1. Query whole result is in header - always return POST and if existing relevant POST ENTRY
    result1 = [(p, None) for p in postObjectClass.objects.filter(Q(title__icontains=searchTerm) | Q(region__icontains=searchTerm) | Q(country__icontains=searchTerm))]

    # 2. Query whole result is in entry
    result2 = [(p.post, p) for p in postEntryObjectClass.objects.filter(title__icontains=searchTerm)]

    # 3. Query results where most words overlap in header
    results = []
    for word in tokens_without_sw:
        results += [(p, None) for p in postObjectClass.objects.filter(title__icontains=word)]

    # 4. Query results where most words overlap in entry
    resultsB = []
    for word in tokens_without_sw:
        resultsB += [(p.post, p) for p in postEntryObjectClass.objects.filter(title__icontains=word)]

    fin = list(set(result1)) + list(set(result2)) + list(set(results)) + list(set(resultsB))
    fin = list(dict.fromkeys(fin))
    print(fin)
    return fin"""
