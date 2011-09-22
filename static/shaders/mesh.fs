#ifdef GL_ES
precision highp float;
#endif

varying vec3 normal;
varying vec4 vPosition;
varying vec3 vOrigPosition;
varying vec4 vColor;
varying vec3 vLightPos;

uniform vec3 uAmbientColor;
uniform vec3 uPointLightingDiffuseColor;
uniform bool useLight;
uniform float uAlpha;

uniform bool uIsHighlighted;
uniform bool uSomethingHighlighted;

uniform vec3 uSliceLocation;
uniform int uSector;
uniform bool uCutFS;

uniform bool uPicking;
uniform vec3 uPickColor;

uniform bool uCutWhite;

void cutFrontSector()
{
    float cx = uSliceLocation.x;
    float cy = uSliceLocation.y;
    float cz = uSliceLocation.z;

	if (uSector == 1 && vOrigPosition.x > cx && vOrigPosition.y > cy && vOrigPosition.z > cz)
			discard;
	if (uSector == 2 && vOrigPosition.x > cx && vOrigPosition.y > cy && vOrigPosition.z < cz)
			discard;
	if (uSector == 3 && vOrigPosition.x > cx && vOrigPosition.y < cy && vOrigPosition.z < cz)
			discard;
	if (uSector == 4 && vOrigPosition.x > cx && vOrigPosition.y < cy && vOrigPosition.z > cz)
			discard;
	if (uSector == 5 && vOrigPosition.x < cx && vOrigPosition.y < cy && vOrigPosition.z > cz)
			discard;
	if (uSector == 6 && vOrigPosition.x < cx && vOrigPosition.y < cy && vOrigPosition.z < cz)
			discard;
	if (uSector == 7 && vOrigPosition.x < cx && vOrigPosition.y > cy && vOrigPosition.z < cz)
			discard;
	if (uSector == 8 && vOrigPosition.x < cx && vOrigPosition.y > cy && vOrigPosition.z > cz)
			discard;
}

void main(void) 
{
	if (uCutFS)
	{
		cutFrontSector();
	}
	
	vec4 fragmentColor = vColor;
	fragmentColor.a = uAlpha;
	
	if ( fragmentColor.a < 1.0 )
	{
		float dir = dot(normal, normalize(vLightPos));
		if ( dir < 0.0 )
		{
			discard;
		}
	}
	
	
	if ( uCutWhite && ( ( vColor.r + vColor.g + vColor.b ) != 3.0 ) )
	{
		fragmentColor.a = 1.0;
	}

	if ( uPicking )
	{
		gl_FragColor = vec4(uPickColor,1.0);
	}
	else
	{
		vec3 lightWeighting;
	
		vec3 lightDirection = normalize(vLightPos);
	
		float diffuseLightWeighting = max(dot(normal, lightDirection), 0.0);
			
		lightWeighting = uAmbientColor + uPointLightingDiffuseColor * diffuseLightWeighting;
	
		if ( uSomethingHighlighted && !uIsHighlighted )
		{
			fragmentColor = vec4( 0.4, 0.4, 0.4, fragmentColor.a );
		}
		
		gl_FragColor = vec4(fragmentColor.rgb * lightWeighting * fragmentColor.a, fragmentColor.a);

	}
}