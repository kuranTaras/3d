uniform vec3 color1;
uniform vec3 color2;

uniform vec2 step;
uniform float saturation;

uniform sampler2D tDiffuse;
varying vec2 vUv;

const vec3 luminanceWeighting = vec3(0.2125, 0.7154, 0.0721);

float blendOverlay(float base, float blend) {
  return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
  return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
  return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendHardLight(vec3 base, vec3 blend) {
  return blendOverlay(blend,base);
}

vec3 blendHardLight(vec3 base, vec3 blend, float opacity) {
  return (blendHardLight(base, blend) * opacity + base * (1.0 - opacity));
}

const float Epsilon = 1e-10;

vec3 RGBtoHSV(in vec3 RGB)
{
    vec4  P   = (RGB.g < RGB.b) ? vec4(RGB.bg, -1.0, 2.0/3.0) : vec4(RGB.gb, 0.0, -1.0/3.0);
    vec4  Q   = (RGB.r < P.x) ? vec4(P.xyw, RGB.r) : vec4(RGB.r, P.yzx);
    float C   = Q.x - min(Q.w, Q.y);
    float H   = abs((Q.w - Q.y) / (6.0 * C + Epsilon) + Q.z);
    vec3  HCV = vec3(H, C, Q.x);
    float S   = HCV.y / (HCV.z + Epsilon);
    return vec3(HCV.x, S, HCV.z);
}

vec3 HSVtoRGB(in vec3 HSV)
{
    float H   = HSV.x;
    float R   = abs(H * 6.0 - 3.0) - 1.0;
    float G   = 2.0 - abs(H * 6.0 - 2.0);
    float B   = 2.0 - abs(H * 6.0 - 4.0);
    vec3  RGB = clamp( vec3(R,G,B), 0.0, 1.0 );
    return ((RGB - 1.0) * HSV.y + 1.0) * HSV.z;
}


void main() {
  vec4 color    = texture2D(tDiffuse, vUv);
  vec3 gradient = mix(color1, color2, smoothstep(step.x, step.y, vUv.y));
  float luminance = dot(color.rgb, luminanceWeighting);
  vec3 saturatedColor = blendHardLight(color.rgb, gradient, luminance);
  vec3 col_hsv = RGBtoHSV(saturatedColor);
  col_hsv.y *= (saturation * 2.0);
  saturatedColor = HSVtoRGB(col_hsv.rgb);

  gl_FragColor  = vec4(saturatedColor, color.a);
}
