class FileTree implements FileTree {
  autoWash = false;
  filesCount = 0;
  foldersCount = 0;
  allCount = 0;
  folders: IFolder[] = [];

  constructor(opts: Partial<FileTreeOptions> = {}) {
    // Options
    opts.autoWash && this.autoWash == opts.autoWash;

    // Set up
    this.addFolder(".", {});
  }

  cleanPath(path: string): string {
    // Trim
    path = path.trim();

    // Repeating `/`
    path = path.replace(/\/+/g, "/");

    // Ending `/`
    path = path.replace(/\/$/, "");

    // Starting `/`
    path = path.replace(/^\//, "");

    // Missing starting `./`
    if (path !== "." && path.search("./") !== 0) {
      path = "./" + path;
    }

    return path;
  }

  addFolder(path: string, data: Record<string, string> = {}): IFolder {

    // Set up
    path = this.cleanPath(path);
    const pathParts = path.split("/");

    let folders = this.folders;
    let folder = null;

    // Each path part
    for (const _part of pathParts) {
      const index = folders.findIndex((folder) => _part === folder.name);

      // Already exist
      if (index !== -1) {
        folder = folders[index];
        folders = folder.folders;
      }

      // Folder doesn't exist
      else {
        // Create folder
        folder = <IFolder>{
          folders: [],
          files: [],
          name: _part,
          data: {...data}
        };

        // Save
        folders.push(folder);
        folders = folder.folders;
      }
    }

    // Update counts
    this.updateCounts();

    // Return
    return folder!;
  }

  addFile(path: string, data: Record<string, string> = {}): IFile {

    // Set up
    path = this.cleanPath(path);
    const pathParts = path.split("/");
    const filePart = pathParts.pop();

    // Create folder
    const folder = this.addFolder(pathParts.join("/"));

    // Create file
    const file = <IFile>{
      name: filePart,
      data,
    };

    // Save
    folder.files.push(file);

    // Update counts
    this.updateCounts();

    return file;
  }

  removeFolder(path: string): boolean {
    // Recursive emptying
    const emptyFolder = (folder: IFolder) => {
      // Delete folders
      // Array keys are strings instead of numbers... but why?
      for (const _folderKey of folder.folders.keys()) {
        const _folder = folder.folders[_folderKey];

        emptyFolder(_folder);

        folder.folders.splice(_folderKey, 1);

        // Callback
        _folder.onRemove && _folder.onRemove.apply(this, [_folder]);
      }
      // Delete files
      for (const _fileKey of folder.files.keys()) {
        const _file = folder.files[_fileKey];

        folder.files.splice(_fileKey, 1);

        // Callback
        _file.onRemove && _file.onRemove.apply(this, [_file]);
        }
    };

    // Set up
    path = this.cleanPath(path);
    const pathParts = path.split("/");
    const folderPart = pathParts.pop();

    let folders: IFolder[] | null = this.folders;
    let folder = null;

    // Each path part
    for (const _part of pathParts) {
      const index: number = folders!.findIndex((folder) => _part === folder.name);

      // Found
      if (index !== -1) {
        folder = folders[index];
        folders = folder.folders;
      }

      // Not found
      else {
        folder = null;
        folders = null;
        break;
      }
    }

    // Found
    const index = folders? folders.findIndex((folder) => folderPart === folder.name) : - 1;
    if (folders && index !== -1) {
      const folder = folders[index];

      // Delete
      emptyFolder(folder);
      folders.splice(index, 1);

      // Callback
      folder.onRemove && folder.onRemove.apply(this, [folder])

      // Auto wash
      if (this.autoWash) {
        this.removeEmptyFolders();
      }

      // Update counts
      this.updateCounts();

      return true;
    }

    return false;
  }

  removeFile(path: string): boolean {
    // Set up
    path = this.cleanPath(path);
    const pathParts = path.split("/");
    const filePart = pathParts.pop();

    let folders: IFolder[] | null = this.folders;
    let folder = null;

    // Each path part
    for (const _part of pathParts) {
      const index: number = folders!.findIndex((folder) => _part === folder.name);

      // Found
      if (index !== -1) {
        folder = folders[index];
        folders = folder.folders;
      }

      // Not found
      else {
        folder = null;
        folders = null;
        break;
      }
    }

    // Folder found
    if (folders && folder) {
      const index = folder.files.findIndex((file) => filePart === file.name);

      // File found
      if (index !== -1) {
        const file = folder.files[index];

        // Delete
        folder.files.splice(index, 1);

        // Auto wash
        if (this.autoWash) {
          this.removeEmptyFolders();
        }

        // Callback
        file.onRemove && file.onRemove.apply(this, [file]);

        // Update counts
        this.updateCounts();

        return true;
      }
    }

    return false;
  }

  getFile(path: string): IFile | null {
    // Set up
    path = this.cleanPath(path);
    const pathParts = path.split("/");
    const filePart = pathParts.pop();

    let folders: IFolder[] | null  = this.folders;
    let folder = null;

    // Each path part
    for (const _part of pathParts) {
      const index: number = folders!.findIndex((folder) => _part === folder.name);

      // Found
      if (index !== -1) {
        folder = folders[index];
        folders = folder.folders;
      }

      // Not found
      else {
        folder = null;
        folders = null;
        break;
      }
    }

    // Folder found
    if (folders && folder) {
      const index = folder.files.findIndex((file) => filePart === file.name);

      if (index !== -1) {
        const file = folder.files[index];
        return file;
      }
    }

    return null;
  }

  getFolder(path: string): IFolder | null {
    // Errors
    path = this.cleanPath(path);
    const pathParts = path.split("/");

    let folders = this.folders;
    let folder = null;

    // Each path part
    for (const _part of pathParts) {
      const index = folders.findIndex((folder) => _part === folder.name);

      // Found
      if (index !== -1) {
        folder = folders[index];
        folders = folder.folders;
      }

      // Folder doesn't exist
      else {
        return null;
      }
    }

    // Return
    return folder;
  }

  removeEmptyFolders(): boolean {
    // Set up
    let removedCount = 0;

    // Recursive remove
    const canRemoveFolder = (folder: IFolder) => {
      // Each folder inside current folder
      for (const _folderKey of folder.folders.keys()) {
        // Try to remove folder
        const _folder = folder.folders[_folderKey];
        const canRemove = canRemoveFolder(_folder);

        // Remove folder
        if (canRemove) {
          removedCount++;

          // Delete
          folder.folders.splice(_folderKey, 1);

          // Callback
          _folder.onRemove && _folder.onRemove.apply(this, [_folder]);
        }
      }

      // Can be removed
      const folderKeys = Object.keys(folder.folders);
      const filesKeys = Object.keys(folder.files);

      if (folderKeys.length === 0 && filesKeys.length === 0) {
        return true;
      } else {
        return false;
      }
    };

    // Try from ./
    canRemoveFolder(this.folders[0]);

    // Update counts
    this.updateCounts();

    return removedCount > 0;
  }

  /**
   * Update counts
   */
  updateCounts() {
    let filesCount = 0;
    let foldersCount = 0;

    // Recursive emptying
    const traverseFolder = (folder: IFolder) => {
      // Each folder
      for (const _folderKey in folder.folders) {
        const _folder = folder.folders[_folderKey];

        traverseFolder(_folder);

        foldersCount++;
      }

      // Each file
      for (const _fileKey in folder.files) {
        filesCount++;
      }
    };

    traverseFolder(this.folders[0]);

    this.filesCount = filesCount;
    this.foldersCount = foldersCount;
    this.allCount = this.filesCount + this.foldersCount;
  }

  describe(log: boolean = false, colored: boolean = false): string {
    // Set up
    const depth = 0;
    const styles = <string[]>[];

    let stringTree = "";

    const addToString = (value: string, type: NodeType | null = null) => {
      if (colored) {
        stringTree += "%c";

        switch (type) {
          case NodeType.Structure:
            styles.push("color:#999;");
            break;
          case NodeType.Folder:
            styles.push("color:#999;");
            break;
          case NodeType.File:
            styles.push("color:#333;font-weight:bold;");
            break;
          default:
            styles.push("");
            break;
        }
      }

      stringTree += value;
    };

    // Recursive describe
    const describeFolder = (folder: IFolder, depth: number, last: boolean[] = []) => {
      // Each folders
      for (let i = 0; i < folder.folders.length; i++) {
        // Set up
        const _folder = folder.folders[i];

        // Add to tree string
        addToString("\n");

        for (let j = 0; j < depth; j++) {
          if (j === depth - 1) {
            if (i === folder.folders.length - 1 && folder.files.length === 0) {
              addToString(" └", NodeType.Structure);
            } else {
              addToString(" ├", NodeType.Structure);
            }
          } else {
            if (last[j]) {
              addToString("  ", NodeType.Structure);
            } else {
              addToString(" │", NodeType.Structure);
            }
          }
        }

        addToString("─", NodeType.Structure);
        addToString(_folder.name, NodeType.Folder);
        addToString("/", NodeType.Structure);

        // Last
        last.push(i === folder.folders.length - 1 && folder.files.length === 0);

        // Continue
        describeFolder(_folder, depth + 1, last);
      }

      // Each files
      for (let i = 0; i < folder.files.length; i++) {
        // Set up
        const _file = folder.files[i];

        // Add to tree string
        stringTree += "\n";

        for (let j = 0; j < depth; j++) {
          if (j === depth - 1) {
            if (i === folder.files.length - 1) {
              addToString(" └", NodeType.Structure);
            } else {
              addToString(" ├", NodeType.Structure);
            }
          } else {
            if (last[j]) {
              addToString("  ", NodeType.Structure);
            } else {
              addToString(" │", NodeType.Structure);
            }
          }
        }

        addToString("─", NodeType.Structure);
        addToString(_file.name, NodeType.File);
      }
    };

    // Describe from ./
    addToString(".", NodeType.Folder);
    addToString("/", NodeType.Structure);
    describeFolder(this.folders[0], depth + 1);

    // Log
    if (log) {
      console.log(...[stringTree].concat(styles));
    }

    return stringTree;
  }
}

// /**
//  * Tests
//  */
// const filesTree = new FileTree()

// filesTree.addFolder('./hey/hoy', { active: false, notifs: 0 })
// filesTree.addFolder('./hey/hoy/toto', { active: false, notifs: 0 })
// filesTree.addFolder('./hey/hoy/tata', { active: false, notifs: 0 })

// filesTree.addFile('./test-1.txt', { active: false, notifs: 0 })
// filesTree.addFile('./hey/hoy/test-2.txt', { active: false, notifs: 0 })
// filesTree.addFile('./hey/hoy/test-3.txt', { active: false, notifs: 0 })
// filesTree.addFile('./hey/hoy/tata/test-4.txt', { active: false, notifs: 0 })
// filesTree.addFile('./hey/hoy/toto/test-5.txt', { active: false, notifs: 0 })

// filesTree.addFile('./hey/hoy/toto/test-6.txt', {
//     active: false,
//     notifs: 0,
//     onRemove: (file) =>
//     {
//         console.log('removed file :', file)
//     }
// })
// filesTree.removeFile('./hey/hoy/toto/test-6.txt')

// filesTree.addFolder('./pwet', {
//     onRemove: (folder) =>
//     {
//         console.log('removed folder :', folder)
//     }
// })
// filesTree.addFolder('./pwet/uh', {
//     onRemove: (folder) =>
//     {
//         console.log('removed folder :', folder)
//     }
// })
// filesTree.removeFolder('./pwet')

// filesTree.removeFile('./hey/hoy/test-2.txt')
// filesTree.removeFolder('./hey')

// filesTree.describe(true, true)

export default FileTree;

// export default {
//   state: {
//     tree: new FileTree({ autoWash: true }),
//     currentFile: null,
//     currentVersion: null,
//     currentLine: null,
//     search: "",
//   },

//   mutations: {
//     updateFiles(state, data) {
//       state.tree = new FileTree({ autoWash: true });

//       for (const file of data) {
//         file.isNew = false;
//         file.isChanged = false;
//         state.tree.addFile(file.path.full, file);
//       }
//     },

//     createFile(state, data) {
//       data.isNew = true;
//       data.isChanged = false;
//       data.isActive = false;
//       state.tree.addFile(data.path.full, data);
//     },

//     deleteFile(state, data) {
//       state.tree.removeFile(data.path.full);
//     },

//     setFile(state, data) {
//       // Null file
//       if (!data) {
//         if (state.currentFile) {
//           state.currentFile.isActive = false;
//         }

//         state.currentFile = null;
//       }

//       // File path
//       else {
//         // Retrieve file from path
//         const file = state.tree.getFile(data);

//         // No current file or file different than current
//         if (!state.currentFile || state.currentFile.id !== file.id) {
//           if (state.currentFile) {
//             state.currentFile.isActive = false;
//           }

//           state.currentFile = file;
//           state.currentFile.isActive = true;
//           state.currentFile.isNew = false;
//           state.currentFile.isChanged = false;
//         }
//       }
//     },

//     createVersion(state, data) {
//       const file = state.tree.getFile(data.file);

//       if (file) {
//         file.versions.push(data.version);
//         file.isChanged = true;
//       }
//     },

//     setVersion(state, data) {
//       // Date sent
//       if (typeof data === "string") {
//         // Find version by date
//         const version = state.currentFile.versions.find(
//           (version) => version.date === data
//         );

//         // Found
//         if (version) {
//           state.currentVersion = version;
//         }
//       }

//       // Version directly sent
//       else {
//         state.currentVersion = data;
//       }
//     },

//     setLine(state, data) {
//       state.currentLine = data;
//     },

//     searchFile(state, data) {
//       state.search = data;
//     },
//   },
// };
