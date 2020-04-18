
module.exports.models = {

  schema: true,

  migrate: 'drop',

  attributes: {
    id: { type: 'string', columnName: '_id', },
    createdAt: { type: 'number', autoCreatedAt: true, },
    updatedAt: { type: 'number', autoUpdatedAt: true, },
  },

};
