import path from 'node:path';

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
} from '@playwright/test/reporter';

const SLOT_TAGS = Array.from(
  { length: 10 },
  (_, index) => `@slot-${String(index).padStart(2, '0')}`,
);
const SLOT_TAG_SET = new Set(SLOT_TAGS);
const ROLE_TAGS = ['@ags', '@municipal', '@taxpayer'] as const;
const ROLE_TAG_SET = new Set<string>(ROLE_TAGS);

type RoleTag = (typeof ROLE_TAGS)[number];

interface SlotSummary {
  tests: number;
  roles: Record<RoleTag, number>;
}

function createSlotSummary(): SlotSummary {
  return {
    tests: 0,
    roles: {
      '@ags': 0,
      '@municipal': 0,
      '@taxpayer': 0,
    },
  };
}

function testLabel(test: TestCase): string {
  const file = path.relative(process.cwd(), test.location.file);
  return `${file}:${test.location.line} › ${test.titlePath().at(-1)}`;
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

      if (test.expectedStatus === 'skipped') {
        if (tags.length > 0) {
          errors.push(`${label} is disabled and must remain untagged.`);
        }
        continue;
      }

      const slotTags = tags.filter((tag) => tag.startsWith('@slot-'));
      const roleTags = tags.filter((tag): tag is RoleTag => ROLE_TAG_SET.has(tag));
      const unsupportedTags = tags.filter(
        (tag) => !tag.startsWith('@slot-') && !ROLE_TAG_SET.has(tag),
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
      if (unsupportedTags.length > 0) {
        errors.push(
          `${label} uses unsupported tags: ${unsupportedTags.join(', ')}.`,
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
    }

    for (const [slotTag, summary] of summaries) {
      if (summary.tests < 3 || summary.tests > 4) {
        errors.push(
          `${slotTag} must contain 3 or 4 runnable tests; found ${summary.tests}.`,
        );
      }
    }

    for (const roleTag of ROLE_TAGS) {
      const counts = SLOT_TAGS.map(
        (slotTag) => summaries.get(slotTag)!.roles[roleTag],
      );
      if (Math.min(...counts) < 1) {
        errors.push(
          `${roleTag} must be used by at least one test in every slot; found ${counts.join(', ')}.`,
        );
      }
      if (Math.max(...counts) - Math.min(...counts) > 1) {
        errors.push(
          `${roleTag} distribution must differ by at most 1 across slots; found ${counts.join(', ')}.`,
        );
      }
    }

    console.log('Filings slot allocation:');
    for (const [slotTag, summary] of summaries) {
      console.log(
        `${slotTag}: tests=${summary.tests}, ags=${summary.roles['@ags']}, municipal=${summary.roles['@municipal']}, taxpayer=${summary.roles['@taxpayer']}`,
      );
    }

    if (errors.length > 0) {
      this.failed = true;
      console.error('\nInvalid filings slot allocation:');
      for (const error of errors) {
        console.error(`- ${error}`);
      }
      return;
    }

    console.log('Filings slot allocation is valid.');
  }

  async onEnd(
    _result: FullResult,
  ): Promise<{ status?: FullResult['status'] } | undefined> {
    return this.failed ? { status: 'failed' } : undefined;
  }
}
