function createFirebaseToken(spotifyID) {
  // The uid we'll assign to the user.
  const uid = `${spotifyID}`;

  // Create the custom token.
  return firebase.auth().createCustomToken(uid);
}