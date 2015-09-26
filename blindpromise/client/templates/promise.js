/**
 * Shows a promise.
 *
 * If the promise has not been released, it just shows a hash (included in the
 * url) and creation date, which is the only data stored in the server at that
 * moment.
 *
 * If the promise has been released, the data and the randomness and the
 * release date are shown, along with instructions for verifying the hash
 * with external tools.
 *
 * If the promise is not yet released and the visitor is the creator, a
 * "release" action button is shown.
 *
 * @author Eduardo Robles Elvira <edulix AT agoravoting DOT com>
 */
// Implement bash string escaping.
var safePattern =    /^[a-z0-9_\/\-.,?:@#%^+=\[\]]*$/i;
function bashEscape(arg) {
  // These don't need quoting
  if (safePattern.test(arg)) return arg;

  // Otherwise use strong escaping with single quotes
  return arg.replace(/'+/g, function (val) {
    // But we need to interpolate single quotes efficiently

    // One or two can simply be '\'' -> ' or '\'\'' -> ''
    if (val.length < 3) return "'" + val.replace(/'/g, "\\'") + "'";

    // But more in a row, it's better to wrap in double quotes '"'''''"' -> '''''
    return "'\"" + val + "\"'";

  });
}

function canRelease() {
  return !this.released && !Session.equals(this.hash, undefined);
}

function canForget() {
  Session.setDefaultPersistent("publicPromises", []);
  var publicPromises = Session.get("publicPromises");

  Session.setDefaultPersistent("privatePromises", []);
  var privatePromises = Session.get("privatePromises");

  // check that we can forget it
  return (publicPromises.indexOf(this.hash) !== -1 || privatePromises.indexOf(this.hash) !== -1);
}

Template.promise.helpers({
  createdAgo: function() {
    return moment(this.createdAt).from(moment());
  },

  releasedAgo: function() {
    return moment(this.releasedAt).from(moment());
  },

  dataPrivate: function() {
    return Session.get(this.hash).data;
  },

  randomnessPrivate: function() {
    return Session.get(this.hash).randomness;
  },

  escapedFinalData: function() {
    var finalData = this.data + ";" + "" + this.randomness;
    return bashEscape(finalData);
  },

  escapedFinalDataPrivate: function() {
    var priv = Session.get(this.hash);
    var finalData = priv.data + ";" + "" + priv.randomness;
    return bashEscape(finalData);
  },

  canRelease: canRelease,
  canForget: canForget
});

Template.promise.events({
  'click .release': function(event, template) {
    event.preventDefault();

    var secrets = Session.get(this.hash);
    var hash = this.hash;

    BootstrapModalPrompt.prompt({
      title: TAPi18n.__("confirm release"),
      content: TAPi18n.__("confirm release content") + secrets.data,
      btnOkText: TAPi18n.__("confirm release button")
    }, function(result) {
      if (result) {
        Meteor.call("releasePromise", hash, secrets.data, secrets.randomness,
          function(error, ret) {
            if (error !== undefined) {
              return;
            }

            // remove from private
            Session.setDefaultPersistent("privatePromises", []);
            var privatePromises = Session.get("privatePromises");
            privatePromises.splice(privatePromises.indexOf(hash), 1);
            Session.setPersistent("privatePromises", privatePromises);

            // add to public
            Session.setDefaultPersistent("publicPromises", []);
            var publicPromises = Session.get("publicPromises");
            publicPromises.push(hash);
            Session.setPersistent("publicPromises", publicPromises);
          }
        );
      }
    });
  },

  'click .selectall': function(event, template) {
    function selectElementContents(el) {
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    selectElementContents(event.target);
  },

  'click .forget-link': function(event, template)
  {
    var publicPromises = Session.get("publicPromises");
    var privatePromises = Session.get("privatePromises");
    console.log("publicPromises = ");
    console.log(publicPromises);
    console.log("privatePromises = ");
    console.log(privatePromises);

    var hash = this.hash;
    var released = this.released;
    var publicHashIndex = publicPromises.indexOf(hash);
    var privateHashIndex = privatePromises.indexOf(hash);

    // check that we can forget it
    if (publicHashIndex === -1 && privateHashIndex === -1) {
      console.log("hash not found");
      return;
    }

    BootstrapModalPrompt.prompt({
      title: TAPi18n.__("confirm forget"),
      content: TAPi18n.__("confirm forget content"),
      btnOkText: TAPi18n.__("confirm forget button")
    }, function(result) {
      if (result) {
        console.log("forgetting");
        if (released) {
          console.log("released, so removing from publicPromises");
          console.log(publicPromises);
          publicPromises.splice(publicHashIndex, 1);
          Session.setPersistent("publicPromises", publicPromises);
          console.log(publicPromises);
        } else {
          console.log("not released, so removing from privatePromises");
          console.log(privatePromises);
          privatePromises.splice(privateHashIndex, 1);
          Session.setPersistent("privatePromises", privatePromises);
          console.log(privatePromises);
        }
      }
    });
  }
});
