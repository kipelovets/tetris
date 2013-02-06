# Learning Process #

I undertook this Javascript port of Cowtris for two main reasons:

1. Nostalgia
2. To learn more about Javascript.

You can read more about the nostalgia in my [History of Cowtris](.). This
document is about my attempts to sharpen my Javascript skillz.

## Getters and Setters ##

Javascript contains `get` and `set` [commands][resig_get_set], like object
oriented languages. Coming from Objective-C, I was tempted to use these in all
cases. After all, isn't it a good practice? So, I had a lot of objects that
looked like this:

	var ClassName = function () {
		var _private;

		return {
			get private() {
				return _private;
			},
			set private(var) {
				return _private = var;
			},

			// ...
		}
	}

It's cool... kind of. It doesn't do a lot. I used it in one instance in which
I wanted to present an underlying dataset in a different way and make it
appear as an object property instead of a function. In all other cases, I did
something like this:

	var ClassName = function() {
		var _private;

		// do anything necessary to initialize "_private"

		return {
			private: _private,

			// ...
		}
	}

This allows initialization of the variables (which I used for things such as
setting array sizes or coloring `canvas` elements) and gives allows us to
refer to the underlying `_private` variable if we use something that creates a
new context, such as `myArray.forEach(function(elem) { ... } );`.

There was a post on [Stackoverflow][so] that pointed out that making generic
getters and setters does little good. It fails to keep the variables private,
and it creates a lot of extra lines of code. With that being the case, why
bother?

It also breaks JSLint, which is annoying.

### Why? ###

Getters and Setters are a feature of ES5, and consequently [break in
IE6-8][get_set_compatability]. But, seriously, are you using IE6-8? If so,
fuck you. I'm not going to take that into account on a personal project.

[resig_get_set]: http://ejohn.org/blog/javascript-getters-and-setters/
[so]: http://www.stackoverflow.com
[get_set_compatability]: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/get#Browser_compatibility