attribute vec3 color;
attribute float size;

uniform float pointSize;
uniform vec3 cameraPosition;

varying vec3 vColor;
varying float vDistance;
varying vec3 vWorldPosition;

void main() {
  vColor = color;
  
  // Calculate world position
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  
  // Calculate distance from camera for size attenuation
  float distanceFromCamera = length(mvPosition.xyz);
  
  // Store distance for fragment shader
  vDistance = length(position); // Distance from galaxy center
  
  // Size attenuation based on distance
  gl_PointSize = pointSize * (300.0 / distanceFromCamera);
  
  gl_Position = projectionMatrix * mvPosition;
}