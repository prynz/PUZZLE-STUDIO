import type { Rotation } from '@puzzle-studio/image-processing';
import { Directory, File, Paths } from 'expo-file-system';

import { createId } from '@/utils/id';

import { getDatabase } from '../database';
import type { ImageSourceKind, ImageStore, StoredImage } from './types';

interface ImageRow {
  id: string;
  source_kind: ImageSourceKind;
  original_file: string;
  width: number;
  height: number;
  bytes: number;
  rotation: Rotation;
  crop_x: number;
  crop_y: number;
  crop_w: number;
  crop_h: number;
  work_file: string;
  work_width: number;
  work_height: number;
  thumb_file: string;
  created_at: number;
}

/** Each image lives in documents/images/<id>/ – DB stores only file NAMES (container paths change on iOS updates). */
const imageDir = (id: string) => new Directory(Paths.document, 'images', id);

function toStored(r: ImageRow): StoredImage {
  const dir = imageDir(r.id);
  return {
    id: r.id,
    sourceKind: r.source_kind,
    width: r.width,
    height: r.height,
    rotation: r.rotation,
    crop: { x: r.crop_x, y: r.crop_y, w: r.crop_w, h: r.crop_h },
    work: { uri: new File(dir, r.work_file).uri, width: r.work_width, height: r.work_height },
    thumbUri: new File(dir, r.thumb_file).uri,
    createdAt: r.created_at,
  };
}

/** Native: original (byte-identical copy) + derived files on disk, metadata in SQLite. */
export function createPersistentImageStore(): ImageStore {
  return {
    async list() {
      const db = await getDatabase();
      const rows = await db.getAllAsync<ImageRow>('SELECT * FROM image ORDER BY created_at DESC');
      return rows.map(toStored);
    },

    async add(input) {
      const db = await getDatabase();
      const id = createId();
      const dir = imageDir(id);
      dir.create({ intermediates: true, idempotent: true });
      try {
        const originalName = `original.${input.extension}`;
        const original = new File(dir, originalName);
        // Non-destructive: the original is copied unchanged and never written again.
        new File(input.sourceUri).copy(original);
        const workName = `work-${input.derived.hash}.jpg`;
        const thumbName = `thumb-${input.derived.hash}.jpg`;
        new File(input.derived.work.uri).move(new File(dir, workName));
        new File(input.derived.thumb.uri).move(new File(dir, thumbName));
        const row: ImageRow = {
          id,
          source_kind: input.sourceKind,
          original_file: originalName,
          width: input.width,
          height: input.height,
          bytes: original.size ?? 0,
          rotation: input.rotation,
          crop_x: input.crop.x,
          crop_y: input.crop.y,
          crop_w: input.crop.w,
          crop_h: input.crop.h,
          work_file: workName,
          work_width: input.derived.work.width,
          work_height: input.derived.work.height,
          thumb_file: thumbName,
          created_at: Date.now(),
        };
        await db.runAsync(
          `INSERT INTO image (id, source_kind, original_file, width, height, bytes, rotation, crop_x, crop_y, crop_w, crop_h,
             work_file, work_width, work_height, thumb_file, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          row.id,
          row.source_kind,
          row.original_file,
          row.width,
          row.height,
          row.bytes,
          row.rotation,
          row.crop_x,
          row.crop_y,
          row.crop_w,
          row.crop_h,
          row.work_file,
          row.work_width,
          row.work_height,
          row.thumb_file,
          row.created_at,
        );
        return toStored(row);
      } catch (e) {
        // Leave no half-written image behind.
        if (dir.exists) dir.delete();
        throw e;
      }
    },

    async clear() {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM image'); // puzzles + saved games follow via ON DELETE CASCADE
      const root = new Directory(Paths.document, 'images');
      if (root.exists) root.delete();
    },

    async usage() {
      const root = new Directory(Paths.document, 'images');
      if (!root.exists) return 0;
      const walk = (dir: Directory): number =>
        dir.list().reduce((sum, entry) => sum + (entry instanceof Directory ? walk(entry) : (entry.size ?? 0)), 0);
      return walk(root);
    },

    async remove(id) {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM image WHERE id = ?', id);
      const dir = imageDir(id);
      if (dir.exists) dir.delete();
    },
  };
}
