# Consensus
Consensus is a simple application for scheduling events. It allows users to anonymously mark their availability for a corresponding event.

## Local setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Compiles and minifies for staging
```
yarn build --mode staging
```

### Run unit tests
```
yarn test:unit
```

### Run end-to-end tests
```
yarn test:e2e
```

### Lints and fixes files
```
yarn lint --fix
```

## Firebase CLI
The [Firebase CLI](https://firebase.google.com/docs/cli) provides a variety of tools for managing, viewing, and deploying to Firebase projects.

### Create CI Token
You can setup continuous integration (and avoid logging into the cli) by using a CI token with all your commands. To generate the token use the following command and follow the corresponding prompts:
```
yarn firebase login:ci
```

There are currently two ways to use this token when running Firebase commands:

1. Store the token as the environment variable FIREBASE_TOKEN and it will automatically be utilized.
2. Run all commands with the --token <token> flag in your CI system.

To revoke access for a specific token use the following command:
```
firebase logout --token <token>
```

For the latest documentation, checkout the [Using with CI Systems](https://github.com/firebase/firebase-tools#using-with-ci-systems) section of the official Github page.

## Authentication
This project uses [Firebase Authentication](https://firebase.google.com/docs/auth) to authenticate users within the app. 

### Setup
Within the Firebase console navigate to **Authentication > Sign-in method** and enable the *anonymous* login method.

## Cloud Firestore
This project uses the [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore) for storing events and user availability information. 

### Setup
Within the Firebase console navigate to **Cloud Firestore** and click the "Create database" button and follow the prompts to create the database. The [firestore.rules](firestore.rules) file contains the database access rules and will be used to configure the project when it is deployed using the firebase-cli.

## Deployments
```bash
yarn build # uses `production` mode by default
yarn firebase deploy --token $FIREBASE_TOKEN --project $FIREBASE_PROJECT_ID
```
**Note**: You will need to manually provision the Cloud Firestore database for the corresponding project before deploying the first time.
**Note**: You will need to manually configure the Authentication sign-in method for the corresponding project before deploying the first time.
