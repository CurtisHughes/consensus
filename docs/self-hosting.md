# Self Hosting
You can fork this repository and host your own instance of Consensus by performing the following steps (NOTE: This documentation assumes you already have [Node](https://nodejs.org/en/) 26 installed and have installed the dependencies for this repository with `npm install`):
1. Create a new firebase project
2. Update the environment variable files with your project configuration
3. Setup anonymous authentication within the project
4. Create a Cloud Firestore within the project
5. Authenticate the firebase cli
6. Build and Deploy

## 1. Create a new firebase project 
Consensus uses firebase for authentication, analytics, hosting, and data storage. In order to host your own instance of the application you will need to create a project within your account to handle all of these items. Head over to the [Firebase console](https://console.firebase.google.com/) and click "Add Project". Then pick a name and select the default prompts to setup the project. 

## 2. Update the environment variable files with your project configuration
Once you have created a new firebase project, you will need to modify the environment files within this repository. Open the two environment files ([.env.development](../.env.development) and [.env.production](../.env.production)) and replace the `VITE_FIREBASE_*` values with the corresponding values from your project settings.
NOTE: You will need to create a new App to view the appId and measurementId values.

These values are bundled into the client and are not secrets; access to your data is controlled by the [firestore.rules](../firestore.rules) file.

## 3. Setup anonymous authentication within the project
This project uses [Firebase Authentication](https://firebase.google.com/docs/auth) to authenticate users within the app. Within the Firebase console navigate to **Authentication > Sign-in method** and enable the *anonymous* login method.

## 4. Create a Cloud Firestore instance within the project
This project uses the [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore) for storing events and user availability information. Within the Firebase console navigate to **Cloud Firestore** and click the "Create database" button and follow the prompts to create the database. The [firestore.rules](../firestore.rules) file contains the database access rules and will be used to configure the project when it is deployed using the firebase-cli.

## 5. Authenticate the firebase cli
The [Firebase CLI](https://firebase.google.com/docs/cli) is installed as a dev dependency. For deploying from your own machine, log in interactively:
```
npx firebase login
```

For continuous integration, use a service account instead (`firebase login:ci` tokens are deprecated):
1. In the [Google Cloud console](https://console.cloud.google.com/iam-admin/serviceaccounts) for your project, create a service account with the **Firebase Hosting Admin**, **Firebase Rules Admin**, **Cloud Datastore Index Admin**, and **API Keys Viewer** roles. Running `npx firebase init hosting:github` will also create one for you, with the Hosting roles only.
2. Create a JSON key for the service account.
3. Add the full JSON contents as a repository secret named `FIREBASE_SERVICE_ACCOUNT` (**Settings > Secrets and variables > Actions**).
4. Replace `consensus-fcf99` with your project ID in [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) and [.github/workflows/preview.yml](../.github/workflows/preview.yml).

With the secret in place, the GitHub Actions workflows will:
- run lint, formatting, unit tests, and a build on every pull request,
- deploy a temporary preview channel for pull requests opened from this repository, and
- deploy hosting and Firestore rules/indexes on every push to `main`.

## 6. Build and Deploy
```bash
npm install
npm run build # uses --mode production and the corresponding `.env.production` file by default
npx firebase deploy --project $FIREBASE_PROJECT_ID
```
**Note**: You will need to manually provision the Cloud Firestore database for the corresponding project before deploying the first time.

**Note**: You will need to manually configure the Authentication sign-in method for the corresponding project before deploying the first time.
