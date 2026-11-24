FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Só o que o `next dev` usa: copiar o contexto inteiro arrastaria para a imagem o que o .dockerignore esquecer.
COPY app ./app
COPY components ./components
COPY hooks ./hooks
COPY lib ./lib
COPY types.ts next.config.mjs postcss.config.mjs tailwind.config.ts tsconfig.json ./

EXPOSE 3000

CMD ["npm", "run", "dev"]
