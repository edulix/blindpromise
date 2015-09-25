Schemas = {};
/**
 * Promise collection.
 *
 * Holds the necesary information related to a promise.
 */
Promises = new Mongo.Collection('promises');
Schemas.Promise = new SimpleSchema({
  // the hash is the only data provided by the user when regisering a promise
  hash: {
    type: String,
    max: 64,
    index: true,
    unique: true
  },

  // data is optional because is only set when the promise is released
  data: {
    type: String,
    max: 1024*256,
    optional: true
  },

  // randomness is optional because is only set when the promise is released
  randomness: {
    type: String,
    max: 64,
    optional: true
  },

  // indicates if the data and randomness are set
  released: {
    type: Boolean
  },

  // creation time, it's set automatically on insert
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
  },

  // release time, it's set to now automatically on any update, because the
  // model is only updated once: when the promise is released
  releasedAt: {
    type: Date,

  // Force value to be current date (on server) upon update
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
  // don't allow it to be set upon insert.
    denyInsert: true,
    optional: true
  }
});
Promises.attachSchema(Schemas.Promise);
