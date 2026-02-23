#!/bin/bash

# Entra na pasta assets onde as fotos estão
cd assets || { echo "Pasta assets não encontrada!"; exit 1; }

# Habilita nullglob para evitar erros se não houver arquivos de alguma extensão
shopt -s nullglob

count=1
# Itera sobre os arquivos (o shell lida com os espaços nos nomes automaticamente aqui)
for file in *.jpg *.jpeg *.png *.webp *.JPG *.JPEG *.PNG; do
    if [ -f "$file" ]; then
        # Renomeia o arquivo atual (ex: "WhatsApp Image...") para foto1.jpg, foto2.jpg...
        mv "$file" "foto${count}.jpg"
        ((count++))
    fi
done

echo "Pronto! Fotos dentro de 'assets' foram renomeadas para o padrão do site."