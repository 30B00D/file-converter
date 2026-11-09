# Same tool versions the test suite ran against (Ubuntu 24.04: ImageMagick 6.9.12, ffmpeg 6.1, LibreOffice 24.2, pandoc 3.1.3).
FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates curl gnupg imagemagick ffmpeg pandoc poppler-utils zip unzip tar \
      libreoffice-writer-nogui libreoffice-calc-nogui libreoffice-impress-nogui \
      fonts-noto-core fonts-noto-ui-core fonts-dejavu python3 python3-pip util-linux \
 && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs \
 && pip3 install --no-cache-dir --break-system-packages pillow-heif==1.8.1 \
 && apt-get purge -y curl gnupg && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY public ./public
COPY policy ./policy
COPY scripts/heic2png.py ./scripts/heic2png.py
RUN useradd --system --create-home --uid 10001 converter
USER converter
ENV NODE_ENV=production PORT=8080 WORK_DIR=/tmp/jobs TRUST_PROXY=1
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:8080/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
