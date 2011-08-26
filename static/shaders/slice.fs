#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec3 vTransformedNormal;
varying vec4 vPosition;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform sampler2D uSampler1;
uniform bool isT1;

void main(void) {
	
	vec4 fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
	vec4 fragmentColor1 = texture2D(uSampler1, vec2(vTextureCoord.s, vTextureCoord.t));
	
	if (isT1)
	{
		// need this to counter strange interpolation effects;
		fragmentColor.g = fragmentColor.r;
		fragmentColor.b = fragmentColor.r;

		// discard zero values
		if ( fragmentColor.r < 0.03 )
		{
			discard;
		}

		// smooth interpolation at boundary voxels
		if ( fragmentColor.r < 0.06 )
		{
			fragmentColor.a = fragmentColor.r * 100.0 / 0.06;
		}
		
		// if present show secondary texture
		if ( ( fragmentColor1.r + fragmentColor1.g + fragmentColor1.b ) > 0.7 )
		{
			fragmentColor = vec4(mix(fragmentColor.rgb, fragmentColor1.rgb, 1.0), 1.0 );
		}
	}
	else
	{
		// color texture, discard zero values
		if ( ( ( fragmentColor.r + fragmentColor.g + fragmentColor.b ) / 3.0 ) < 0.001 )
			discard;
	}	
	
	gl_FragColor = vec4(fragmentColor.r, fragmentColor.g, fragmentColor.b, fragmentColor.a);
}