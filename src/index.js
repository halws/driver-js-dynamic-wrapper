import DriverJs from 'driver.js';

export default class Driver {
    instance
    steps = []
    currentStep = 0
    lockClick = false

    init(opt = {}) {
        this.instance = new DriverJs({
            ...opt,
            onNext: this.onNext.bind(this),
            onPrevious: this.onPrev.bind(this),
            onHighlighted: this.$onHighlighted.bind(this)
        })

        return this
    }

    $lockClick() {
        this.lockClick = true
    }

    onNext({ node }) {
        this.$lockClick()
        this.currentStep = this.$getLastIndex(node) + 1

        return this
    }

    onPrev({ node }) {
        this.$lockClick()
        this.currentStep = this.$getLastIndex(node) - 1

        return this
    }

    $getLastIndex(node) {
        return this.steps.findIndex(el => el.element == `#${node.id}`)
    }

    $onHighlighted() {
        this.lockClick = false
    }

    defineSteps(steps = []) {
        this.steps = steps
        this.instance.defineSteps(steps)

        return this
    }

    refreshSteps() {
        this.defineSteps(this.steps)

        return this
    }

    setDefaultValues() {
        this.defineSteps()
        this.currentStep = 0
        this.lockClick = false
    }

    reset() {
        this.setDefaultValues()
        this.instance.reset()

        return this
    }

    start(stepNumber = 0) {
        this.instance.start(stepNumber)
        this.$setCurrentStep()
        return this
    }

    $setCurrentStep() {
        const stepNode = this.instance.steps[this.instance.currentStep].node
        this.currentStep = this.$getLastIndex(stepNode)
    }

    preventMove() {
        this.instance.preventMove()

        return this
    }

    moveNext() {
        this.instance.moveNext()

        return this
    }

    continue() {
        const nextStep = this.steps[this.currentStep];
        const stepId = nextStep.element
        const stepIndex = this.instance.steps.findIndex(el => `#${el.node.id}` == stepId)

        this.instance.start(stepIndex)
    }
}