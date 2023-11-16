const BEGIN = {
  '0.00': '<:b0:1155216142625943593>',
  '0.01': '<:b10:1155216143775183039>',
  '0.02': '<:b20:1155216145914265670>',
  '0.03': '<:b30:1155216146979635231>',
  '0.04': '<:b40:1155216148665737326>',
  '0.05': '<:b50:1155216150381207583>',
  '0.06': '<:b60:1155216152809705552>',
  '0.07': '<:b70:1155216154856534119>',
  '0.08': '<:b80:1155216156441980949>',
  '0.09': '<:b90:1155216138947547299>',
  '0.1': '<:b100:1155216141157929053>',
};
const CENTER = {
  '0': '<:c0:1155208684591382598>',
  '1': '<:c10:1155208691621056653>',
  '2': '<:c20:1155208698692636672>',
  '3': '<:c30:1155208705428689027>',
  '4': '<:c40:1155208712349306910>',
  '5': '<:c50:1155208719815159878>',
  '6': '<:c60:1155208726916120586>',
  '7': '<:c70:1155208734889484368>',
  '8': '<:c80:1155208741143183421>',
  '9': '<:c90:1155208748227379280>',
  '10': '<:c100:1155208754602704998>',
};
const END = {
  '0': '<:e0:1155215625933815828>',
  '1': '<:e10:1155215627963871404>',
  '2': '<:e20:1155215629121491055>',
  '3': '<:e30:1155215631357071440>',
  '4': '<:e40:1155215632770543737>',
  '5': '<:e50:1155215633991077998>',
  '6': '<:e60:1155215636125982750>',
  '7': '<:e70:1155215637312962710>',
  '8': '<:e80:1155215669273559081>',
  '9': '<:e90:1155215639686955179>',
  '10': '<:e100:1155215624784588850>',
};

function constructProgressBar(songLength: number, playerPosition: number) {
  const songProgress = parseFloat((playerPosition / songLength).toFixed(2));

  let begin: string;
  let center: string;
  let end: string;

  begin = BEGIN[10];
  center = CENTER[1].repeat(8);

  if (songProgress == 0) {
    return `${BEGIN['0.00']}${CENTER['0'].repeat(8)}${END['0']}`;
  }

  if (songProgress >= 1) {
    return `${BEGIN['0.1']}${CENTER['10'].repeat(8)}${END['10']}`;
  }

  // 10%
  if (songProgress <= 0.1) {
    begin = BEGIN[songProgress];
    center = CENTER['0'].repeat(8);
    end = END['0'];
  } else if (songProgress >= 0.1 && songProgress <= 0.9) {
    begin = BEGIN['0.1'];

    const stringifyProgress = songProgress.toString();
    const repeat = parseInt(stringifyProgress.charAt(2));
    const rest = stringifyProgress.charAt(3);
    const repeatRest = 8 - repeat;

    center = CENTER['10'].repeat(repeat);

    if (parseInt(rest) > 0) {
      center += CENTER[rest];
    }

    if (repeatRest > 0) {
      center += CENTER['0'].repeat(repeatRest);
    }

    end = END['0'];
  } else {
    begin = BEGIN['0.1'];
    center = CENTER['10'].repeat(8);

    const rest = songProgress.toString().charAt(3);

    end = END[`${rest}`];
  }

  return `${begin}${center}${end}`;
}

export default constructProgressBar;
