// Specify order in which effects will be rendered
const EffectOrder = {
  MaskEffect: 0,
  CollideEffect: 1 // Must come after masking as hidden objects don't contribute in collisions
};

export default EffectOrder;
