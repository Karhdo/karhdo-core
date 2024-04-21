import fs from 'fs';
import path from 'path';
import parseJson from 'parse-json';
import { load as loadYaml } from 'js-yaml';

import { FileExtension } from '../config.interface';

export class FileLoader {
  static async readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    return new Promise((resolve, reject): void => {
      fs.readFile(filePath, encoding, (error, contents): void => {
        if (error) {
          reject(error);
        } else {
          resolve(contents);
        }
      });
    });
  }

  private static getFileExt(absoluteFilePath: string): string {
    return path.extname(absoluteFilePath).split('.').pop() as FileExtension;
  }

  static async parseFile(absoluteFilePath: string) {
    const fileContents = await this.readFile(absoluteFilePath);
    const fileExt = this.getFileExt(absoluteFilePath);

    switch (fileExt) {
      case FileExtension.JSON: {
        return parseJson(fileContents);
      }
      case FileExtension.YAML:
      case FileExtension.YML: {
        return loadYaml(fileContents);
      }
    }
  }
}

export const fileLoader = (filePath: string = 'env.yaml') => {
  const absoluteFilePath = path.resolve(process.cwd(), filePath);

  return FileLoader.parseFile(absoluteFilePath);
};
