#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import warnings
warnings.filterwarnings("ignore")

# Append current working directory
import pathlib
sys.path.append(pathlib.Path(__file__).parent.resolve())

"""import os
from pathlib import Path
path = Path(os.getcwd())
destPath = path.parent.parent.parent.parent.absolute()
import nltk
nltk.data.path = [destPath]"""


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'truv.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    if False:
        print("DISABLED WEBSITE UNTIL - GDPR ISSUE RESOLVED")
    else:
        main()