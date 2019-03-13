import test from 'tape-catch';
import LayerPropsAnimation from '@deck.gl/core/lifecycle/prop-animation';

test('LayerPropsAnimation#constructor', t => {
  let animation = new LayerPropsAnimation();
  t.ok(animation, 'LayerPropsAnimation is constructed without initial value');

  animation = new LayerPropsAnimation(1);
  t.ok(animation, 'LayerPropsAnimation is constructed with initial value');
  t.is(animation.value, 1, 'LayerPropsAnimation has value');

  t.end();
});

test('LayerPropsAnimation#update', t => {
  let animation = new LayerPropsAnimation();
  t.is(animation.isDone(), true, 'no animation in the beginning');
  t.doesNotThrow(() => animation.update(0), 'update() does not throw error');

  animation = new LayerPropsAnimation().to({value: 1, duration: 100});
  t.is(animation.isDone(), false, 'animation added');
  animation.update(0);
  t.is(animation.value, 1, 'evaluates to correct value');
  t.is(animation.isDone(), false, 'animation is in progress');
  animation.update(100);
  t.is(animation.value, 1, 'evaluates to correct value');
  t.is(animation.isDone(), true, 'animation is finished');

  animation = new LayerPropsAnimation(1)
    .to({value: 2, duration: 100})
    .to({value: 3, duration: 200});
  t.is(animation.isDone(), false, 'animation added');
  animation.update(0);
  t.is(animation.value, 1, 'evaluates to correct value');
  animation.update(50);
  t.is(animation.value, 1.5, 'evaluates to correct value');
  animation.update(100);
  t.is(animation.value, 2, 'evaluates to correct value');
  animation.update(150);
  t.is(animation.value, 2.25, 'evaluates to correct value');
  animation.update(300);
  t.is(animation.value, 3, 'evaluates to correct value');
  t.is(animation.isDone(), true, 'animation is finished');

  animation = new LayerPropsAnimation(1)
    .to({value: 2, duration: 100})
    .to({value: 3, duration: 200})
    .loop();
  animation.update(0);
  animation.update(100);
  animation.update(300);
  t.is(animation.value, 3, 'evaluates to correct value');
  t.is(animation.isDone(), false, 'animation is finished');
  animation.update(350);
  t.is(animation.value, 2.5, 'evaluates to correct value');

  animation = new LayerPropsAnimation(1).to({value: 2, duration: 100});
  animation.update(0);
  animation.update(50);
  t.is(animation.value, 1.5, 'evaluates to correct value');
  t.is(animation.isDone(), false, 'animation is in progress');
  animation.cancel();
  t.is(animation.isDone(), true, 'animation is cancelled');
  animation.update(100);
  t.is(animation.value, 1.5, 'evaluates to correct value');
  animation.to({value: 2.5, duration: 200});
  animation.update(200);
  t.is(animation.value, 2, 'evaluates to correct value');

  t.throws(() => new LayerPropsAnimation().to({}), 'invalid keyframe');

  t.end();
});

test('LayerPropsAnimation#interpolation', t => {
  const FUNC1 = d => d.position;
  const FUNC2 = d => d.position;
  let animation = new LayerPropsAnimation(FUNC1).to({value: FUNC2, duration: 100});
  animation.update(0);
  t.is(animation.value, FUNC2, 'functions interpolated correctly');

  animation = new LayerPropsAnimation(FUNC1).to({value: [0, 0, 0], duration: 100});
  animation.update(0);
  t.deepEqual(animation.value, [0, 0, 0], 'non-matching types interpolated correctly');

  animation = new LayerPropsAnimation([200, 200, 200]).to({
    value: [0, 0, 0],
    duration: 100,
    easing: t => t * t
  });
  animation.update(0);
  t.deepEqual(animation.value, [200, 200, 200], 'arrays interpolated correctly');
  animation.update(50);
  t.deepEqual(animation.value, [150, 150, 150], 'arrays interpolated correctly');
  animation.update(100);
  t.deepEqual(animation.value, [0, 0, 0], 'arrays interpolated correctly');

  t.end();
});
