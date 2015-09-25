Meteor.methods({

  /**
   * Inserts a new promise, only registering the hash.
   */
  registerPromise: function (hash) {
    try {
      Promises.insert({
        hash: hash,
        released: false
      });
    } catch(e) {
      throw new Meteor.Error("not-authorized");
    }
  },

  /**
   * Releases a Promise, adding the promise verification data.
   */
  releasePromise: function(hash, data, randomness) {
    try {
      // hash the data
      var finalData = data + ";" + randomness;
      var calculatedHash = SHA256(finalData);

      // NOTE: even though we are comparing hashes, we don't need to use a
      // constant time comparison for security because the saved hash is not
      // secret
      var promise = Promises.findOne({hash: hash, released: false});
      console.log(promise);
      console.log(finalData);
      console.log(calculatedHash);
      console.log(hash);
      if (promise === undefined || calculatedHash != hash) {
        throw new Meteor.Error("not-authorized");
      }

      Promises.update(
        {hash: hash, released: false},
        {
          $set: {
            data: data,
            randomness: randomness,
            released: true
          }
        });

    } catch(e) {
      console.log(e);
      throw new Meteor.Error("not-authorized");
    }
  }
});
