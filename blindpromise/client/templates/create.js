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

var getPromises = function(key) {
  Session.setDefaultPersistent(key, []);
  var promises = Session.get(key);
  return _.map(promises, function(hash) {
      var promise = Session.get(hash);
      if (promise !== undefined) {
        promise.hash = hash;
      }
      return promise;
    });
};

Template.create.helpers({
  privatePromises: function() { return getPromises("privatePromises"); },

  hasPrivatePromises: function() {
    return getPromises("privatePromises").length > 0;
  },

  publicPromises: function() { return getPromises("publicPromises"); },

  hasPublicPromises: function() {
    return getPromises("publicPromises").length > 0;
  }
});

Template.create.events({
  'submit': function(event, template) {
    event.preventDefault();

    // private data
    var data = template.$('[name=data]').val().replace(/[\n\t]/g, " ");

    // the randomness is 64 characters, just like sha256
    var randomness = Random.hexString(64);

    // hash the data
    var finalData = data + ";" + randomness;
    var hash = CryptoJS.SHA256(finalData).toString();

    // save private data
    Session.setPersistent(hash, {data: data, randomness: randomness});

    // we also save a list of our promises to be able to list them
    Session.setDefaultPersistent("privatePromises", []);
    var privatePromises = Session.get("privatePromises");
    privatePromises.push(hash);
    Session.setPersistent("privatePromises", privatePromises);

    // register the promise, and once that's done, redirect to it
    Meteor.call("registerPromise", hash, function(error, result) {
      if (error !== undefined) {
        console.log("something happened!");
        console.log(error);
      }

      Router.go('/promise/' + hash);
    });
  },

  'click .clear-public': function(event, template) {
    Session.clear("publicPromises");
  },

  'click .clear-private': function(event, template) {
    Session.clear("privatePromises");
  }
});
