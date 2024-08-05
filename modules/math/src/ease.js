
export const Ease = {};

Ease.InSine = function(x) {
  return 1 - Math.cos((x * Math.PI) * .5);
}

Ease.OutSine = function(x) {
  return Math.sin((x * Math.PI) * .5);
}

Ease.InOutSine = function(x) {
  return -(Math.cos(Math.PI * x) - 1) * .5;
}

Ease.InQuad = function(x) {
  return x * x;
}

Ease.OutQuad = function(x) {
  return 1 - (1 - x) * (1 - x);
}

Ease.InOutQuad = function(x) {
  return x < .5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) * .5;
}

Ease.InCubic = function(x) {
  return x * x * x;
}

Ease.OutCubic = function(x) {
  return 1 - (1 - x) ** 3;
}

Ease.InOutCubic = function(x) {
  return x < .5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) * .5;
}

Ease.InQuart = function(x) {
  return x * x * x * x;
}

Ease.OutQuart = function(x) {
  return 1 - (1 - x) ** 4;
}

Ease.InOutQuart = function(x) {
  return x < .5 ? 8 * x * x * x * x : 1 - ((-2 * x + 2) ** 4) * .5;
}

Ease.InQuint = function(x) {
  return x * x * x * x * x;
}

Ease.OutQuint = function(x) {
  return 1 - (1 - x) ** 5;
}

Ease.InOutQuint = function(x) {
  return x < .5 ? 16 * x * x * x * x * x : 1 - ((-2 * x + 2) ** 5) * .5;
}

Ease.InExpo = function(x) {
  return x === 0 ? 0 : 2 ** (10 * x - 10);
}

Ease.OutExpo = function(x) {
  return x === 1 ? 1 : 1 - 2 ** (-10 * x);
}

Ease.InOutExpo = function(x) {
  if (!x) return 0;
  if (x == 1) return 1;
  return (x < .5 ? 2 ** (20 * x - 10) : (2 - 2 ** (-20 * x + 10))) * .5;
}

Ease.InCirc = function(x) {
  return 1 - Math.sqrt(1 - x ** 2);
}

Ease.OutCirc = function(x) {
  return Math.sqrt(1 - (x - 1) ** 2);
}

Ease.InOutCirc = function(x) {
  return (x < .5 ? 1 - Math.sqrt(1 - (2 * x) ** 2) : Math.sqrt(1 - (-2 * x + 2) ** 2) + 1) * .5
}

Ease.InBack = function(x) {
  const c1 = 1.70158,
        c2 = 2.70158;
  return c2 * x * x * x - c1 * x * x;
}

Ease.OutBack = function(x) {
  const c1 = 1.70158,
        c2 = 2.70158;
  return 1 + c2 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
}

Ease.InOutBack = function(x) {
  const c1 = 1.70158,
        c2 = 2.5949095;
  return (x < .5 ? ((2 * x) ** 2 * ((c2 + 1) * 2 * x - c2)) : ((2 * x - 2) ** 2 * ((c2 + 1) * (x * 2 - 2) + c2) + 2)) * .5;
}

Ease.InElastic = function(x) {
  if (!x) return 0;
  if (x == 1) return 1;
  return -(2 ** (10 * x - 10)) * Math.sin((x * 10 - 10.75) * ((2 * Math.PI) / 3));
}

Ease.OutElastic = function(x) {
  if (!x) return 0;
  if (x == 1) return 1;
  return 2 ** (-10 * x) * Math.sin((x * 10 - .75) * ((2 * Math.PI) / 3)) + 1;
}

Ease.InOutElastic = function(x) {
  if (!x) return 0;
  if (x == 1) return 1;
  
  const c1 = (2 * Math.PI) / 4.5;
  return x < .5 ? -((2 ** (20 * x - 10)) * Math.sin((20 * x - 11.125) * c1)) * .5 : ((2 * (-20 * x + 10)) * Math.sin((20 * x - 11.125) * c1)) * .5 + 1;
}

Ease.InBounce = function(x) {
  return 1 - Ease.OutBounce(1 - x);
}

Ease.OutBounce = function(x) {
  const n1 = 7.5625,
        d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + .75;
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + .9375;
  return n1 * (x -= 2.625 / d1) * x + .984375;
}

Ease.InOutBounce = function(x) {
  return (x < .5 ? (1 - Ease.OutBounce(1 - 2 * x)) : (1 + Ease.OutBounce(2 * x - 1))) * .5;
}