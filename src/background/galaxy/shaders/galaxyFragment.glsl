varying vec3 vColor;
varying float vDistance;
varying vec3 vWorldPosition;

uniform float coreRadius;
uniform float fadeDistance;
uniform float coreBrightness;
uniform float edgeBrightness;
uniform vec3 galaxyCenter;

void main() {
  // Create circular points instead of square
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  float r = dot(cxy, cxy);
  if (r > 1.0) {
    discard;
  }
  
  // Calculate distance from galaxy center
  float distanceFromCenter = length(vWorldPosition - galaxyCenter);
  
  // Realistic galaxy brightness falloff
  // Core region: very bright
  // Transition region: gradual falloff
  // Edge region: dim
  
  float brightness;
  if (distanceFromCenter < coreRadius) {
    // Core region - brightest
    float coreProgress = distanceFromCenter / coreRadius;
    brightness = mix(coreBrightness, coreBrightness * 0.8, coreProgress);
  } else {
    // Falloff region - exponential decay
    float falloffProgress = (distanceFromCenter - coreRadius) / fadeDistance;
    brightness = mix(coreBrightness * 0.8, edgeBrightness, min(falloffProgress, 1.0));
    
    // Additional exponential falloff for realism
    brightness *= exp(-falloffProgress * 0.5);
  }
  
  // Soft circular gradient for points
  float alpha = 1.0 - smoothstep(0.7, 1.0, r);
  
  // Apply brightness to color
  vec3 finalColor = vColor * brightness;
  
  gl_FragColor = vec4(finalColor, alpha * brightness);
}