
/**
 * @file queryTest.js
 * @description Quick little script which attempts to demonstrate problems which arise
 * when using certain query comparison operators together with document IDs.
 *
 * My apologies for the rudimentary form here. Normally Jest or another proper testing
 * framework would be used, though such has been forgone to keep the repo as light and
 * plain as possible.
 */

/* global Post */

const assert = require('assert');
const Sails = require('sails').constructor;

const app = new Sails();

/**
 * Attempts to determine whether or not Waterline supports querying with document IDs when
 * using certain comparison operators.
 *
 * This test is geared towards testing the behaviour of `sails-mongo` and may fail given a
 * different adapter (or one which utilises non-string IDs).
 */
async function queryTest() {
  // Seed with test data...
  await Post.seedTestData();

  // Try and fetch all our posts...
  // It's very important that these are in ascending order.
  const allPosts = await Post.find().sort('id ASC');

  // Log data for illustrative purposes.
  app.log.debug('Found', allPosts.length, 'posts:');
  for (const post of allPosts) {
    app.log.debug(` - id: ${post.id}, content: "${post.content}"`);
  }

  // We should absolutely have 4 items returned.
  assert.strictEqual(allPosts.length, 4, `Expected 4 records to be returned but found ${allPosts.length} instead.`);
  app.log.debug('[OK] Correct number of documents returned.');

  // Ensure our posts are truly in ascending order.
  assert(allPosts[0].id.localeCompare(allPosts[1].id) < 0, 'Expected the first post to have an ID preceding the second.');
  assert(allPosts[1].id.localeCompare(allPosts[2].id) < 0, 'Expected the second post to have an ID preceding the third.');
  assert(allPosts[2].id.localeCompare(allPosts[3].id) < 0, 'Expected the third post to have an ID preceding the fourth.');
  app.log.debug('[OK] Post IDs appear to be in ascending order.');

  // Given all the above conditions have passed, we ought to be able to retrieve the posts
  // following our first post in ascending order by simply selecting those with greater ID
  // values.
  const followingPosts = await Post.find({
    id: { '>': allPosts[0].id },
  }).sort('id ASC');

  // Ensure we've successfully retrieved the 3 posts following the first one.
  // This will fail given sails-mongo v1.1.0.
  assert.strictEqual(followingPosts.length, 3, `Expected 3 records to be returned following the first post but found ${followingPosts.length} instead.`);
  // Ensure our returned posts maintain correct structure.
  assert.deepStrictEqual(followingPosts, allPosts.slice(1));
  app.log.debug('[OK] Successfully retrieved posts following the first.');

  app.log.info('Query test has succeeded!');
}

app.load((err) => {
  // Handle logging and exiting early if we've an error.
  if (err) {
    console.error('Failed to load Sails app:', err);
    return;
  }
  // Sails has loaded OK: execute query test.
  queryTest().catch((err) => {
    app.log.error('Query test has failed:', err);
  }).then(() => {
    app.lower();
  });
});
