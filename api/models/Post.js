
module.exports = {
  attributes: {
    content: {
      type: 'string',
      required: true,
      maxLength: 280,
      minLength: 1,
    },
  },

  /**
   * Helper used to craft some basic test data.
   */
  async seedTestData() {
    // Destroy any existing posts...
    await Post.destroy({});

    // Create some fresh new posts...
    await Post.createEach([
      { content: 'Hello World!' },
      { content: 'Testing 123.' },
      { content: 'Testing 456.' },
      { content: 'Testing 789.' },
    ]);
  },
};
