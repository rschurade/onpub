attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform vec3 uPointLightingLocation;
uniform float uZoom;

varying vec3 normal;
varying vec4 vPosition;

varying float tangent_dot_view;
varying vec3 tangentR3;
varying float s_param;

void main(void) 
{
	vPosition = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	normal = normalize(aVertexNormal);

	s_param = aTextureCoord.x; //< store texture coordinate for shader

	tangentR3 = normal;
	vec3 tangent;
	tangent = (uPMatrix * uMVMatrix * vec4(normal,0.)).xyz; //< transform our tangent vector
	float thickness = 0.005 * uZoom;
	
	vec3 offsetNN = cross( normalize( tangent.xyz ), vec3( 0., 0., -1. ) );
	vec3 offset = normalize(offsetNN);
	tangent_dot_view = length(offsetNN);

	offset.x *= thickness;
	offset.y *= thickness;

	vPosition.xyz = ( offset * s_param ) + vPosition.xyz; //< add offset in y-direction (eye-space)

	gl_Position = vPosition; //< store final position
}