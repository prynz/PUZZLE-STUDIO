import type { CropRect, Rotation } from '@puzzle-studio/image-processing';

export type ImageSourceKind = 'camera' | 'library' | 'sample';

export interface DerivedFile {
  uri: string;
  width: number;
  height: number;
}

/** Work version + thumbnail derived from the untouched original. */
export interface DerivedImages {
  work: DerivedFile;
  thumb: DerivedFile;
  /** transformHash of (rotation, crop, size) – part of the file names. */
  hash: string;
}

export interface NewImage {
  /** Temporary URI from picker / camera / bundled sample. Copied byte-for-byte as the original. */
  sourceUri: string;
  sourceKind: ImageSourceKind;
  /** File extension of the original (jpg, png, heic …), lowercase, without dot. */
  extension: string;
  width: number;
  height: number;
  rotation: Rotation;
  crop: CropRect;
  derived: DerivedImages;
}

export interface StoredImage {
  id: string;
  sourceKind: ImageSourceKind;
  width: number;
  height: number;
  rotation: Rotation;
  crop: CropRect;
  work: DerivedFile;
  thumbUri: string;
  createdAt: number;
}

export interface ImageStore {
  list(): Promise<StoredImage[]>;
  add(input: NewImage): Promise<StoredImage>;
  /** Removes the row AND all files (original, work version, thumbnail). */
  remove(id: string): Promise<void>;
  /** Deletes every image with all its files (parents: "delete all data"). */
  clear(): Promise<void>;
  /** Bytes used by all image files on this device; null where not measurable (web preview). */
  usage(): Promise<number | null>;
}
