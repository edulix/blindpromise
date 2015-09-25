/**
 * Creates a new promise.
 *
 * Any anonymous user can create a new promise, and the user is only required to
 * provide a text.
 *
 * The promise will be sent to the server simply as a hash and nothing else. No
 * other information will be revealed even to the server-side. The hash will be
 * calculated in the web browser client of the text "promised-text;randomness".
 * The randomness is used to salt the hash, making very difficult to try to
 * reverse the hash for an attacker with some knownledge of the possible values
 * of the data.
 *
 * The randomness and the data is stored in the web browser session. This way,
 * later on the creator of the promise can reveal both.
 *
 * Once the user submits successfully the promise, the user is redirected to the
 * promise view.
 *
 * @author Eduardo Robles Elvira <edulix AT agoravoting DOT com>
 */
Template.create .events({
  'submit': function(event, template) {
    event.preventDefault();

    // private data
    var data = template.$('[name=data]').val();

    // the randomness is 64 characters, just like sha256
    var randomness = Random.secret(64);

    // hash the data
    var finalData = data + ";" + randomness;
    var hash = SHA256(finalData);

    // save private data
    Session.setPersistent(hash, {data: data, randomness: randomness});

    // register the promise, and once that's done, redirect to it
    Meteor.call("registerPromise", hash, function(error, result) {
      if (error !== undefined) {
        console.log("something happened!");
        console.log(error);
      }

      Router.go('/promise/' + hash);
    });
  }
});
