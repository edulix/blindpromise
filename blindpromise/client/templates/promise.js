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
Template.promise.helpers({
  createdAgo: function() {
    console.log("createdAgo, createdAt=");
    console.log(this.createdAt);
    return moment(this.createdAt).from(moment());
  },

  releasedAgo: function() {
    return moment(this.releasedAt).from(moment());
  },

  canRelease: function() {
    return !this.released && !Session.equals(this.hash, undefined);
  }
});

Template.promise.events({
  'click .release': function(event, template) {
    event.preventDefault();

    var secrets = Session.get(this.hash);
    Meteor.call("releasePromise", this.hash, secrets.data, secrets.randomness);
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
