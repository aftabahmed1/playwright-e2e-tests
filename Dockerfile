FROM mcr.microsoft.com/playwright:v1.48.1-noble

RUN mkdir -p /app
WORKDIR /app
COPY . /app/

RUN npm install --force
RUN npx playwright install
