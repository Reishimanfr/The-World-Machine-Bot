import Canvas from 'canvas';
import { OneshotSprites, OneshotSpritesType } from './textboxSprites';
import util from '../misc/Util';

export async function generateTextbox(
  message: string,
  expression: OneshotSpritesType,
  character: OneshotSpritesType
): Promise<Buffer> {
  Canvas.registerFont(`${__dirname}/../../oneshotFont.ttf`, {
    family: 'OneshotFont',
  });

  const background = await Canvas.loadImage('https://i.imgur.com/rtIwEL7.png');
  const characterSprite = await Canvas.loadImage(
    OneshotSprites[character][expression].asset
  );

  // 608x128 is the size of oneshot textboxes in-game
  const canvas = Canvas.createCanvas(608, 128);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  // dx 496 dy 17 are exact coordiantes there the character asset is placed
  ctx.drawImage(characterSprite, 496, 17);

  // Draw text
  ctx.font = '20px OneshotFont';
  ctx.fillStyle = '#ffffff';
  // Wrap text if needed
  ctx.fillText(util.wrapString(message, 46), 0, 34);

  return canvas.toBuffer('image/png');
}
