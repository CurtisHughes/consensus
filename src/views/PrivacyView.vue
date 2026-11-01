<template>
  <main>
    <h1>Privacy</h1>
    <p>
      Consensus doesn't ask for your name, email, or password. Here's what it does keep, and why.
    </p>

    <h2>Anonymous account</h2>
    <p>
      The first time you create or open a poll, Firebase Authentication gives your browser a random
      anonymous ID. It's stored in your browser so your votes stay yours when you come back.
      Clearing your browser data removes it.
    </p>

    <h2>Polls and votes</h2>
    <p>
      The polls you create and the dates you pick are stored in Google Cloud Firestore, linked to
      your anonymous ID. Anyone with a poll's link can see its name, description, and vote counts.
      You can remove your own votes at any time by tapping the day again.
    </p>

    <h2>Analytics</h2>
    <p>
      Google Analytics for Firebase records which pages are viewed, actions like creating a poll or
      voting, and errors, along with your anonymous ID. This helps fix bugs and improve the app.
    </p>

    <h2>Questions</h2>
    <p>
      Open an issue on
      <a href="https://github.com/CurtisHughes/consensus/issues" target="_blank" rel="noopener">
        GitHub</a
      >.
    </p>

    <router-link :to="{ name: 'home' }">Back to home</router-link>
  </main>
</template>

<style scoped lang="scss">
main {
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 30px 60px;

  h2 {
    font-size: 18px;
    margin-top: 1.5em;
  }

  p {
    color: var(--secondary-font-color, #2c3e508a);
    line-height: 1.6;
  }

  a {
    color: var(--app-color, #ff8a8a);
  }
}
</style>
