# Rovebus Trips Api

## Node Version

This project runs on Node 8.4. Use nvm to install Node 8.

``` 
nvm install 8.4
nvm use 8.4
``` 

## Global Libraries

Install pm2 and mocha globally:
``` 
npm i -g pm2 
npm i -g mocha
```

## Other Dependencies

This project uses a Postgres DB. To run it there is the need to create 2 local databases with public access: external_api and external_api_test

It can be done with the following commands:
``` 
$ psql postgres

postgres=# CREATE DATABASE trips_api;
postgres=# GRANT ALL ON DATABASE trips_api TO PUBLIC;

postgres=# CREATE DATABASE trips_api_test;
postgres=# GRANT ALL ON DATABASE trips_api_test TO PUBLIC;
``` 

## Commands

* Run the application with file watcher using pm2, I use this for development
``` 
$ npm run local
```

* Run the application normally. It will not stop if the app crashes on runtime.
```
$ npm start
```

* Stop the application
``` 
$ npm stop
```

* Run migrations
```
$ npm run migrate
$ npm run migrate_test
``` 

* Run all tests
```
$ npm run test
```

## Environments
...
