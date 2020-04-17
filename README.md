# The Annotator

General purpose tool to create image annotations for machine learning purposes. The system supports single images and 
 frame sets (provided as zip file).
 
Annotations can be downloaded as JSON file and used in machine learning tools to train image analytic models. 

**Table of Contents**

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Docker Service](#docker-service)
4. [Running the App](#running-the-app)
6. [Environment Config](#environment-config)
5. [Tech Stack](#tech-stack)

**Quick Start**

If you just want to run the Annotator, the easiest way is Docker:

1. Simply download the file: https://github.com/ilfrich/annotator/blob/master/docker-compose.yml
2. And run `docker-compose up` - _this will download all required docker images and start up the system_

_Note: images and the database with annotations are retained when you shut down the system_

**Project Overview**

![Project Overview](documentation/project_view.png)

**Single Image Annotations**

![Image Annotation](documentation/image-annotation.png)

## Requirements

- Python3.6+
- NodeJS / npm
- MongoDB (Docker or Native)

**Or** run the entire solution as [docker service](#docker-service)

## Installation

**If you decide to run the solution in Docker only, you can skip this section and go directly to
 [docker service](#docker-service)**

> **Before you start the installation and run the app, you need to prepare the `.env` file. Simply copy the 
`.env.template` file to get started:**
> `cp .env.template .env`
> Then you can edit this file, which won't be committed to GIT to adjust to your local setup and requirements. 
> Please see the [Environment Config](#environment-config) section for more details. 

First, try to run:

```bash
make install-deps
```

That should install the Python (pip) dependencies and Javascript (npm) dependencies.
This assumes, that your Python/Pip binaries are `python3` and `pip3`.

**Manual Installation**

If above doesn't work or shows errors, install the dependencies separately:

_Javascript dependencies:_

```bash
npm install
``` 

_Python dependencies:_

```bash
pip install -r requirements.txt
```

## Docker Service

You can run the whole solution as docker environment.

**Build**

- Run `docker build -t ilfrich/annotator .` (ensure the build finishes successful)

**Start**

- Run `docker-compose up` - this will download the MongoDB image, if you don't already have it, and run MongoDB + the 
 just built container containing the annotator app.

## Running the App

Regardless of whether you run the app as [docker service](#docker-service) or standalone (see below), the app will be
available at http://localhost:5555

### Frontend

If you just want to compile the frontend once and then serve it via the backend (i.e. production mode), simply run:

```bash
npm run build
```

This will produce an index.js containing all the frontend code in the `/static` directory and put the index.html in the 
`/templates` folder. Those 2 directories are used by the Flask app to deliver the frontend components.

### Database

MongoDB can either be run locally as native database or via docker through `docker-compose`.

**Option 1: Native MongoDB**

If you have MongoDB installed on your local, simply adjust the `.env` file and use: 

```
MONGO_URL=mongodb://localhost:27017
```

If your local database uses a custom username and password, simply include them in the URL:

```
MONGO_URL=mongodb://myusername:mypassword@localhost:27017
```

**Option 2: MongoDB through Docker**

If you don't want to install MongoDB on your local, simply install **docker** (and **docker-compose**). Then you adjust 
the `.env` file and use:
 
```
MONGO_URL=mongodb://annotator:annotator@localhost:27018
```
 
To start the database docker container only use:

```bash
docker-compose -f docker-compose-db.yml up
``` 

The database will be persisted between shutdown / startup.

### Backend

The backend's entry point is the script `runner.py` on the root of the project. To run the backend, simply execute:

```bash
make start
```

Again, if you Python binary differs from `python3`, simply run:

```bash
python runner.py
```

(and replace `python` with whatever you use as binary)

- This'll serve the Flask app via: http://localhost:5555

**Frontend Development**

The frontend can be continuously re-compiled whenever you change the code.
In a separate bash window, simply run:

```bash
make frontend
```

Or

```bash
npm run hot-client
```

This will run the `webpack` watcher, which will observe the `/frontend/src` folder for changes and re-compile the 
frontend when changes have occurred. 

In case of compilation errors, this bash window will also tell you what is wrong 
with your code. 

_Do not close this window while you're developing, or you quit the watcher._

## Environment Config

The Flask app is using an `.env` file to load environment variables which specify database access.
Check the `config.py` for all currently supported environment variables.

**Essential configuration:**

- **`MONGO_URL`** specifies the database access (host, port and credentials)
- **`MONGO_DB`** specifies the database name
- **`IMAGE_FOLDER`** specifies the folder where to store the images (Note: they get stored in a sub-directory for each 
project). Default: `_images`

Developers: You can easily extend this and add getters for additional environment configuration and add those to your 
`.env` file. Please provide meaningful defaults for all additional config variables (_except 3rd party service 
 credentials_)

## Tech Stack

**Backend**

- **Flask** framework for hosting API endpoints and delivering the frontend
- **pymongo** for MongoDB access

**Frontend**

- **React** basic framework for the frontend
- **Redux** a global store for the frontend, used for data exchange with the API and to avoid handing down data through
component hierarchies
- **Webpack** and **Babel** to transpile the frontend into a single `index.js`, which gets included by the `index.html`
- **Moment.JS** the standard library for date/time handling in JavaScript
- **S Alert** a basic notification library 
- **ESLint** and **Prettier** for linting Javascript code and auto-format
