<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <h1>Hello Tour.js</h1>

  <p id="step-1">First Step</p>

  <p v-if="secondStep" id="step-2">Second async step</p>
</template>

<script>
import Driver from "driver-js-dynamic-wrapper";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

const driver = new Driver();
const mainConfig = {}; // driver.js options

export default {
  data() {
    return {
      secondStep: false
    }
  },
  async mounted() {
    await delay(300)

    const steps = stepsConfig(driver)
    driver
      .init(mainConfig)
      .defineSteps(steps)
      .start();

    await delay(300)
    this.secondStep = true
  },
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
a {
  color: #42b983;
}
</style>
