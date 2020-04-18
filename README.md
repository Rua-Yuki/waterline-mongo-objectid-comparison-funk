# waterline-mongo-objectid-comparison-funk

This repository highlights what appears to be an issue preventing Waterline's `sails-mongo` adapter from converting inputs to Mongo `ObjectId` instances in appropriate contexts when paired with certain comparison operators (`>`, `<`, `>=`, `<=`).

For instance, given the following model:

```js
/**
 * @file Post.js
 */

module.exports = {
  attributes: {
    content: {
      type: 'string',
      required: true,
      maxLength: 280,
      minLength: 1,
    },
  },
};
```

And a dataset like so:

| _id                                    | content      | createdAt     | updatedAt     |
|----------------------------------------|--------------|---------------|---------------|
| `ObjectId("5e9a49923a48025cccdaee43")` | Hello World! | 1587169682656 | 1587169682656 |
| `ObjectId("5e9a49923a48025cccdaee44")` | Testing 123. | 1587169682656 | 1587169682656 |
| `ObjectId("5e9a49923a48025cccdaee45")` | Testing 456. | 1587169682656 | 1587169682656 |
| `ObjectId("5e9a49923a48025cccdaee46")` | Testing 789. | 1587169682656 | 1587169682656 |

The following query will not return results as expected:

```js
// Try and find the next item after our input.
Post.find({
  id: {
    '>': '5e9a49923a48025cccdaee43',
  },
}).sort('id ASC').limit(1).then((res) => {
  // Logs "Found []"
  sails.log.debug('Found', res);
});
```

The expected result of this query is to return the item directly after our input ID, if any:

```js
[{
  id: '5e9a49923a48025cccdaee44',
  createdAt: 1587169682656,
  updatedAt: 1587169682656,
  content: 'Testing 123.'
}]
```

We instead receive only an empty array, regardless of whether a match exists or not:

```js
[]
```

This is a result of `sails-mongo` passing the ID value to Mongo directly as a string rather than normalising it to an `ObjectId` as is done with other query operations.

The following operations work as expected and convert appropriate inputs to `ObjectId`:
  - equality
  - `!=`
  - `nin`
  - `in`

The following operations do not work as expected, and leave the input unmodified:
  - `<`
  - `<=`
  - `>`
  - `>=`

Queries like the one shown above can provide a nice, hassle-free method of paging through long lists. Additionally, document IDs can serve as a nice tie-breaker when paging on fields that might not necessarily be unique (such as `createdAt`).

Without being able to rely on the document ID as a tie-breaker, pagination can become unnecessarily complicated, or if done naïvely, may be prone to skipping records in some scenarios.

Furthermore, this behaviour does not appear to be consistent with that of the `sails-postgresql` adapter, which functions as expected when using the comparison operators affected with `sails-mongo`.

## Testing

This issue can be demonstrated by simply running `node queryTest`, which should detect whether or not queries work as expected using document IDs and display one of the following messages before exiting:

> `Query test has succeeded!`

 - Emit when the test has determined that queries involving document IDs work as expected.

> `Query test has failed: ...`

 - Emit when the test has determined that queries do not allow comparisons with document IDs as expected.

> `Failed to load Sails app: ...`

  - Emit when something has prevented Sails from loading; most likely a configuration issue.
  - One should ensure that [datastore configuration](./config/datastore.js) has been properly setup.

Please note that this is only a cursory test which examines a single affected operator and should not be used to test overall correctness or conformance.

## Resolution

A super simple fix for this can be found in the [fpm-git/sails-mongo](https://github.com/fpm-git/sails-mongo/tree/bug/fix-mongo-oid-comparison-normalisation) fork. This of course comes with no warranties, though has been tested to work great for our use case.
