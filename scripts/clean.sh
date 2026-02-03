#!/bin/bash

echo "Pulizia cache Next.js..."

# Rimuove cache e build
rm -rf .next
rm -rf node_modules/.cache

echo "Cache pulita. Riavvia l'app con 'npm run dev'"