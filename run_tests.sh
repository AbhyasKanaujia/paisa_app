#!/bin/bash
pytest tests -q --maxfail=1 --disable-warnings --cov=src --cov=tests --cov-branch
