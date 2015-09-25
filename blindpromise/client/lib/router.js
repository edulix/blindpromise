Router.configure({ layoutTemplate: 'AppLayout' });

Router.route('/', {template: "create"});

Router.route(
  '/promise/:_hash',
  function() {

    console.log("locating hash = ");
    console.log(this.params._hash);
    var promise = Promises.findOne({hash: this.params._hash});
    console.log(promise);

    if (promise === undefined) {
      console.log("undefined promise");
      return;
    }

    console.log("promise loaded");
    this.render('promise', {
      data: function () {
        return promise;
      }
    });
  }
);