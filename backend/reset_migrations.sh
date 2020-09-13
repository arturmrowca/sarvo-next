#!/bin/sh

echo ">> Deleting old migrations"
find ./rest -path "*/migrations/*.py" -not -name "__init__.py" -delete
find ./rest -path "*/migrations/*.pyc"  -delete
