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

	vec3 lightWeighting;

	vec3 lightDirection = normalize(vLightPos);

	float diffuseLightWeighting = max(dot(normal, lightDirection), 0.0);
		
	lightWeighting = uAmbientColor + uPointLightingDiffuseColor * diffuseLightWeighting;

	vec4 fragmentColor = vColor;
	
	if ( uSomethingHighlighted && !uIsHighlighted )
	{
		fragmentColor = vec4( 0.4, 0.4, 0.4, vColor.a );
	}
	
	if ( useLight)
	{
		gl_FragColor = vec4(fragmentColor.rgb * lightWeighting * uAlpha, fragmentColor.a * uAlpha);
	}
	else
	{
		gl_FragColor = vec4(fragmentColor.rgb * uAlpha,fragmentColor.a  * uAlpha);
	}
}