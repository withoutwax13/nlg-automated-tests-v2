import fs from "fs";
import path from "path";

export const getDownloadsFolder = () =>
  path.resolve(process.cwd(), "downloads", "playwright", "downloads");

export const ensureDownloadsFolder = () => {
  fs.mkdirSync(getDownloadsFolder(), { recursive: true });
};

export const deleteDownloadsFolder = () => {
  fs.rmSync(getDownloadsFolder(), { recursive: true, force: true });
};
