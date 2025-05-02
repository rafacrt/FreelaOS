#!/bin/bash

echo "🚀 Iniciando deploy do FreelaOS com Docker..."

# Verifica se docker e docker compose estão instalados
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Abortando."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Abortando."
    exit 1
fi

# Ir para a pasta do projeto
cd "$(dirname "$0")"

# Construir e subir os containers
echo "🔧 Construindo imagens e subindo containers..."
docker compose up -d --build

echo "✅ Deploy concluído com sucesso!"
