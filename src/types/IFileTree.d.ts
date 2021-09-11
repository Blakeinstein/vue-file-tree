interface FileTree {
  autoWash: boolean;
  filesCount: number;
  foldersCount: number;
  allCount: number;
  folders: IFolder[];
}

declare enum NodeType {
  Structure = 'structure',
  Folder = 'folder',
  File = 'file'
}

// interface PathData {

// }

interface FileTreeOptions {
  autoWash?: boolean;
}

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

interface Base {
  name: string;
  onRemove?: (folder: Base) => void;
  data: Record<string, string>;
}

interface IFile extends Base {
  id: string;
  extension: string;
  isChanged: boolean;
  isNew: boolean;
  data: Record<string, string>;
  // path: IPath;
}

interface IFolder extends Base {
  name: string;
  folders: IFolder[];
  files: IFile[];
}

interface IFolderDated {
  date: Date;
  folder: IFolder;
}