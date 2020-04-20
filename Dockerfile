FROM python:3.6

# install nodejs
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs

# install npm
RUN curl -L https://npmjs.org/install.sh | sh

# declare app directory
WORKDIR /app

# copy python code
COPY api ./api
COPY data ./data
COPY storage ./storage
COPY config.py .
COPY runner.py .
COPY requirements.txt .

# copy javascript code
COPY frontend ./frontend
COPY .babelrc .
COPY package.json .
COPY webpack.config.js .

# install dependencies
RUN pip install -r requirements.txt

# install NPM deps and build the frontend
RUN npm i && npm run build

# start server
ENTRYPOINT ["python3"]
CMD ["runner.py"]
