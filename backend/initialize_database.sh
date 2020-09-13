#!/usr/bin/env bash

python3 manage.py makemigrations rest
python3 manage.py migrate 
