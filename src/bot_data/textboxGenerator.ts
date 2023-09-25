import Canvas from 'canvas';
import word from 'word-wrap';
import { OneshotSprites, OneshotSpritesType } from './textboxSprites';

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

  const canvas = Canvas.createCanvas(608, 128);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(characterSprite, 496, 17);

  // Wrap text if needed
  const wrapText = word(message, { width: 46 });

  // Draw text
  ctx.font = '20px OneshotFont';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(wrapText, 0, 34);

  return canvas.toBuffer('image/png');
}
