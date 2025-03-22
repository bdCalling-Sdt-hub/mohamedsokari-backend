
export const getSingleFilePath = (files: any, fieldName: string, folderName?: string) => {
  const fileField = files && files[fieldName];
  
  const folder = folderName || fieldName;
  
  if (fileField && Array.isArray(fileField) && fileField.length > 0) {
    return `/${folder}/${fileField[0].filename}`;
  }

  return undefined;
};

export const getMultipleFilesPath = (files: any, fieldName: string, folderName?: string) => {
  const fileField = files && files[fieldName];
  const folder = folderName || fieldName;
  if (fileField) {
    if (Array.isArray(fileField)) {
      return fileField.map((file: any) => `/${folder}/${file.filename}`);
    }
  }

  return undefined;
};