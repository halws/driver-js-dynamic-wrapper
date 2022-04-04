## Purpose
[Driver.js](https://github.com/kamranahmedse/driver.js) is a nice and easy to use library for highlighted showcase tour. The only cumbersome use case for me was handling steps on dynamically created elements. There is an [issue](https://github.com/kamranahmedse/driver.js/issues/162), where multiple driver solution was proposed. So, I've used that one, and created this wrapper to handle edge cases (mostly) by plugin.  



# Usage and demo

## Install using npm:

```bash
$ npm install driver-js-dynamic-wrapper
```

## Get started:


```js
import Driver from 'driver-js-dynamic-wrapper'
import 'driver.js/dist/driver.min.css';
```

***

## Creating multiple steps on dynamic elements. [Original source](https://github.com/kamranahmedse/driver.js#asynchronous-actions--demo)

### Problem explanation

Problem occurs when defining the steps via original `defineSteps()`. Here library iterates throw DOM elements and skip step if it's not available. So in result **dynamically created steps(delayed) are omitted**. To "fix" that you should refresh steps before moving into dynamically created element.

- Refreshing steps meant to update original driver.js steps to make it catch all currently visible DOM elements defined in steps configuration.
- Consider you move from first steps to second. The 2nd step highlight  dynamically created element after some action. For example redirection to next page action take a 500ms. To make `refreshSteps()` "pick up" step you should delay before.
- Delaying is possible to do inside `onNext()` or  `onPrevious()` functions inside steps configuration JSON. In more advanced scenario you could wait for some AJAX request, etc. then call `refreshSteps()`

### Initial call
```js
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
```js
const stepsConfig = (Driver) => [
  {
    element: "#step-1",
    popover: {
      title: "first title ...",
      description: "first description ...",
    },
    async onNext(Element) {
      // prevent double click
      if (Driver.lockClick) return Driver.preventMove();

      Driver.handleNext(Element).preventMove();

      if (Driver.elementIsVisible) {
        Driver.continue();
        return;
      }

    // required delay to make DOM element #step-2 became visible
    // I use delay() as promise-based function, but it possible to wrap code bellow with setTimeout()
    // await delay(500)

      Driver.refreshSteps().continue();
    },
  },
  {
    element: "#step-2",
    popover: {
      title: "second title ...",
      description: "second description ...",
    },
  },
]; 
```

## API

*I didn't touch original driver.js code, you can access all the methods of [driver.js](https://github.com/kamranahmedse/driver.js#api-methods)*. 
Some of this methods have the same name as in original plugin. They do the same functionality. I've duplicated them to make it chainable.

| method                     | description                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `init(opt = {})`           | initialize instance; receives all original options from driver.js                   |
| `handleNext({ node })`     | locks double click; handle step number; should always be called inside onNext()     |
| `handlePrevious({ node })` | locks double click; handle step number; should always be called inside onPrevious() |
| `defineSteps(steps = [])`  | set steps; receives Array of step's definition.                                     |
| `refreshSteps()`           | refresh steps for tour; should be called after delay to catch DOM elements          |
| `reset()`                  | reset all steps and the tour to 0                                                   |
| `start(stepNumber = 0)`    | start tour from specified step, accept numbers                                      |
| `preventMove()`            | prevent moving next step                                                            |
| `continue()`               | continue tour; it tries to get next visible step and start tour from it             |

--- 

| getter             | description                                |
| ------------------ | ------------------------------------------ |
| `elementIsVisible` | check if current step's element is visible |
## Examples
 - [base dynamic element](https://codesandbox.io/embed/green-field-vjiwjw?fontsize=14&hidenavigation=1&theme=dark)

## Useful

- <details>
    <summary>promise-based function delay()</summary>

    ```js
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }   
    ```
    </details>
- <details>
    <summary>css fixes</summary>
    
     **stacking bug when animated with children of fixed elements**

     https://github.com/kamranahmedse/driver.js/issues/133#issuecomment-549714982
    ```css
        div#driver-highlighted-element-stage, div#driver-page-overlay {
        background: transparent !important;
        outline: 5000px solid rgba(0, 0, 0, .75)
        }
    ```
    </details>
- link to vue-js plugin

TO-DO

- [ ] add TS support
- [ ] add tests
- [ ] add example with multiple scenarios
- [ ] add Cypress-like get() syntax to catch elements automatically without manual timeout