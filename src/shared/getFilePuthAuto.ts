type IFolderName = 'images' | 'image' | 'banner' | 'logo' | 'audio';

const getFilePuthAuto = (files: any, folderName: IFolderName) => {
  const fileField = files && files[folderName];
  if (!fileField) {
    return undefined;
  }
  if (Array.isArray(fileField)) {
    if (fileField.length === 1) {
      return `/${folderName}/${fileField[0].filename}`;
    }
    else if (fileField.length > 1) {
      return fileField.map((file: any) => `/${folderName}/${file.filename}`);
    }
    return undefined;
  }
  if (fileField.filename) {
    return `/${folderName}/${fileField.filename}`;
  }

  return undefined;
};

export default getFilePuthAuto;
