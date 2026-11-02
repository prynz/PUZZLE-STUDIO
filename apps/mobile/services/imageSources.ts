import { Asset } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

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

/**
 * Bundled sample picture (own illustrations, offline).
 *
 * Android release builds ship images as drawable resources and expo-asset then reports the
 * bare resource name ("assets_samples_seaboat") as `localUri`. That displays fine but is no
 * file: the manipulator and the original-copy need one. In that case the asset is copied into
 * the cache first (expo-asset's native download supports resource names).
 */
export async function loadSample(module: number): Promise<PendingImage> {
  const asset = Asset.fromModule(module);
  if (Platform.OS === 'android' && asset.localUri && !asset.localUri.includes(':')) {
    asset.localUri = null;
    asset.downloaded = false;
  }
  await asset.downloadAsync();
  const uri = asset.localUri;
  if (!uri) throw new Error('Sample asset has no local file');
  return {
    uri,
    width: asset.width ?? 1200,
    height: asset.height ?? 900,
    extension: 'jpg',
    kind: 'sample',
  };
}
