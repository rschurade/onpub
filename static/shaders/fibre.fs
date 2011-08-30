#ifdef GL_ES
precision highp float;
#endif

varying vec3 normal;
varying vec4 vPosition;

uniform bool uIsHighlighted;
uniform bool uSomethingHighlighted;

uniform vec3 uFibreColor;
uniform bool uFibreColorMode;

varying vec3 tangentR3; // Tangent vector in world space
varying float s_param; // s parameter of texture [-1..1]
varying float tangent_dot_view;

void main(void) 
{
	vec3 color;
	
	if ( uFibreColorMode )
	{
		color = abs(normalize(tangentR3));
	}
	else
	{
		color = uFibreColor;
	}

	if ( uSomethingHighlighted && !uIsHighlighted )
	{
		color = vec3( 0.4, 0.4, 0.4 );
	}
	
	vec3 view = vec3(0., 0., -1.);
    float view_dot_normal = sqrt(1. - s_param * s_param) + .1;

    gl_FragColor.rgb = clamp(view_dot_normal * (color + 0.15 * pow( view_dot_normal, 10.) *
						pow(tangent_dot_view, 10.) * vec3(1., 1., 1.)), 0., 1.); //< set the color of this fragment (i.e. pixel)
				
	gl_FragColor.a = 1.0;
	

}