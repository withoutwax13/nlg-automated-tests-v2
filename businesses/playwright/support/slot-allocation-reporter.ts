import path from "node:path";

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
} from "@playwright/test/reporter";

const SLOT_TAGS = Array.from(
  { length: 10 },
  (_, index) => `@slot-${String(index).padStart(2, "0")}`,
);
const SLOT_TAG_SET = new Set(SLOT_TAGS);

const ROLE_TAGS = ["@ags", "@municipal", "@taxpayer"] as const;
const ROLE_TAG_SET = new Set<string>(ROLE_TAGS);
type RoleTag = (typeof ROLE_TAGS)[number];

const REQUIRED_BUSINESS_TAGS = [
  "@business-active",
  "@business-inactive",
  "@business-required-forms",
  "@business-delinquency",
  "@business-filings",
  "@business-generated",
] as const;

const OPTIONAL_BUSINESS_TAGS = [
  "@business-default",
  "@business-funded",
  "@business-draft",
  "@business-zero-payment",
] as const;

const BUSINESS_TAGS = [
  ...REQUIRED_BUSINESS_TAGS,
  ...OPTIONAL_BUSINESS_TAGS,
] as const;
const BUSINESS_TAG_SET = new Set<string>(BUSINESS_TAGS);
type BusinessTag = (typeof BUSINESS_TAGS)[number];

interface SlotSummary {
  tests: number;
  roles: Record<RoleTag, number>;
  businesses: Record<BusinessTag, number>;
}

function createSlotSummary(): SlotSummary {
  return {
    tests: 0,
    roles: {
      "@ags": 0,
      "@municipal": 0,
      "@taxpayer": 0,
    },
    businesses: {
      "@business-active": 0,
      "@business-inactive": 0,
      "@business-required-forms": 0,
      "@business-delinquency": 0,
      "@business-filings": 0,
      "@business-generated": 0,
      "@business-default": 0,
      "@business-funded": 0,
      "@business-draft": 0,
      "@business-zero-payment": 0,
    },
  };
}

function testLabel(test: TestCase): string {
  const file = path.relative(process.cwd(), test.location.file);
  return `${file}:${test.location.line} › ${test.titlePath().at(-1)}`;
}

function validateBalancedDistribution(
  errors: string[],
  tag: string,
  counts: number[],
  required = true,
): void {
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (total === 0) {
    if (required) {
      errors.push(`${tag} must be used by at least one runnable matrix test.`);
    }
    return;
  }

  if (Math.max(...counts) - Math.min(...counts) > 1) {
    errors.push(
      `${tag} distribution must differ by at most 1 across slots; found ${counts.join(", ")}.`,
    );
  }
}

export default class SlotAllocationReporter implements Reporter {
  private failed = false;

  printsToStdio(): boolean {
    return true;
  }

  onBegin(_config: FullConfig, suite: Suite): void {
    const errors: string[] = [];
    const summaries = new Map<string, SlotSummary>(
      SLOT_TAGS.map((slotTag) => [slotTag, createSlotSummary()]),
    );

    for (const test of suite.allTests()) {
      const label = testLabel(test);
      const tags = test.tags;

      if (test.expectedStatus === "skipped") {
        if (tags.length > 0) {
          errors.push(`${label} is disabled and must remain untagged.`);
        }
        continue;
      }

      const slotTags = tags.filter((tag) => tag.startsWith("@slot-"));
      const roleTags = tags.filter((tag): tag is RoleTag => ROLE_TAG_SET.has(tag));
      const candidateBusinessTags = tags.filter((tag) =>
        tag.startsWith("@business-"),
      );
      const businessTags = candidateBusinessTags.filter(
        (tag): tag is BusinessTag => BUSINESS_TAG_SET.has(tag),
      );
      const unsupportedTags = tags.filter(
        (tag) =>
          !tag.startsWith("@slot-") &&
          !ROLE_TAG_SET.has(tag) &&
          !BUSINESS_TAG_SET.has(tag),
      );

      if (slotTags.length !== 1) {
        errors.push(
          `${label} must have exactly one slot tag; found ${slotTags.length}.`,
        );
      } else if (!SLOT_TAG_SET.has(slotTags[0])) {
        errors.push(`${label} uses unsupported slot tag ${slotTags[0]}.`);
      }

      if (roleTags.length === 0) {
        errors.push(`${label} must have at least one account-role tag.`);
      }
      if (new Set(roleTags).size !== roleTags.length) {
        errors.push(`${label} contains a duplicate account-role tag.`);
      }
      if (new Set(candidateBusinessTags).size !== candidateBusinessTags.length) {
        errors.push(`${label} contains a duplicate business tag.`);
      }
      if (unsupportedTags.length > 0) {
        errors.push(
          `${label} uses unsupported tags: ${unsupportedTags.join(", ")}.`,
        );
      }

      if (slotTags.length !== 1 || !SLOT_TAG_SET.has(slotTags[0])) {
        continue;
      }

      const summary = summaries.get(slotTags[0])!;
      summary.tests += 1;
      for (const roleTag of new Set(roleTags)) {
        summary.roles[roleTag] += 1;
      }
      for (const businessTag of new Set(businessTags)) {
        summary.businesses[businessTag] += 1;
      }
    }

    for (const [slotTag, summary] of summaries) {
      if (summary.tests < 4 || summary.tests > 5) {
        errors.push(
          `${slotTag} must contain 4 or 5 runnable matrix tests; found ${summary.tests}.`,
        );
      }
    }

    for (const roleTag of ROLE_TAGS) {
      validateBalancedDistribution(
        errors,
        roleTag,
        SLOT_TAGS.map((slotTag) => summaries.get(slotTag)!.roles[roleTag]),
      );
    }

    for (const businessTag of REQUIRED_BUSINESS_TAGS) {
      validateBalancedDistribution(
        errors,
        businessTag,
        SLOT_TAGS.map(
          (slotTag) => summaries.get(slotTag)!.businesses[businessTag],
        ),
      );
    }

    for (const businessTag of OPTIONAL_BUSINESS_TAGS) {
      validateBalancedDistribution(
        errors,
        businessTag,
        SLOT_TAGS.map(
          (slotTag) => summaries.get(slotTag)!.businesses[businessTag],
        ),
        false,
      );
    }

    console.log("Businesses slot allocation:");
    for (const [slotTag, summary] of summaries) {
      console.log(
        `${slotTag}: tests=${summary.tests}, ags=${summary.roles["@ags"]}, municipal=${summary.roles["@municipal"]}, taxpayer=${summary.roles["@taxpayer"]}, active=${summary.businesses["@business-active"]}, inactive=${summary.businesses["@business-inactive"]}, requiredForms=${summary.businesses["@business-required-forms"]}, delinquency=${summary.businesses["@business-delinquency"]}, filings=${summary.businesses["@business-filings"]}, generated=${summary.businesses["@business-generated"]}, default=${summary.businesses["@business-default"]}, funded=${summary.businesses["@business-funded"]}, draft=${summary.businesses["@business-draft"]}, zeroPayment=${summary.businesses["@business-zero-payment"]}`,
      );
    }

    if (errors.length > 0) {
      this.failed = true;
      console.error("\nInvalid Businesses slot allocation:");
      for (const error of errors) {
        console.error(`- ${error}`);
      }
      return;
    }

    console.log("Businesses slot allocation is valid.");
  }

  async onEnd(
    _result: FullResult,
  ): Promise<{ status?: FullResult["status"] } | undefined> {
    return this.failed ? { status: "failed" } : undefined;
  }
}
