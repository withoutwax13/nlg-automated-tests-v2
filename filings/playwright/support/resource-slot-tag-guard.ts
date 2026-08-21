import type { BusinessType, ResourceSlot } from './resource-pool';

export const ACCOUNT_TAGS = ['@taxpayer', '@municipal', '@ags'] as const;
export type AccountTag = (typeof ACCOUNT_TAGS)[number];

export const BUSINESS_TAGS = [
  '@business-default',
  '@business-funded',
  '@business-draft',
  '@business-zero-payment',
] as const;
export type BusinessTag = (typeof BUSINESS_TAGS)[number];

const ACCOUNT_TAG_BY_TYPE: Record<keyof ResourceSlot['accounts'], AccountTag> = {
  taxpayer: '@taxpayer',
  municipal: '@municipal',
  ags: '@ags',
};

const BUSINESS_TAG_BY_TYPE: Record<BusinessType, BusinessTag> = {
  default: '@business-default',
  funded: '@business-funded',
  draft: '@business-draft',
  zeroPayment: '@business-zero-payment',
};

interface GuardOptions {
  allowUntaggedAccess?: boolean;
}

/**
 * Creates a test-scoped facade that checks category tags without including any
 * credential or business values in its validation errors.
 */
export function guardResourceSlotAccess(
  resourceSlot: ResourceSlot,
  activeTags: readonly string[],
  options: GuardOptions = {},
): ResourceSlot {
  if (options.allowUntaggedAccess) {
    return resourceSlot;
  }

  const accounts = new Proxy(resourceSlot.accounts, {
    get(target, property, receiver) {
      if (
        typeof property === 'string' &&
        Object.prototype.hasOwnProperty.call(ACCOUNT_TAG_BY_TYPE, property)
      ) {
        const accountType = property as keyof ResourceSlot['accounts'];
        const requiredTag = ACCOUNT_TAG_BY_TYPE[accountType];
        if (!activeTags.includes(requiredTag)) {
          throw new Error(
            `This test accessed the ${accountType} account without its required ${requiredTag} tag.`,
          );
        }
      }

      return Reflect.get(target, property, receiver) as ResourceSlot['accounts'][keyof ResourceSlot['accounts']];
    },
  });

  const businesses = new Proxy(resourceSlot.businesses, {
    get(target, property, receiver) {
      if (
        typeof property === 'string' &&
        Object.prototype.hasOwnProperty.call(BUSINESS_TAG_BY_TYPE, property)
      ) {
        const businessType = property as BusinessType;
        const requiredTag = BUSINESS_TAG_BY_TYPE[businessType];
        if (!activeTags.includes(requiredTag)) {
          throw new Error(
            `This test accessed the ${businessType} business without its required ${requiredTag} tag.`,
          );
        }
      }

      return Reflect.get(target, property, receiver) as string;
    },
  });

  return { ...resourceSlot, accounts, businesses };
}
