# Playwright Traces Are _Very_ Bad

## TLDR;

Only use Playwright `traces` when you **absolutely** must.

- No, I don't mean `on-first-retry`
- I *also* don't mean `on-all-retries`
- I **ESPECIALLY** DO NOT MEAN `on` OR `retain-on-failure`
- I furthermore and MOST ESPECIALLY do not mean to only use it "in CI" with ANY of the available settings.

The only time it *might* be OK to use traces in CI, is by means of a temporary configuration or environment flag that can be enabled for a single run or set of runs while debugging is being actively performed, and then disabled for all runs thereafter. It should absolutely not be enabled in any form or fashion in CI at any other time.

Turn traces off at **all** times, except for specific executions of specific tests for the specific purpose of debugging a failure in that specific test.

Your best option is to use the `--trace` command-line flag to set it to the desired value for a specific execution of a specific test in your local environment.

Your second best option is to use an environment variable or build configuration option to enable tracing for a single test execution either in your local environment or in CI.

`traces` will absolutely murder your ability to have "fast" feedback from your test suite, and it's adverse impact only increases with the size and complexity of your test suite and web application. Enabling `traces` in CI in any form is perhaps the second biggest mistake besides enabling `retries` in CI.

## The Long Version

### Let's All Run A Test Together

Let's do this together. To run the tests in this repository:

```
npm install
npx playwright test
```

You'll see output such as this:
```shell
➜  traces-are-bad npx playwright test

Running 2 tests using 1 worker

  ✓  1 [webkit] › example.spec.ts:3:5 › traces perform very badly with simple websites (36.7s)
End of test reached after 10 seconds
  ✓  2 [webkit] › example.spec.ts:16:5 › and much worse with a more complicated website (1.3m)
End of test reached after 11 seconds

  2 passed (2.0m)

To open last HTML report run:

  npx playwright show-report
```

The above output came from a 2020 13-inch Macbook Pro with 2.3 GHz Intel Core i7 and 32GB of RAM with nothing better to do while this test was running.

This line is output at the end of each `test` block. Go check out the test code for yourself:

> End of test reached after `n` seconds

However, note that the reported time for each test is *much* longer.

Welcome to `traces`!

Traces have a *severe* performance cost. As noted in the tests in this repo, the severity of that performance increases based on two factors:

1. The number of browser (or `page`) interactions in the test.
2. The complexity of the website under test.

In the first test above, we load a relatively simple website; the homepage of [playwright.com](https://playwright.com). The test then simply checks visibility of an element 1000 times, prints the "End of test reached" text and then ends. Or at least it *should* end.

At this point however, even if no failure occurred within the `test` block, the test then hangs for another 27 seconds.

The second test visits a more complex website, checks the visibility of an element only 200 times, prints "End of test reached", and then hangs for over a minute! 

### Welcome to Playwright Traces

This, my friends, is `traces` doing its "magic", aka making your test suite take a long f&*#ing time to run if any of your test cases happen to be collecting traces either "on failure" or "on retry".

All the test did was check the visibility of a single element on the page many times. The test itself didn't fail; however, were it not for the `test.setTimeout` call within those tests, they would have exceeded the default Playwright timeout of 30 seconds and failed anyways.

**Lesson Number One:** EVERY browser interaction records a `trace`, and those traces have consequences.

This repo has `traces` set to `retain-on-failure`. Even though the test itself has no failures,
playwright seemingly collects the trace at the end of the test anyways. It incurs the trace collection cost as part of the test execution/teardown itself, even when the test would not fail. As a result, trace collection not only severely impacts the execution time of tests even when they pass, but also increases the risk of the test failing due to a timeout caused by the trace collection itself. So not only does your test suite now take longer to run, it is also more prone to failure.

This is very, very bad for large test suites with reasonably complex test cases and/or websites where retries are a common practice for many QA organizations, and intermittent failures are likewise not uncommon to see. We all would love to see tests passing all the time but it's just not the reality for many if not most companies large enough to afford a reasonably sized automation test suite.

Acceptance tests are slow to begin with, so when you take a long running
test and then add another minute (or more!!!) to that runtime, you end
up with a very bad situation, especially if you have a very large test
suite with a huge number of long, complex test cases with many interactions per test.

Don't get me wrong - Traces really are pretty neat feature and that's no joke.
BUT if you have traces enabled in any form by default either locally or in CI, 
you might want to reconsider.

The documentation for traces states:

> Traces should be run on continuous integration on the first retry of a failed test by setting the trace: 'on-first-retry' option in the test configuration file. This will produce a trace.zip file for each test that was retried.

This sounds great, right?

Well, if you're using retries in CI at all I'd say you're doing test automation wrong in the first place, but I'll get off my high horse for now.

Traces are great, but Playwright poorly advertises their drawbacks and even encourages their use as stated above. There can be **severe** performance penalties for using them.

As a software developer with a background in QA and test automation, I care greatly about how quickly I get feedback from my test suite. The best unit tests are measure in milliseconds, not seconds. Likewise I want my acceptance test suite to run as fast as possible so that I can have quick feedback from the test suite when I make a change.

### Conclusion

This might be an abrupt transition but I've written more than enough about this for now.

See the TLDR; for specific recommendations. Don't use traces except explicitly when you must.

Hopefully Playwright can dramatically improve the trace performance in the future to improve its usability in use cases such as CI. Until then I'm going to keep it turned off completely everywhere.

ALSO. Stop using retries in CI people. Just stop it. Stop. Make your tests PASS every time instead, and make your developers fix bugs if they're causing the tests to fail intermittently.

**Retries. Are. Very. Bad. Too.**
