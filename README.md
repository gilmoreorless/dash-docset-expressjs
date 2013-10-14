A [Dash.app](dash) docset (and generator) for [express.js](express)

This was the result of a single day's experiment. I had planned to improve it and regularly keep it up to date, but then Dash 1.9.1 was released with a docset for Express that is better than this one.

So I'm going to call this project a learning experience, and leave it around as a template for future docsets, but it's not going to be updated any more.

## Development/build process

### Pre-requisites

* [Node.js](node)
* [Grunt](grunt) - `npm install -g grunt`

### Set up

1. Clone this repo
2. From repository root: `npm install`

### Build a new version

Simplest case:

1. `grunt` (or `grunt generate`) - this does everything
2. Commit the new changes
3. _TODO: Auto-generate a zipped and versioned docset_

For more fine-grained control, these are the individual Grunt commands:

* `grunt update` - Update the submodule to get the latest expressjs.com website docs
* `grunt clean` - Completely clean the docset directory
* `grunt copy:meta` - Copy `template/Info.plist` into the docset directory
* `grunt copy:docs` - Copy over the API docs and required CSS/images
* `grunt dom_munger:api` - Remove unnecessary items from the API docs (header, menu, scripts)
* `grunt index` - Build the SQLite index file from the API docs

If making changes to `Info.plist`, always change the file at `template/Info.plist`. **Do not modify the file in the docset directory**, it gets overwritten by Grunt with the `copy:meta` task.


[dash]: http://kapeli.com/dash
[express]: http://expressjs.com
[node]: http://nodejs.org
[grunt]: http://gruntjs.com
