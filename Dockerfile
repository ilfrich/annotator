FROM python:3.6

# install nodejs
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs

# install npm
RUN curl -L https://npmjs.org/install.sh | sh

# declare app directory
WORKDIR /app

# copy favicon
RUN mkdir -p static
COPY static/favicon.png ./static

# install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY package.json .
RUN npm i

# copy javascript code
COPY frontend ./frontend
COPY .babelrc .
COPY webpack.config.js .

# install NPM deps and build the frontend
RUN npm run build

# copy python code
COPY api ./api
COPY data ./data
COPY storage ./storage
COPY config.py .
COPY runner.py .

# start server
ENTRYPOINT ["python3"]
CMD ["runner.py"]
