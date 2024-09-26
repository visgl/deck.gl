export const WIDTH = 800;
export const HEIGHT = 450;

// Different Platforms render text differently. The golden images
// are currently generated on Mac OS X
/* global navigator */
let OS;
if (navigator.platform.startsWith('Mac')) {
  OS = 'Mac';
} else if (navigator.platform.startsWith('Win')) {
  OS = 'Windows';
} else {
  OS = 'Other';
}

export {OS};
