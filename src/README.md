# Purpose
Driver.js is a nice and easy to use library for highlighted showcase tour. The only cumbersome use case for me was handling steps on dynamically created elements. There is an [issue](https://github.com/kamranahmedse/driver.js/issues/162), where multiple driver solution was proposed. So, I've used that one, and created this wrapper to handle edge cases (mostly) by plugin.  

Install using npm:

```bash
$ npm install driver-js-dynamic-wrapper
```

## Import and register Vue plugin:

I didn't touch original driver.js code, just packed it here with styles.

```js
import Driver from 'driver-js-dynamic-wrapper'
import 'driver-js-dynamic-wrapper/dist/driver.min.css';
```

# Usage and demo

## Creating multiple steps on dynamic elements. Original source [link]

### Problem explanation

Problem occurs when defining the steps via original `defineSteps()`. Here it iterates throw DOM elements and skip step if it's not available. So in result dynamic steps are omitted. To "fix" that you should refresh steps right before moving into dynamically created element.

- Refreshing steps meant to update original driver.js steps to make it catch all currently visible DOM elements defined in steps configuration.
- Consider you move from first steps to second. The 2nd step highlight  dynamically created element after some action. For example this action take a 500ms. To make `refreshSteps()` "pick up" step you should delay before.
- Delaying is possible to do inside `onNext()` or  `onPrev()` functions inside steps configuration JSON. In more advanced scenario you could wait for some AJAX request, etc. then call `refreshSteps()`

### Initial call
```
const driver = new Driver();
const mainConfig = {...}; // driver.js options 

driver
    .init(mainConfig)
    .defineSteps(stepsConfig(driver))     
    .start();
```
* driver.js [options](https://github.com/kamranahmedse/driver.js#driver-definition)


## Defining a steps

Back to example with two steps, where 2nd step highlight dynamically created element
```
const stepsConfig = (Driver) => [
    {
        element: '#step-1',
        popover: {
            title: 'first title ...',
            description: 'first description ...'
        },
        async onNext(Element) {
            // prevent double click
            if (Driver.lockClick) return Driver.preventMove()

            Driver
                .onNext(Element)
                .preventMove()

            // required delay to make DOM element #step-2 became visible
            // i use delay() as promise-based function
            await delay(500)

            Driver
                .refreshSteps()
                .continue()
        }
    },
        {
        element: '#step-2',
        popover: {
            title: 'second title ...',
            description: 'second description ...'
        }
    }
];  
```

Examples

Useful


- <details>
    <summary>promise-based function delay()</summary>

    ```js
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }   
    ```
    </details>
- link to vue-js plugin
- css fixes


TO-DO

