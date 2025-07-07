#!/bin/bash
cd /home/kavia/workspace/code-generation/noteease-2937-73fd02bf/notes_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

