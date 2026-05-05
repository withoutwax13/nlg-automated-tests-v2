export const deleteDownloadsFolder = () => {
  const downloadsFolder = PW.config("downloadsFolder");
  pw.task("deleteFolder", downloadsFolder);
};
