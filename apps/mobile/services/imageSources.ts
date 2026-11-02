import { Asset } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';

import type { ImageSourceKind } from '@/storage/images/types';

/** An image chosen by the user, before cropping. Kept in memory only. */
export interface PendingImage {
  uri: string;
  width: number;
  height: number;
  extension: string;
  kind: ImageSourceKind;
}

export type PickResult = { status: 'ok'; image: PendingImage } | { status: 'canceled' } | { status: 'denied' };

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/** Extension from MIME type only – user file names are never read or stored. */
export function extensionFor(mimeType: string | null | undefined): string {
  return (mimeType && EXT_BY_MIME[mimeType.toLowerCase()]) || 'jpg';
}

function fromAsset(a: ImagePicker.ImagePickerAsset, kind: ImageSourceKind): PendingImage {
  return { uri: a.uri, width: a.width, height: a.height, extension: extensionFor(a.mimeType), kind };
}

const OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 1,
  exif: false,
  allowsEditing: false,
};

/** System photo picker – needs no media permission. */
export async function pickFromLibrary(): Promise<PickResult> {
  const res = await ImagePicker.launchImageLibraryAsync(OPTIONS);
  const a = res.canceled ? undefined : res.assets[0];
  return a ? { status: 'ok', image: fromAsset(a, 'library') } : { status: 'canceled' };
}

/** Camera – permission is requested only now, when the user taps "Foto aufnehmen". */
export async function takePhoto(): Promise<PickResult> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return { status: 'denied' };
  const res = await ImagePicker.launchCameraAsync(OPTIONS);
  const a = res.canceled ? undefined : res.assets[0];
  return a ? { status: 'ok', image: fromAsset(a, 'camera') } : { status: 'canceled' };
}

/** Bundled sample picture (own illustrations, offline). */
export async function loadSample(module: number): Promise<PendingImage> {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();
  return {
    uri: asset.localUri ?? asset.uri,
    width: asset.width ?? 1200,
    height: asset.height ?? 900,
    extension: 'jpg',
    kind: 'sample',
  };
}
