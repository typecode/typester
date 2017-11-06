FROM node:6.9

RUN mkdir -p /app
WORKDIR /app

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y locales && \
    sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    echo 'LANG="en_US.UTF-8"'>/etc/default/locale && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8 && \
    npm install -g yarn

ENV LANG en_US.UTF-8

COPY package.json .

RUN wget -N https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -P ~/ && \
    dpkg -i --force-depends ~/google-chrome-stable_current_amd64.deb; \
    apt-get -f install -y && \
    dpkg -i --force-depends ~/google-chrome-stable_current_amd64.deb && \
    apt-get install -y iceweasel && \
    apt-get install -y xvfb && \
    yarn install --modules-folder /node_modules
