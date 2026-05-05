import { Page } from "@playwright/test";

let currentPage: Page | undefined;

export const setCurrentPage = (page: Page) => {
  currentPage = page;
};

export const resolvePage = (page?: Page) => {
  if (page) {
    return page;
  }
  if (!currentPage) {
    throw new Error("Playwright page context has not been initialized");
  }
  return currentPage;
};
