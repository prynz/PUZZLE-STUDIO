import type { Rgb } from '@puzzle-studio/image-processing';
import { Skia, rect, type SkImage } from '@shopify/react-native-skia';

const PER_CELL = 4;

/**
 * Average colour of every grid cell of the WORK image (row-major, = piece ids). The picture is
 * drawn into a tiny CPU surface (cols·4 × rows·4 px) and read back – no image data leaves the app.
 * Returns null if the platform cannot read pixels; the game then simply shows no colour baskets.
 */
export function sampleCellColors(image: SkImage, rows: number, cols: number): Rgb[] | null {
  const w = cols * PER_CELL;
  const h = rows * PER_CELL;
  const surface = Skia.Surface.Make(w, h);
  if (!surface) return null;
  const paint = Skia.Paint();
  surface.getCanvas().drawImageRect(image, rect(0, 0, image.width(), image.height()), rect(0, 0, w, h), paint);
  surface.flush();
  const px = surface.makeImageSnapshot().readPixels();
  if (!px || px.length < w * h * 4) return null;
  const scale = px instanceof Float32Array ? 255 : 1;
  const out: Rgb[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let sr = 0;
      let sg = 0;
      let sb = 0;
      for (let y = 0; y < PER_CELL; y++) {
        for (let x = 0; x < PER_CELL; x++) {
          const i = ((r * PER_CELL + y) * w + c * PER_CELL + x) * 4;
          sr += (px[i] ?? 0) * scale;
          sg += (px[i + 1] ?? 0) * scale;
          sb += (px[i + 2] ?? 0) * scale;
        }
      }
      const n = PER_CELL * PER_CELL;
      out.push([sr / n, sg / n, sb / n]);
    }
  }
  return out;
}
