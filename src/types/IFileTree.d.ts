interface IFileTree {
  searchValue: string;
  currentFile: IFile | null;
}

interface IFileTreeFile {
  matchingPositions: number[];
}

interface IFileTreeIcon {
  icon: string | 'random';
}

interface IFileTreeFolder extends IFileTreeFile {
  open: boolean;
}

interface IFile {
  id: string;
  name: string;
  extension: string;
  isChanged: boolean;
  isNew: boolean;
  // path: IPath;
}

interface IFolder {
  name: string;
  folders: IFolder[];
  files: IFile[]
}

interface IFolderDated {
  date: Date;
  folder: IFolder;
}