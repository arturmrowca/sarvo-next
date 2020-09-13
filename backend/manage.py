#!/usr/bin/env python
import os
import sys
import warnings

from engine.cleanup.database_cleanup import DataBaseCleanup


if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")

    from django.core.management import execute_from_command_line

    # additional commands
    if False: # Do cleanups
        warnings.warn("Cleaning up users -> disable ")
        DataBaseCleanup().enable("cleanupusers") # remove duplicate users

    execute_from_command_line(sys.argv)



