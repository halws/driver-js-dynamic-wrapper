import DriverJs from "driver.js";
export default class Driver {
  instance;
  steps = [];
  currentStep = 0;
  lockClick = false;

  /**
   * initialize instance
   * @param {Object} [opt] optional driver.js options https://github.com/kamranahmedse/driver.js#driver-definition
   * @returns @this {Driver}
   */
  init(opt = {}) {
    this.instance = new DriverJs({
      ...opt,
      onNext: this.handleNext.bind(this),
      onPrevious: this.handlePrevious.bind(this),
      onHighlighted: this.$onHighlighted.bind(this),
    });

    return this;
  }

  $lockClick() {
    this.lockClick = true;
  }

  /**
   * should always be called when the next element is about to be highlighted when defining dynamical steps;
   * it locks click and set step count
   * @param {Object} driver.js Element
   * @returns @this {Driver}
   */
  handleNext({ node }) {
    this.$lockClick();
    this.currentStep = this.$getLastIndex(node) + 1;

    return this;
  }

  /**
   * should always be called when the previous element is about to be highlighted when defining dynamical steps;
   * it locks click and set step count
   * @param {Object} driver.js Element
   * @returns @this {Driver}
   */
  handlePrevious({ node }) {
    this.$lockClick();
    this.currentStep = this.$getLastIndex(node) - 1;

    return this;
  }

  $getLastIndex(node) {
    return this.steps.findIndex((el) => el.element == `#${node.id}`);
  }

  $onHighlighted() {
    this.lockClick = false;
  }

  async $onNextAuto(callback, Element) {
    try {
      // prevent double click
      if (Driver.lockClick) return this.preventMove();

      this.handleNext(Element).preventMove();

      if (this.elementIsVisible) {
        this.continue();
        return;
      }

      await callback();

      this.refreshSteps().continue();
    } catch (err) {
      console.error(err);
    }
  }

  async $onPreviousAuto(callback, Element) {
    try {
      // prevent double click
      if (Driver.lockClick) return this.preventMove();

      this.handlePrevious(Element).preventMove();

      if (this.elementIsVisible) {
        this.continue();
        return;
      }

      await callback();

      this.refreshSteps().continue();
    } catch (err) {
      console.error(err);
    }
  }

  $transformSteps(steps) {
    return steps.map((step) => {
      if ("onNextAuto" in step) {
        step.onNext = this.$onNextAuto.bind(this, step.onNextAuto);
        delete step.onNextAuto;
      }

      if ("onPreviousAuto" in step) {
        step.onPrevious = this.$onPreviousAuto.bind(this, step.onPreviousAuto);
        delete step.onPreviousAuto;
      }

      return step;
    });
  }

  /**
   * set steps
   * @param {Array} steps configuration of steps to be driven throw
   * @returns @this {Driver}
   */
  defineSteps(steps = []) {
    this.steps = steps;
    this.instance.defineSteps(this.$transformSteps(steps));

    return this;
  }

  /**
   * refresh steps
   * @returns @this {Driver}
   */
  refreshSteps() {
    this.defineSteps(this.steps);

    return this;
  }

  $setDefaultValues() {
    this.defineSteps();
    this.currentStep = 0;
    this.lockClick = false;
  }

  /**
   * reset tour to initial state
   * @returns @this {Driver}
   */
  reset() {
    this.$setDefaultValues();
    this.instance.reset();

    return this;
  }

  /**
   * start tour from step, accept numbers
   * @param {Number} [stepNumber] set step to be started from
   * @returns @this {Driver}
   */
  start(stepNumber = 0) {
    this.instance.start(stepNumber);
    this.$setCurrentStep();
    return this;
  }

  $setCurrentStep() {
    const stepNode = this.instance.steps[this.instance.currentStep].node;
    this.currentStep = this.$getLastIndex(stepNode);
  }

  /**
   * prevent move next step
   * @returns @this {Driver}
   */
  preventMove() {
    this.instance.preventMove();

    return this;
  }

  /**
   *  move next step
   * @returns @this {Driver}
   */
  moveNext() {
    this.instance.moveNext();

    return this;
  }

  get elementIsVisible() {
    const nextStep = this.steps[this.currentStep];
    const stepId = nextStep.element;
    const stepIndex = this.instance.steps.findIndex(
      (el) => `#${el.node.id}` == stepId
    );

    return stepIndex >= 0;
  }
  /**
   * continue tour; it tries to get next visible step and start tour from it
   */
  continue() {
    const nextStep = this.steps[this.currentStep];
    const stepId = nextStep.element;
    const stepIndex = this.instance.steps.findIndex(
      (el) => `#${el.node.id}` == stepId
    );

    this.instance.start(stepIndex);
  }
}
