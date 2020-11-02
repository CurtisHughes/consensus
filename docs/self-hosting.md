# Self Hosting
You can fork this repository and host your own instance of Consensus by performing the following steps (NOTE: This documentation assumes you already have a valid version of [Node](https://nodejs.org/en/) installed (^v12.14) and have installed the dependencies for this repository):
1. Create a new firebase project
2. Update the environment variable files with your project configuration
3. Setup anonymous authentication within the project
4. Create a Cloud Firestore within the project
5. Login or create a continuous integration token for the firebase cli
6. Build and Deploy

## 1. Create a new firebase project 
Consensus uses firebase for authentication, analytics, hosting, and data storage. In order to host your own instance of the application you will need to create a project within your account to handle all of these items. Head over to the [Firebase console](https://console.firebase.google.com/) and click "Add Project". Then pick a name and select the default prompts to setup the project. 

## 2. Update the environment variable files with your project configuration
Once you have created a new firebase project, you will need to modify the environment files within this repository. Open the two environment files ([.env.development](../.env.development) and [.env.production](../.env.production)) and replace the VUE_APP_FIREBASE_* values with the corresponding values from your project settings.
NOTE: You will need to create a new App to view the appId and measurementId values.

## 3. Setup anonymous authentication within the project
This project uses [Firebase Authentication](https://firebase.google.com/docs/auth) to authenticate users within the app. Within the Firebase console navigate to **Authentication > Sign-in method** and enable the *anonymous* login method.

## 4. Create a Cloud Firestore instance within the project
This project uses the [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore) for storing events and user availability information. Within the Firebase console navigate to **Cloud Firestore** and click the "Create database" button and follow the prompts to create the database. The [firestore.rules](firestore.rules) file contains the database access rules and will be used to configure the project when it is deployed using the firebase-cli.

## 5. Login or create a continuous integration token for the firebase cli
The [Firebase CLI](https://firebase.google.com/docs/cli) provides a variety of tools for managing, viewing, and deploying to Firebase projects. You can setup continuous integration (and avoid logging into the cli) by using a CI token with all your commands. To generate the token use the following command and follow the corresponding prompts:
```
yarn firebase login:ci
```

There are currently two ways to use this token when running Firebase commands:

1. Store the token as the environment variable FIREBASE_TOKEN and it will automatically be utilized.
2. Run all commands with the --token <token> flag in your CI system.

To revoke access for a specific token use the following command:
```
yarn firebase logout --token <token>
```

For the latest documentation, checkout the [Using with CI Systems](https://github.com/firebase/firebase-tools#using-with-ci-systems) section of the official Github page.

## Build and Deploy
```bash
yarn install
yarn build # uses --mode production and the corresponding `.env.production` file by default
yarn firebase deploy --token $FIREBASE_TOKEN --project $FIREBASE_PROJECT_ID
```
**Note**: You will need to manually provision the Cloud Firestore database for the corresponding project before deploying the first time.

**Note**: You will need to manually configure the Authentication sign-in method for the corresponding project before deploying the first time.
