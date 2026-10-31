/**
 * Universal Test Harness for KelasMerdeka E2E Testing Track
 * Supports both standalone execution (Node 24 strip-types) and Vitest runner
 */

export interface TestResult {
  suiteName: string;
  testName: string;
  passed: boolean;
  error?: Error;
  durationMs: number;
}

export interface SuiteSummary {
  suiteName: string;
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  tests: TestResult[];
}

interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
}

interface TestSuite {
  name: string;
  beforeEachHooks: Array<() => void | Promise<void>>;
  afterEachHooks: Array<() => void | Promise<void>>;
  tests: TestCase[];
}

const suites: TestSuite[] = [];
let currentSuite: TestSuite | null = null;

export function describe(name: string, fn: () => void): void {
  const previousSuite = currentSuite;
  const suite: TestSuite = {
    name,
    beforeEachHooks: [],
    afterEachHooks: [],
    tests: [],
  };
  suites.push(suite);
  currentSuite = suite;
  try {
    fn();
  } finally {
    currentSuite = previousSuite;
  }
}

export function it(name: string, fn: () => void | Promise<void>): void {
  if (!currentSuite) {
    describe("Default Suite", () => {
      it(name, fn);
    });
    return;
  }
  currentSuite.tests.push({ name, fn });
}

export const test = it;

export function beforeEach(fn: () => void | Promise<void>): void {
  if (currentSuite) {
    currentSuite.beforeEachHooks.push(fn);
  }
}

export function afterEach(fn: () => void | Promise<void>): void {
  if (currentSuite) {
    currentSuite.afterEachHooks.push(fn);
  }
}

// Deep equality comparator
function deepEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }
  return true;
}

export class ExpectationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExpectationError";
  }
}

class Expectation {
  private actual: any;
  private isNot: boolean;

  constructor(actual: any, isNot: boolean = false) {
    this.actual = actual;
    this.isNot = isNot;
  }

  get not(): Expectation {
    return new Expectation(this.actual, !this.isNot);
  }

  private assert(condition: boolean, failMessage: string): void {
    const finalCondition = this.isNot ? !condition : condition;
    if (!finalCondition) {
      throw new ExpectationError(failMessage);
    }
  }

  toBe(expected: any): void {
    const pass = Object.is(this.actual, expected);
    this.assert(
      pass,
      `Expected ${JSON.stringify(this.actual)} ${this.isNot ? "NOT to be" : "to be"} ${JSON.stringify(expected)}`
    );
  }

  toEqual(expected: any): void {
    const pass = deepEqual(this.actual, expected);
    this.assert(
      pass,
      `Expected deep equality:\n  Actual:   ${JSON.stringify(this.actual)}\n  Expected: ${this.isNot ? "NOT " : ""}${JSON.stringify(expected)}`
    );
  }

  toBeTruthy(): void {
    const pass = Boolean(this.actual);
    this.assert(pass, `Expected ${JSON.stringify(this.actual)} ${this.isNot ? "NOT to be truthy" : "to be truthy"}`);
  }

  toBeFalsy(): void {
    const pass = !this.actual;
    this.assert(pass, `Expected ${JSON.stringify(this.actual)} ${this.isNot ? "NOT to be falsy" : "to be falsy"}`);
  }

  toBeNull(): void {
    const pass = this.actual === null;
    this.assert(pass, `Expected ${JSON.stringify(this.actual)} ${this.isNot ? "NOT to be null" : "to be null"}`);
  }

  toBeUndefined(): void {
    const pass = typeof this.actual === "undefined";
    this.assert(pass, `Expected ${JSON.stringify(this.actual)} ${this.isNot ? "NOT to be undefined" : "to be undefined"}`);
  }

  toBeDefined(): void {
    const pass = typeof this.actual !== "undefined";
    this.assert(pass, `Expected value ${this.isNot ? "NOT to be defined" : "to be defined"}`);
  }

  toContain(item: any): void {
    let pass = false;
    if (typeof this.actual === "string") {
      pass = this.actual.includes(item);
    } else if (Array.isArray(this.actual)) {
      pass = this.actual.some(el => deepEqual(el, item));
    } else if (this.actual && typeof this.actual === "object") {
      pass = item in this.actual;
    }
    this.assert(
      pass,
      `Expected ${JSON.stringify(this.actual)} ${this.isNot ? "NOT to contain" : "to contain"} ${JSON.stringify(item)}`
    );
  }

  toHaveLength(length: number): void {
    const actualLen = this.actual ? this.actual.length : undefined;
    const pass = actualLen === length;
    this.assert(
      pass,
      `Expected length ${length}, got ${actualLen} (${this.isNot ? "should NOT have length" : "should have length"})`
    );
  }

  toBeGreaterThan(expected: number): void {
    const pass = Number(this.actual) > expected;
    this.assert(
      pass,
      `Expected ${this.actual} ${this.isNot ? "NOT to be greater than" : "to be greater than"} ${expected}`
    );
  }

  toBeGreaterThanOrEqual(expected: number): void {
    const pass = Number(this.actual) >= expected;
    this.assert(
      pass,
      `Expected ${this.actual} ${this.isNot ? "NOT to be >= " : "to be >= "}${expected}`
    );
  }

  toBeLessThan(expected: number): void {
    const pass = Number(this.actual) < expected;
    this.assert(
      pass,
      `Expected ${this.actual} ${this.isNot ? "NOT to be less than" : "to be less than"} ${expected}`
    );
  }

  toBeLessThanOrEqual(expected: number): void {
    const pass = Number(this.actual) <= expected;
    this.assert(
      pass,
      `Expected ${this.actual} ${this.isNot ? "NOT to be <= " : "to be <= "}${expected}`
    );
  }

  toBeCloseTo(expected: number, delta: number = 0.001): void {
    const pass = Math.abs(Number(this.actual) - expected) <= delta;
    this.assert(
      pass,
      `Expected ${this.actual} ${this.isNot ? "NOT to be close to" : "to be close to"} ${expected} (delta: ${delta})`
    );
  }

  toMatch(regex: RegExp): void {
    const pass = regex.test(String(this.actual));
    this.assert(
      pass,
      `Expected ${JSON.stringify(this.actual)} ${this.isNot ? "NOT to match" : "to match"} ${regex}`
    );
  }

  toThrow(expectedMessage?: string | RegExp): void {
    let threw = false;
    let thrownError: any = null;
    if (typeof this.actual !== "function") {
      throw new ExpectationError("Expected a function to test for throwing");
    }
    try {
      this.actual();
    } catch (err) {
      threw = true;
      thrownError = err;
    }

    if (!this.isNot) {
      if (!threw) {
        throw new ExpectationError("Expected function to throw an error, but it did not throw.");
      }
      if (expectedMessage) {
        const msg = thrownError instanceof Error ? thrownError.message : String(thrownError);
        if (typeof expectedMessage === "string") {
          if (!msg.includes(expectedMessage)) {
            throw new ExpectationError(`Expected error message to contain "${expectedMessage}", got "${msg}"`);
          }
        } else if (!expectedMessage.test(msg)) {
          throw new ExpectationError(`Expected error message to match ${expectedMessage}, got "${msg}"`);
        }
      }
    } else {
      if (threw) {
        throw new ExpectationError(`Expected function NOT to throw, but it threw: ${thrownError}`);
      }
    }
  }
}

export function expect(actual: any): Expectation {
  return new Expectation(actual);
}

export function clearSuites(): void {
  suites.length = 0;
  currentSuite = null;
}

export async function runAllSuites(options: { silent?: boolean } = {}): Promise<{
  totalSuites: number;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  durationMs: number;
  suiteSummaries: SuiteSummary[];
}> {
  const startTime = Date.now();
  const suiteSummaries: SuiteSummary[] = [];
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of suites) {
    const suiteStart = Date.now();
    const testResults: TestResult[] = [];
    if (!options.silent) {
      console.log(`\n\x1b[1m\x1b[36m▶ Suite: ${suite.name}\x1b[0m`);
    }

    for (const test of suite.tests) {
      totalTests++;
      const testStart = Date.now();
      let passed = true;
      let error: Error | undefined;

      try {
        for (const hook of suite.beforeEachHooks) {
          await hook();
        }
        await test.fn();
        for (const hook of suite.afterEachHooks) {
          await hook();
        }
      } catch (err: any) {
        passed = false;
        error = err;
      }

      const testDuration = Date.now() - testStart;
      testResults.push({
        suiteName: suite.name,
        testName: test.name,
        passed,
        error,
        durationMs: testDuration,
      });

      if (passed) {
        totalPassed++;
        if (!options.silent) {
          console.log(`  \x1b[32m✔\x1b[0m ${test.name} \x1b[90m(${testDuration}ms)\x1b[0m`);
        }
      } else {
        totalFailed++;
        if (!options.silent) {
          console.log(`  \x1b[31m✖ ${test.name} (${testDuration}ms)\x1b[0m`);
          console.log(`    \x1b[31m${error?.stack || error?.message || error}\x1b[0m`);
        }
      }
    }

    const suiteDuration = Date.now() - suiteStart;
    suiteSummaries.push({
      suiteName: suite.name,
      total: testResults.length,
      passed: testResults.filter(t => t.passed).length,
      failed: testResults.filter(t => !t.passed).length,
      durationMs: suiteDuration,
      tests: testResults,
    });
  }

  const durationMs = Date.now() - startTime;
  return {
    totalSuites: suites.length,
    totalTests,
    totalPassed,
    totalFailed,
    durationMs,
    suiteSummaries,
  };
}
