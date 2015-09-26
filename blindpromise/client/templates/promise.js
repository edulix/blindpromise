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

  canRelease: function() {
    return !this.released && !Session.equals(this.hash, undefined);
  }
});

Template.promise.events({
  'click .release': function(event, template) {
    event.preventDefault();

    var secrets = Session.get(this.hash);
    var hash = this.hash;
    Meteor.call("releasePromise", this.hash, secrets.data, secrets.randomness,
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
  },

  'click .create-link': function(event, template) {
      Router.go('/');
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
  }
});
