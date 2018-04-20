// const BRIGHTNESS = {'0': 14, '1': 126, '2': 102, '3': 95, '4': 95, '5': 81, '6': 57, '7': 131, '8': 43, '9': 57, ' ': 255, '!': 176, '"': 198, '#': 69, '$': 57, '%': 43, '&': 31, '\'': 214, '(': 122, ')': 124, '*': 148, '+': 169, ',': 210, '-': 222, '.': 231, '/': 172, ':': 210, ';': 186, '<': 167, '=': 162, '>': 167, '?': 148, '@': 43, 'A': 69, 'B': 45, 'C': 119, 'D': 57, 'E': 93, 'F': 122, 'G': 79, 'H': 64, 'I': 112, 'J': 133, 'K': 69, 'L': 143, 'M': 14, 'N': 33, 'O': 60, 'P': 86, 'Q': 33, 'R': 48, 'S': 98, 'T': 126, 'U': 79, 'V': 91, 'W': 5, 'X': 76, 'Y': 124, 'Z': 88, '[': 112, '\\': 172, ']': 110, '^': 167, '_': 210, '`': 236, 'a': 95, 'b': 71, 'c': 143, 'd': 71, 'e': 107, 'f': 129, 'g': 50, 'h': 98, 'i': 162, 'j': 131, 'k': 95, 'l': 143, 'm': 81, 'n': 119, 'o': 107, 'p': 76, 'q': 76, 'r': 157, 's': 124, 't': 129, 'u': 119, 'v': 141, 'w': 83, 'x': 122, 'y': 112, 'z': 117, '{': 117, '|': 184, '}': 117, '~': 198, '': 255};

function normalizeCharacterBrightness(darkPixelsByCharacter) {
  let min = Infinity;
  let max = 0;
  for (const char in darkPixelsByCharacter) {
    const b = darkPixelsByCharacter[char];
    min = b < min ? b : min;
    max = b > max ? b : max;
  }

  if (max === 0) {
    throw Error('Characters are blank');
  }

  const brightness = {};
  for (const char in darkPixelsByCharacter) {
    const b = darkPixelsByCharacter[char];
    brightness[char] = Math.floor((max - b) / (max - min) * 255);
  }
  return brightness;
}

export function sortCharactersByBrightness(darkPixelsByCharacter) {
  const brightness = normalizeCharacterBrightness(darkPixelsByCharacter);
  const sortedBrightness = new Array(256);

  for (const char in brightness) {
    const b = brightness[char];
    let group = sortedBrightness[b];

    if (!group) {
      group = {options: [], char};
      sortedBrightness[b] = group;
    }
    group.options.push(char);
  }

  let lastGroup;
  for (let i = 256; i--; ) {
    const group = sortedBrightness[i];

    if (group) {
      lastGroup = group;
    } else {
      sortedBrightness[i] = {char: lastGroup.options[i % lastGroup.options.length]};
    }
  }

  return sortedBrightness.map(b => b.char);
}
