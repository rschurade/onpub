var Viewer = (function() 
{
/****************************************************************************************************
*
*	definition of global variables
*
/****************************************************************************************************/
	var $id = function(d) { return document.getElementById(d); };
    var $container;
	
    var elements = {}; // array of loaded triangle meshes and fiber bundles
	var activations = {}; // array of activations
	var scenes = {}; // array of scenes
	
	var textures = {};
	var t1 = {};
	textures["t1"] = {};
	textures["fa_rgb"] = {};
	textures["gabi2a"] = {};
	textures["gabi2b"] = {};
	textures["michi"] = {};
	textures["fig10"] = {};
	textures["fig13p"] = {};
	textures["fig13a"] = {};
		
	var preloadTextures; // stores the preload textures interval for clearinterval()
	var preloadCounterAxial = 1; // 
	var preloadCounterCoronal = 1; //
		
	// global variables for webgl
	var zoom = 1.0;
	var gl; // the stores the webgl context
	var m_lastRot = mat4.create(); // accumulates the rotations from the arcball
	mat4.identity(m_lastRot); 
	var m_thisRot = mat4.create(); // current rotation matrix
	mat4.identity(m_thisRot);
	
	var mvMatrix = mat4.create(); // model view matrix
    var pMatrix = mat4.create(); // projection matrix
	var normalMatrix = mat3.create(); // normal matrix
	
	mat4.rotateX(m_thisRot, 2.0);
	mat4.rotateY(m_thisRot, -2.2);
	mat4.rotateZ(m_thisRot, 0.2);
	
    var canvas; // = document.getElementById("viewer-canvas"); // id of canvas in the DOM
    var $canvas; // jQuery object of the canvas element
	var vd; // = document.getElementById("viewer"); // id of div holding the canvas
	var shaderPrograms = {}; // array storing the loaded shader programs
	var shaders = {}; // array storing the shaders
	var lightPos = vec3.create(); // light position
	
	var secondaryTexture = "none"; //"fmri1";
	
	// global variables for mouse interaction
    var leftMouseDown = false;
	var middleMouseDown = false;
	var middleMouseClickX = 0;
	var middleMouseClickY = 0;
	var screenMoveX = 0;
	var screenMoveY = 0;
	var screenMoveXold = 0;
	var screenMoveYold = 0;

	// initial positions of navigation slices
	var axial = 0;
	var coronal = 0;
	var sagittal = 0;
	
	var colorTextures = false;
	var localFibreColor = false;
	
	var needsRedraw = false; // flag indicating the scene needs redrawing, only drawing the scene 
							 // when something changed to reduces cpu usage
	var somethingHighlighted = false; // global flag indicating something is highlighted, for use in shader
	
	
/****************************************************************************************************
*
*	init and loading of all the elements
*
/****************************************************************************************************/
	function init(opts) 
	{
        $canvas = $(opts.canvas);
        canvas = $canvas[0];
		vd = $(opts.container)[0];
        
        $(Viewer).bind('loadElementsComplete', function(event) 
		{
            // wenn alle Elemente geladen wurden, soll der »ready«-Event gefeuert werden.
            $(Viewer).trigger('ready');
			needsRedraw = true;
        });
		
        // hier sollte der eigentliche WebGL-Viewer initialisiert werden …
        try {
		    initGL(canvas);
	    } catch(e) {
	        $(Viewer).trigger('webglNotSupported', e);
            return;
	    }
		Arcball.set_win_size($canvas.width(), $canvas.height());
		loadShaders();
        
		if ('backgroundColor' in opts) 
		{
            gl.clearColor(opts.backgroundColor[0], opts.backgroundColor[1], opts.backgroundColor[2], opts.backgroundColor[3])
        } else {
    		gl.clearColor(1.0, 1.0, 1.0, 1.0);
        }
        
		gl.enable(gl.DEPTH_TEST);
		
		//initTextureFramebuffer();
		
		if ('elements' in opts && opts.elements.length) 
		{
            loadElements(opts.elements);
        }
		
		if ('activations' in opts && opts.activations.length)
		{
		    loadActivations(opts.activations);
		}
        
		loadScenes();
		
		canvas.onmousedown = handleMouseDown;
        canvas.onmouseup = handleMouseUp;
        canvas.onmousemove = handleMouseMove;
		//canvas.onmousewheel = handleMouseWheel;
		canvas.addEventListener('DOMMouseScroll',handleMouseWheel,false);
		canvas.addEventListener('mousewheel',handleMouseWheel,false);
		
		preloadTextures = setInterval(texturePreload, 200);
		tick();
    }
	
	function tick() 
	{
        requestAnimFrame(tick);
        drawScene();
    }
	
	/****************************************************************************************************
	*
	*	init webgl
	*
	/****************************************************************************************************/
    function initGL(canvas) 
	{
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = $canvas.width();
        gl.viewportHeight = $canvas.height();
    }
    
    var rttFramebuffer;
    var rttTexture;

    function initTextureFramebuffer() {
        rttFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
        rttFramebuffer.width = 512;
        rttFramebuffer.height = 512;

        rttTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, rttTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rttFramebuffer.width, rttFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        var renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, rttFramebuffer.width, rttFramebuffer.height);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
	
	/****************************************************************************************************
	*
	*	load functions
	*
	/****************************************************************************************************/
    function loadElements(elementsToLoad) 
	{
        $(Viewer).trigger('loadElementsStart');
        
        // alle Elemente durchgehen, …
        $.each(elementsToLoad, function(i, el) 
		{
            $(Viewer).trigger('loadElementStart', {'id': el.id});
            
            // … die JSON-Daten von der URL laden, …
            $.getJSON(settings.STATIC_URL + el.url, function(data) 
			{
                // … in der oben definierten Eigenschaft »elements« speichern, …
                elements[el.id] = data;
				if ( elements[el.id].correction )
				{
					for ( var m = 0; m < elements[el.id].vertices.length/3; ++m )
					{
						elements[el.id].vertices[3*m] += elements[el.id].correction[0];
						elements[el.id].vertices[3*m+1] += elements[el.id].correction[1];
						elements[el.id].vertices[3*m+2] += elements[el.id].correction[2];
					}	
				}
				
				if ( !elements[el.id].colors )
				{
					colorSize = ( elements[el.id].indices.length / 3 ) * 4;
					colors = [];
					
					if ( el.color)
					{
						for ( var k = 0; k < colorSize/4; ++k )
						{
							colors.push(el.color.r);
							colors.push(el.color.g);
							colors.push(el.color.b);
							colors.push(1);
						}
					}
					else
					{
						for ( var k = 0; k < colorSize; ++k )
						{
							colors.push(1);
						}
					}
					elements[el.id].colors = colors;
				}
				
				elements[el.id].name = el.name;
				elements[el.id].type = el.type;
				elements[el.id].display = el.display;
				elements[el.id].cutFS = el.cutFS;
				elements[el.id].transparency = el.transparency;
				elements[el.id].hasBuffer = false;
				elements[el.id].isHighlighted = false;
				
				
				if ( el.type == "fibre" )
				{
					tubeVertices = [];
					tubeTexCoords = [];
					
					for ( var m = 0; m < elements[el.id].vertices.length/3; ++m )
					{
						tubeVertices.push( elements[el.id].vertices[3*m] );
						tubeVertices.push( elements[el.id].vertices[3*m+1] );
						tubeVertices.push( elements[el.id].vertices[3*m+2] );
						tubeVertices.push( elements[el.id].vertices[3*m] );
						tubeVertices.push( elements[el.id].vertices[3*m+1] );
						tubeVertices.push( elements[el.id].vertices[3*m+2] );
						
						tubeTexCoords.push( 1.0 );
						tubeTexCoords.push( 0.0 );
						tubeTexCoords.push( -1.0 );
						tubeTexCoords.push( 0.0 );
					}
					
					elements[el.id].tubeVertices = tubeVertices;
					elements[el.id].tubeTexCoords = tubeTexCoords;
					calcTubeNormals(elements[el.id]);
					
					elements[el.id].color = el.color;
				}
				
				$(Viewer).trigger('loadElementComplete', {'id': el.id});
				
                // … das verarbeitete Element aus dem »elementsToLoad«-Array löschen und …
                elementsToLoad = $.grep(elementsToLoad, function(val) 
				{
                    return val != el;
                });
                
                // … den »loadElementsComplete«-Event feuern, wenn alle Elemente geladen sind.
                if (!elementsToLoad.length) {

					needsRedraw = true;
                    $(Viewer).trigger('loadElementsComplete');
                }
            });
        });
    }
	
	function calcTubeNormals(elem)
	{
		tubeNormals = [];
		
		lineStart = 0;
		for (var i = 0; i < elem.indices.length; ++i) 
		{
			length = elem.indices[i];
			
			var x1,x2,y1,y2,z1,z2,nx,ny,nz;
			
			tubeNormals.push( 0 );
			tubeNormals.push( 0 );
			tubeNormals.push( 0 );
			tubeNormals.push( 0 );
			tubeNormals.push( 0 );
			tubeNormals.push( 0 );
			
			for (var j = 1; j < length-1; ++j)
			{
				x1 = elem.vertices[lineStart + 3*j-3]
				y1 = elem.vertices[lineStart + 3*j-2]
				z1 = elem.vertices[lineStart + 3*j-1]
				x2 = elem.vertices[lineStart + 3*j+3]
				y2 = elem.vertices[lineStart + 3*j+4]
				z2 = elem.vertices[lineStart + 3*j+5]
				
				nx = x1 - x2;
				ny = y1 - y2;
				nz = z1 - z2;
				
				tubeNormals.push( nx );
				tubeNormals.push( ny );
				tubeNormals.push( nz );
				tubeNormals.push( nx );
				tubeNormals.push( ny );
				tubeNormals.push( nz );
			}
			
			tubeNormals.push( nx );
			tubeNormals.push( ny );
			tubeNormals.push( nz );
			tubeNormals.push( nx );
			tubeNormals.push( ny );
			tubeNormals.push( nz );
			
			for (var k = 0; k < 6; ++k)
				tubeNormals[k] = tubeNormals[6+k];
			
			lineStart += elem.indices[i]*3;
		}
		
		elem.tubeNormals = tubeNormals;
	}
	
	function loadActivations(activationsToLoad)
	{
	    $(Viewer).trigger('loadActivationsStart');
	    
		$.each(activationsToLoad, function(i, ac) 
		{
			co = tal2pixel( ac.coord.x, ac.coord.y, ac.coord.z );
			activations[ac.id] = createSphere( co[0], co[1], co[2], ac.size, ac.color );
			activations[ac.id].name = ac.name
			activations[ac.id].type = 'activation';
			activations[ac.id].display = ac.display;
			activations[ac.id].id = ac.id;
			activations[ac.id].hasBuffer = false;
			activations[ac.id].isHighlighted = false;
			activations[ac.id].cutFS = false;
			activations[ac.id].transparency = 1.0;
			
		    $(Viewer).trigger('loadActivationComplete', {'id': ac.id});
		});
		
		$(Viewer).trigger('loadActivationsComplete');
	}
	
	
	function loadScenes()
	{
	    $(Viewer).trigger('loadScenesStart');
		$.getJSON(settings.STATIC_URL + 'data/scenes.json', function(data)
		{
			$.each(data, function(i, sc) 
			{
				scenes[sc.id] = {};
				scenes[sc.id].cameraPosition = sc.cameraPosition;
				scenes[sc.id].cameraTranslation = sc.cameraTranslation;
				scenes[sc.id].cameraZoom = sc.cameraZoom;
				scenes[sc.id].elementsAvailable = sc.elementsAvailable;
				scenes[sc.id].elementsActive = sc.elementsActive;
				scenes[sc.id].activationsAvailable = sc.activationsAvailable;
				scenes[sc.id].activationsActive = sc.activationsActive;
				scenes[sc.id].slices = sc.slices;
				scenes[sc.id].colorTextures = sc.colorTextures;
				scenes[sc.id].secondaryTexture = sc.secondaryTexture;
			});
    	    $(Viewer).trigger('loadScenesComplete');
		});
	}
	
	function texturePreload()
	{
		action = false;
		++preloadCounterAxial;
		if ( preloadCounterAxial < 80 )
		{
			getTexture('axial', 80 - preloadCounterAxial);
			getTexture('axial', 79 + preloadCounterAxial);
			getTexture('sagittal', 80 - preloadCounterAxial);
			getTexture('sagittal', 79 + preloadCounterAxial);
			action = true;
		}
	
		++preloadCounterCoronal;
		if ( preloadCounterCoronal < 100 )
		{
			getTexture('coronal', 100 - preloadCounterCoronal);
			getTexture('coronal', 99 + preloadCounterCoronal);
			action = true;
		}
		if ( !action )
		{
			console.log("all textures cached");
			clearInterval(preloadTextures);
		}
	}
	
	/****************************************************************************************************
	*
	*	functions for smooth transitions between scenes
	*
	/****************************************************************************************************/
	var nextRot;
	var quatOldRot;
	var quatNextRot;
	var step = 0;
	var rotateInterval;
	
	var screenMoveXOld;
	var screenMoveYOld;
	var zoomOld;
	
	var screenMoveXNext;
	var screenMoveYNext;
	var zoomNext;
	
	function activateScene(id)
	{
		if ( rotateInterval )
			clearInterval(rotateInterval);
	    
	    if (!(id in scenes)) {
            $(Viewer).trigger('sceneUnknown');
            return false;
        }
        
		nextScene = id;
		
		nextRot = mat4.create();
		mat4.identity(nextRot);
		mat4.rotateX(nextRot, scenes[id].cameraPosition[0]);
		mat4.rotateY(nextRot, scenes[id].cameraPosition[1]);
		mat4.rotateZ(nextRot, scenes[id].cameraPosition[2]);
		
		quatOldRot = mat4toQuat( m_thisRot);
		quatNextRot = mat4toQuat( nextRot )
		
		screenMoveXNext = scenes[id].cameraTranslation[0];
		screenMoveYNext = scenes[id].cameraTranslation[1];
		zoomNext = scenes[id].cameraZoom;
		
		zoomOld = zoom;
		screenMoveXOld = screenMoveX;
		screenMoveYOld = screenMoveY;
		
		step = 0;
		rotateInterval = setInterval(rotateToNextPosition, 30);
	}
	
	function activateView(id)
	{
		if ( rotateInterval )
			clearInterval(rotateInterval);
		
		nextRot = mat4.create();
		mat4.identity(nextRot);
		mat4.rotateX(nextRot, views[id][0]);
		mat4.rotateY(nextRot, views[id][1]);
		mat4.rotateZ(nextRot, views[id][2]);
		
		quatOldRot = mat4toQuat( m_thisRot);
		quatNextRot = mat4toQuat( nextRot )
		
		screenMoveXNext = 0;
		screenMoveYNext = 0;
		zoomNext = 1.0;
		
		zoomOld = zoom;
		screenMoveXOld = screenMoveX;
		screenMoveYOld = screenMoveY;
		
		step = 0;
		rotateInterval = setInterval(rotateToNextPosition2, 30);
	}
	
	function rotateToNextPosition()
	{
		++step;
		if ( step == 20 )
		{
			clearInterval(rotateInterval);
			activateScene1(nextScene)
		}
		
		d = Math.log(step) / Math.log(20);
		
		m_lastRot = mat4.create();
		mat4.identity(m_lastRot);
		m_thisRot = mat4.create();
		mat4.identity(m_thisRot);
		
		q = quat4.create();
		q = slerp(quatOldRot, quatNextRot, d);
		quat4.toMat4(q, m_thisRot);
		
		zoom = (1.0 - d) * zoomOld + d * zoomNext;
		screenMoveX = (1.0 - d) * screenMoveXOld + d * screenMoveXNext;
		screenMoveY = (1.0 - d) * screenMoveYOld + d * screenMoveYNext;
		
		needsRedraw = true;
	}
	
	function rotateToNextPosition2()
	{
		++step;
		if ( step == 20 )
		{
			clearInterval(rotateInterval);
		}
		
		d = Math.log(step) / Math.log(20);
		
		m_lastRot = mat4.create();
		mat4.identity(m_lastRot);
		m_thisRot = mat4.create();
		mat4.identity(m_thisRot);
		
		q = quat4.create();
		q = slerp(quatOldRot, quatNextRot, d);
		quat4.toMat4(q, m_thisRot);
		
		zoom = (1.0 - d) * zoomOld + d * zoomNext;
		screenMoveX = (1.0 - d) * screenMoveXOld + d * screenMoveXNext;
		screenMoveY = (1.0 - d) * screenMoveYOld + d * screenMoveYNext;
		
		needsRedraw = true;
	}
	
	function activateScene1(id)
	{
        $(Viewer).trigger('activateSceneStart', {'id': id, 'scene': scenes[id]});
        
		$.each(elements, function(id, element) 
		{
		    hideElement(id);
		});
		
		$.each(activations, function(id, activation) 
		{
		    hideActivation(id);
		});
		
		axial = scenes[id].slices[0];
		coronal = scenes[id].slices[1];
		sagittal = scenes[id].slices[2];
	
		colorTextures = scenes[id].colorTextures;
		secondaryTexture = scenes[id].secondaryTexture;
		
		$.each(scenes[id].elementsActive, function(index, value) 
		{ 
            showElement(value);
		});
		
		$.each(scenes[id].activationsActive, function(index, value) 
		{ 
			showActivation(value);
		});
		
		$(Viewer).trigger('activateSceneComplete', {'id': id, 'scene': scenes[id]});
		needsRedraw = true;
	}
	
	/****************************************************************************************************
	*
	*	shader management
	*
	/****************************************************************************************************/
	function loadShaders()
	{
		getShader('mesh', 'vs');
		getShader('mesh', 'fs');
		getShader('fibre', 'vs');
		getShader('fibre', 'fs');
		getShader('slice', 'vs');
		getShader('slice', 'fs');
		initShader('mesh')
		initShader('fibre')
		initShader('slice')
	}

	function getShader(name, type)
	{
		var shader;
		$.ajax({
			url: settings.STATIC_URL + 'shaders/'+name+'.'+type, 
			async: false,
			success: function(data) 
			{
			
				if ( type == 'fs')
				{
					shader = gl.createShader(gl.FRAGMENT_SHADER);
				}
				else
				{
					shader = gl.createShader(gl.VERTEX_SHADER);
				}
				gl.shaderSource(shader, data);
				gl.compileShader(shader);

				if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
				{
					alert(gl.getShaderInfoLog(shader));
					return null;
				}
				shaders[name + '_' + type] = shader;
			}
		});
	}
	
    function initShader(name) 
	{
		shaderPrograms[name] = gl.createProgram();
        gl.attachShader(shaderPrograms[name], shaders[name + '_vs']);
        gl.attachShader(shaderPrograms[name], shaders[name + '_fs']);
        gl.linkProgram(shaderPrograms[name]);

        if (!gl.getProgramParameter(shaderPrograms[name], gl.LINK_STATUS)) 
		{
            alert("Could not initialise shaders\n" + gl.LINK_STATUS);
        }

        gl.useProgram(shaderPrograms[name]);

        shaderPrograms[name].vertexPositionAttribute = gl.getAttribLocation(shaderPrograms[name], "aVertexPosition");
        gl.enableVertexAttribArray(shaderPrograms[name].vertexPositionAttribute);

       if ( name == "mesh" || name == "fibre" )
		{
		    shaderPrograms[name].vertexNormalAttribute = gl.getAttribLocation(shaderPrograms[name], "aVertexNormal");
			gl.enableVertexAttribArray(shaderPrograms[name].vertexNormalAttribute);
		}

		if ( name == "fibre" || name == "slice" )
		{
			shaderPrograms[name].textureCoordAttribute = gl.getAttribLocation(shaderPrograms[name], "aTextureCoord");
			gl.enableVertexAttribArray(shaderPrograms[name].textureCoordAttribute);
		}
		
		if ( name == "mesh" )
		{
			shaderPrograms[name].vertexColorAttribute = gl.getAttribLocation(shaderPrograms[name], "aVertexColor");
			gl.enableVertexAttribArray(shaderPrograms[name].vertexColorAttribute);
		}

        shaderPrograms[name].pMatrixUniform 					= gl.getUniformLocation(shaderPrograms[name], "uPMatrix");
        shaderPrograms[name].mvMatrixUniform 					= gl.getUniformLocation(shaderPrograms[name], "uMVMatrix");
        shaderPrograms[name].nMatrixUniform 					= gl.getUniformLocation(shaderPrograms[name], "uNMatrix");
        shaderPrograms[name].samplerUniform 					= gl.getUniformLocation(shaderPrograms[name], "uSampler");
		shaderPrograms[name].samplerUniform1 					= gl.getUniformLocation(shaderPrograms[name], "uSampler1");
        shaderPrograms[name].ambientColorUniform 				= gl.getUniformLocation(shaderPrograms[name], "uAmbientColor");
        shaderPrograms[name].pointLightingLocationUniform 		= gl.getUniformLocation(shaderPrograms[name], "uPointLightingLocation");
        shaderPrograms[name].pointLightingDiffuseColorUniform  	= gl.getUniformLocation(shaderPrograms[name], "uPointLightingDiffuseColor");
		shaderPrograms[name].isT1Uniform  						= gl.getUniformLocation(shaderPrograms[name], "isT1");
		shaderPrograms[name].useLightUniform  					= gl.getUniformLocation(shaderPrograms[name], "useLight");
		shaderPrograms[name].alphaUniform  						= gl.getUniformLocation(shaderPrograms[name], "uAlpha");
		shaderPrograms[name].sliceLocationUniform 				= gl.getUniformLocation(shaderPrograms[name], "uSliceLocation");
		shaderPrograms[name].sectorUniform 						= gl.getUniformLocation(shaderPrograms[name], "uSector");
		shaderPrograms[name].cutFSUniform 						= gl.getUniformLocation(shaderPrograms[name], "uCutFS");
		shaderPrograms[name].isHighlightedUniform 				= gl.getUniformLocation(shaderPrograms[name], "uIsHighlighted");
		shaderPrograms[name].somethingHighlightedUniform		= gl.getUniformLocation(shaderPrograms[name], "uSomethingHighlighted");
		shaderPrograms[name].zoomUniform						= gl.getUniformLocation(shaderPrograms[name], "uZoom");
		shaderPrograms[name].fibreColorUniform					= gl.getUniformLocation(shaderPrograms[name], "uFibreColor");
		shaderPrograms[name].fibreColorModeUniform				= gl.getUniformLocation(shaderPrograms[name], "uFibreColorMode");
		shaderPrograms[name].pickingUniform						= gl.getUniformLocation(shaderPrograms[name], "uPicking");
		shaderPrograms[name].pickColorUniform					= gl.getUniformLocation(shaderPrograms[name], "uPickColor");
    }
	
	function setMeshUniforms()
	{
		gl.useProgram(shaderPrograms['mesh']);
		
		gl.uniformMatrix4fv(shaderPrograms['mesh'].pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderPrograms['mesh'].mvMatrixUniform, false, mvMatrix);
        gl.uniformMatrix3fv(shaderPrograms['mesh'].nMatrixUniform, false, normalMatrix);
		
		gl.uniform3f( shaderPrograms['mesh'].sliceLocationUniform, sagittal, coronal, axial);
		
        gl.uniform3f( shaderPrograms['mesh'].ambientColorUniform, 0.4, 0.4, 0.4 );
		gl.uniform1i( shaderPrograms['mesh'].sectorUniform, getOctant(m_thisRot));
		gl.uniform1i( shaderPrograms['mesh'].useLightUniform, true );
		gl.uniform1f( shaderPrograms['mesh'].alphaUniform, 1.0);
    	gl.uniform3f( shaderPrograms['mesh'].pointLightingLocationUniform, lightPos[0], lightPos[1], lightPos[2] );
        gl.uniform3f( shaderPrograms['mesh'].pointLightingDiffuseColorUniform, 0.6, 0.6, 0.6 );
		gl.uniform1i( shaderPrograms['mesh'].somethingHighlightedUniform, somethingHighlighted );
		
		gl.uniform3f( shaderPrograms['mesh'].pickColorUniform, 0.6, 0.6, 0.6 );
		gl.uniform1i( shaderPrograms['mesh'].pickingUniform, false );
	}
	
	function setFiberUniforms()
	{
		gl.useProgram(shaderPrograms['fibre']);
		gl.uniformMatrix4fv(shaderPrograms['fibre'].pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderPrograms['fibre'].mvMatrixUniform, false, mvMatrix);
        gl.uniformMatrix3fv(shaderPrograms['fibre'].nMatrixUniform, false, normalMatrix);
		
        gl.uniform3f( shaderPrograms['fibre'].ambientColorUniform, 0.4, 0.4, 0.4 );
    	gl.uniform3f( shaderPrograms['fibre'].pointLightingLocationUniform, lightPos[0], lightPos[1], lightPos[2] );
        gl.uniform3f( shaderPrograms['fibre'].pointLightingDiffuseColorUniform, 0.6, 0.6, 0.6 );
		gl.uniform1i( shaderPrograms['fibre'].somethingHighlightedUniform, somethingHighlighted );
		gl.uniform1f( shaderPrograms['fibre'].zoomUniform, zoom );
		
		gl.uniform1i( shaderPrograms['fibre'].fibreColorModeUniform, localFibreColor );
	}
    
	/****************************************************************************************************
	*
	* texture management
	*
	/****************************************************************************************************/
	
	function getTexture(orient, pos)
	{
		if ( colorTextures )
		{
			if ( textures["fa_rgb"][orient+pos] )
			{
				return textures["fa_rgb"][orient+pos];
			}
			else
			{
				textures["fa_rgb"][orient+pos] = gl.createTexture();
				textures["fa_rgb"][orient+pos].image = new Image();
				textures["fa_rgb"][orient+pos].image.onload = function () 
				{
					handleLoadedTexture(textures["fa_rgb"][orient+pos])
				}
				textures["fa_rgb"][orient+pos].image.src = settings.STATIC_URL + "textures/fa_rgb/" + orient + "_" + pos + ".png";
			}
		}
		else
		{
			if ( textures["t1"][orient+pos] )
			{
				return textures["t1"][orient+pos];
			}
			else
			{
				textures["t1"][orient+pos] = gl.createTexture();
				textures["t1"][orient+pos].image = new Image();
				textures["t1"][orient+pos].image.onload = function () 
				{
					handleLoadedTexture(textures["t1"][orient+pos])
				}
				textures["t1"][orient+pos].image.src = settings.STATIC_URL + "textures/t1/" + orient + "_" + pos + ".png";
			}
		}
	}
	
	function getSecondaryTexture(orient, pos)
	{
		if ( textures[secondaryTexture][orient+pos] )
		{
			return textures[secondaryTexture][orient+pos];
		}
		else
		{
			textures[secondaryTexture][orient+pos] = gl.createTexture();
			textures[secondaryTexture][orient+pos].image = new Image();
			textures[secondaryTexture][orient+pos].image.onload = function () 
			{
				handleLoadedTexture(textures[secondaryTexture][orient+pos])
			}
			textures[secondaryTexture][orient+pos].image.src = settings.STATIC_URL + "textures/" + secondaryTexture + "/" + orient + "_" + pos + ".png";
			
		}
	}

	function handleLoadedTexture(texture) 
	{
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);
		needsRedraw = true;
    }
	
	/****************************************************************************************************
	*
	* main functions that actually draw the entire scene
	*
	/****************************************************************************************************/

	function drawScene() 
	{
		if ( !needsRedraw )
		{
			return;
		}
		needsRedraw = false;
		
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		mat4.ortho(-100 + screenMoveX, 100 + screenMoveX, -100 - screenMoveY, 100 - screenMoveY, -500, 500, pMatrix);
        
        mat4.identity(mvMatrix);
		zv = vec3.create();
		zv[0] = zoom;
		zv[1] = zoom;
		zv[2] = zoom;
		mat4.scale(mvMatrix, zv);
		
		lightPos[0] = 0.0;
		lightPos[1] = 0.0;
		lightPos[2] = -1.0;
		
		mat4.translate(mvMatrix, [-80, -100, -80]);
		
		mat4.inverse(m_thisRot);
		mat4.multiply(m_thisRot, mvMatrix, mvMatrix);
		mat4.inverse(m_thisRot);
		
		mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
		
		mat4.multiplyVec3(m_thisRot, lightPos);
				
		gl.disable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST);

		if (!elements['head'] || !elements['head'].display )
		{
			drawSlices();
		}

		setFiberUniforms();
		$.each(elements, function() 
		{
			if ( this.display )
			{
				if ( this.type == 'fibre' )
				{
					gl.uniform1f( shaderPrograms['fibre'].isHighlightedUniform, this.isHighlighted );
					drawFibers(this);
				}
			}
		});
		
		setMeshUniforms();
		$.each(activations, function() 
		{
			if ( this.display )
			{
				gl.uniform1i( shaderPrograms['mesh'].isHighlightedUniform, this.isHighlighted );
				drawMesh(this);
			}
		});

		$.each(elements, function() 
		{
			if ( this.display )
			{
				if ( this.type == 'mesh' )
				{
					gl.uniform1f( shaderPrograms['mesh'].isHighlightedUniform, this.isHighlighted );
					drawMesh(this);
				}
			}
		});

    }
	
	function drawMesh(elem)
	{
		if (!elem || !elem.display) return;
		// bind buffers for rendering
		bindBuffers(elem);
		gl.bindBuffer(gl.ARRAY_BUFFER, elem.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, elem.vertexPositionBuffer.data, gl.STATIC_DRAW);
		gl.vertexAttribPointer(shaderPrograms['mesh'].vertexPositionAttribute, elem.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, elem.vertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, elem.vertexNormalBuffer.data, gl.STATIC_DRAW);
		gl.vertexAttribPointer(shaderPrograms['mesh'].vertexNormalAttribute, elem.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, elem.vertexColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, elem.vertexColorBuffer.data, gl.STATIC_DRAW);
		gl.vertexAttribPointer(shaderPrograms['mesh'].vertexColorAttribute, elem.vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elem.vertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elem.vertexIndexBuffer.data, gl.STATIC_DRAW);

		gl.uniform1i(shaderPrograms['mesh'].cutFSUniform, elem.cutFS);
		
		gl.disable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST);
		
		if (elem.transparency < 1.0)
		{
			gl.uniform1f( shaderPrograms['mesh'].useLightUniform, false );
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.enable(gl.BLEND);
			gl.uniform1f(shaderPrograms['mesh'].alphaUniform, elem.transparency);
		}
		
		gl.drawElements(gl.TRIANGLES, elem.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
	
	function drawFibers(elem)
	{
		bindBuffers(elem);
		gl.bindBuffer(gl.ARRAY_BUFFER, elem.vertexPositionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, elem.vertexPositionBuffer.data, gl.STATIC_DRAW);
		gl.vertexAttribPointer(shaderPrograms['fibre'].vertexPositionAttribute, elem.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, elem.vertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, elem.vertexNormalBuffer.data, gl.STATIC_DRAW);
		gl.vertexAttribPointer(shaderPrograms['fibre'].vertexNormalAttribute, elem.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, elem.vertexTexCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, elem.vertexTexCoordBuffer.data, gl.STATIC_DRAW);
		gl.vertexAttribPointer(shaderPrograms['fibre'].textureCoordAttribute, elem.vertexTexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elem.vertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elem.vertexIndexBuffer.data, gl.STATIC_DRAW);
		
		//gl.bindBuffer(gl.ARRAY_BUFFER, elem.vertexColorBuffer);
		//gl.bufferData(gl.ARRAY_BUFFER, elem.vertexColorBuffer.data, gl.STATIC_DRAW);
		//gl.vertexAttribPointer(shaderPrograms['fibre'].vertexColorAttribute, elem.vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.uniform3f(shaderPrograms['fibre'].fibreColorUniform, elem.color.r, elem.color.g, elem.color.b );
		
		lineStart = 0;
		for (var i = 0; i < elem.indices.length; ++i) 
		{
			gl.drawArrays(gl.TRIANGLE_STRIP, lineStart, elem.indices[i]*2);
			lineStart += elem.indices[i]*2;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
	
	function bindBuffers(elem)
	{
		if (!elem.hasBuffer)
		{
			if ( elem.type == 'fibre' )
			{
				vertexPositionBuffer  = gl.createBuffer();
				vertexPositionBuffer.data = new Float32Array(elem.tubeVertices);
				vertexPositionBuffer.itemSize = 3;
				vertexPositionBuffer.numItems = elem.tubeVertices.length / 3;
			
				vertexNormalBuffer = gl.createBuffer();
				vertexNormalBuffer.data = new Float32Array(elem.tubeNormals);
				vertexNormalBuffer.itemSize = 3;
				vertexNormalBuffer.numItems = elem.tubeNormals.length / 3;
				/*
				vertexColorBuffer = gl.createBuffer();
				vertexColorBuffer.data = new Float32Array(elem.colors);
				vertexColorBuffer.itemSize = 4;
				vertexColorBuffer.numItems = elem.tubeNormals.length / 4;
				*/			
				vertexIndexBuffer = gl.createBuffer();
				vertexIndexBuffer.data = new Uint16Array(elem.indices)
				vertexIndexBuffer.itemSize = 1;
				vertexIndexBuffer.numItems = elem.indices.length;

				vertexTexCoordBuffer  = gl.createBuffer();
				vertexTexCoordBuffer.data = new Float32Array(elem.tubeTexCoords);
				vertexTexCoordBuffer.itemSize = 2;
				vertexTexCoordBuffer.numItems = elem.tubeTexCoords.length / 2;

				elem.vertexNormalBuffer = vertexNormalBuffer;
				elem.vertexPositionBuffer = vertexPositionBuffer;
				//elem.vertexColorBuffer = vertexColorBuffer;
				elem.vertexIndexBuffer = vertexIndexBuffer;
				elem.vertexTexCoordBuffer = vertexTexCoordBuffer;
				
				elem.hasBuffer = true;
			}
			else
			{
				vertexPositionBuffer  = gl.createBuffer();
				vertexPositionBuffer.data = new Float32Array(elem.vertices);
				vertexPositionBuffer.itemSize = 3;
				vertexPositionBuffer.numItems = elem.vertices.length / 3;
			
				vertexNormalBuffer = gl.createBuffer();
				vertexNormalBuffer.data = new Float32Array(elem.normals);
				vertexNormalBuffer.itemSize = 3;
				vertexNormalBuffer.numItems = elem.normals.length / 3;

				vertexColorBuffer = gl.createBuffer();
				vertexColorBuffer.data = new Float32Array(elem.colors);
				vertexColorBuffer.itemSize = 4;
				vertexColorBuffer.numItems = elem.colors.length / 4;
				
				vertexIndexBuffer = gl.createBuffer();
				vertexIndexBuffer.data = new Uint16Array(elem.indices)
				vertexIndexBuffer.itemSize = 1;
				vertexIndexBuffer.numItems = elem.indices.length;

				elem.vertexNormalBuffer = vertexNormalBuffer;
				elem.vertexPositionBuffer = vertexPositionBuffer;
				elem.vertexColorBuffer = vertexColorBuffer;
				elem.vertexIndexBuffer = vertexIndexBuffer;
				elem.hasBuffer = true;
			}
		}
	}

	function drawSlices()
	{
		gl.useProgram(shaderPrograms['slice']);
		
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		
		// initialize the secondary texture with an empty one
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, getTexture('axial', 0));
		gl.uniform1i(shaderPrograms['slice'].samplerUniform1, 1);
		
		
		axialPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, axialPosBuffer);
        vertices = [
            0,  0,    axial,
            160, 0,   axial,
            160, 200, axial,
            0,  200,  axial,
         ];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        axialPosBuffer.itemSize = 3;
        axialPosBuffer.numItems = 4;
		gl.vertexAttribPointer(shaderPrograms['slice'].vertexPositionAttribute, axialPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		axialTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, axialTextureCoordBuffer);
        textureCoords = [ 0.1875, 0.1, 0.8125, 0.1, 0.8125, 0.89, 0.1875, 0.89 ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        axialTextureCoordBuffer.itemSize = 2;
        axialTextureCoordBuffer.numItems = 4;
		gl.vertexAttribPointer(shaderPrograms['slice'].textureCoordAttribute, axialTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
 
		axialVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, axialVertexIndexBuffer);
        vertexIndices = [ 0, 1, 2,      0, 2, 3 ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
        axialVertexIndexBuffer.itemSize = 1;
        axialVertexIndexBuffer.numItems = 6;
 
		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, getTexture('axial', axial));
        gl.uniform1i(shaderPrograms['slice'].samplerUniform, 0);
		
		if ( secondaryTexture != "none" )
		{
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, getSecondaryTexture('axial', axial));
			gl.uniform1i(shaderPrograms['slice'].samplerUniform1, 1);
		}
 
		gl.uniformMatrix4fv(shaderPrograms['slice'].pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(shaderPrograms['slice'].mvMatrixUniform, false, mvMatrix);
        gl.uniformMatrix3fv(shaderPrograms['slice'].nMatrixUniform, false, normalMatrix);
		
		gl.uniform1i(shaderPrograms['slice'].isT1Uniform, !colorTextures);
		gl.drawElements(gl.TRIANGLES, axialVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		
		coronalPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, coronalPosBuffer);
        vertices = [
            0,   coronal, 0,
            160, coronal, 0,
            160, coronal, 160,
            0,   coronal, 160,
         ];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        coronalPosBuffer.itemSize = 3;
        coronalPosBuffer.numItems = 4;
		gl.vertexAttribPointer(shaderPrograms['slice'].vertexPositionAttribute, coronalPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		coronalTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, coronalTextureCoordBuffer);
        textureCoords = [ 0.1875, 0.1875, 0.8125, 0.1875, 0.8125, 0.8125, 0.1875, 0.8125 ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        coronalTextureCoordBuffer.itemSize = 2;
        coronalTextureCoordBuffer.numItems = 4;
		gl.vertexAttribPointer(shaderPrograms['slice'].textureCoordAttribute, coronalTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
 
		coronalVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coronalVertexIndexBuffer);
        vertexIndices = [ 0, 1, 2,      0, 2, 3 ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
        coronalVertexIndexBuffer.itemSize = 1;
        coronalVertexIndexBuffer.numItems = 6;
 
		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, getTexture('coronal',coronal));
        gl.uniform1i(shaderPrograms['slice'].samplerUniform, 0);
		
		if ( secondaryTexture != "none" )
		{
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, getSecondaryTexture('coronal',coronal));
			gl.uniform1i(shaderPrograms['slice'].samplerUniform1, 1);
		}
		
        gl.drawElements(gl.TRIANGLES, coronalVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		
		
		sagittalPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sagittalPosBuffer);
        vertices = [
            sagittal, 0, 0,
            sagittal, 0, 160,
            sagittal, 200, 160,
            sagittal, 200, 0,
         ];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        sagittalPosBuffer.itemSize = 3;
        sagittalPosBuffer.numItems = 4;
		gl.vertexAttribPointer(shaderPrograms['slice'].vertexPositionAttribute, sagittalPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		sagittalTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sagittalTextureCoordBuffer);
        textureCoords = [ 0.1, 0.1875, 0.1, 0.8125, 0.89, 0.8125, 0.89, 0.1875 ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        sagittalTextureCoordBuffer.itemSize = 2;
        sagittalTextureCoordBuffer.numItems = 4;
		gl.vertexAttribPointer(shaderPrograms['slice'].textureCoordAttribute, sagittalTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
 
		sagittalVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sagittalVertexIndexBuffer);
        vertexIndices = [ 0, 1, 2,      0, 2, 3 ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), gl.STATIC_DRAW);
        sagittalVertexIndexBuffer.itemSize = 1;
        sagittalVertexIndexBuffer.numItems = 6;
 
		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, getTexture('sagittal',sagittal));
        gl.uniform1i(shaderPrograms['slice'].samplerUniform, 0);
		
		if ( secondaryTexture != "none" )
		{
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, getSecondaryTexture('sagittal',sagittal));
			gl.uniform1i(shaderPrograms['slice'].samplerUniform1, 1);
		}
		
		gl.drawElements(gl.TRIANGLES, sagittalVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		
		gl.disable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
	
	
	
	/****************************************************************************************************
	*
	* everything mouse related
	*
	/****************************************************************************************************/
	
	function fixupMouse( event ) 
	{
		event = event || window.event;

		var e = { event: event,
			target: event.target ? event.target : event.srcElement,
			which: 	event.which ? event.which :
					event.button === 1 ? 1 :
					event.button === 2 ? 3 : 
					event.button === 4 ? 2 : 1,
			x: event[0] ? event[0] : event.clientX,
			y: event[1] ? event[1] : event.clientY
		};
		return e;
	}
	
	
	function handleMouseDown(event) 
	{
		e = fixupMouse( event );
		
		if (e.which == 1)
		{
			leftMouseDown = true;
			mat4.set(m_thisRot, m_lastRot);
			if ( event.offsetX )
			{
				// chrome case, should work
				Arcball.click(event.offsetX,event.offsetY);
			}
			else
			{
				Arcball.click(e.x - vd.offsetLeft, e.y - vd.offsetTop);
			}
		}
		else if (e.which == 2)
		{
			middleMouseDown = true;
			screenMoveXold = screenMoveX;
			screenMoveYold = screenMoveY;
			if ( event.offsetX )
			{
				// chrome case, should work
				middleMouseClickX = event.offsetX;
				middleMouseClickY = event.offsetY;
			}
			else
			{
				middleMouseClickX = e.x - vd.offsetLeft;
				middleMouseClickY = e.y - vd.offsetTop;
			}
		}
		event.preventDefault();
		needsRedraw = true;
    }

    function handleMouseUp(event) 
	{
		e = fixupMouse( event );
		if (e.which == 1)
		{
			leftMouseDown = false;
		}
		else if (e.which == 2)
		{
			middleMouseDown = false;
		}
		event.preventDefault();
		needsRedraw = true;
    }


    function handleMouseMove(event) 
	{
		if (!leftMouseDown && !middleMouseDown ) 
		{
			return;
        }
		e = fixupMouse( event );
		if (leftMouseDown)
		{
			if ( event.offsetX )
			{
				// chrome case, should work
				Arcball.drag(event.offsetX,event.offsetY);
			}
			else
			{
				Arcball.drag(e.x - vd.offsetLeft, e.y - vd.offsetTop);
			}
			mat4.set(Arcball.get(), m_thisRot);
			mat4.multiply(m_lastRot, m_thisRot, m_thisRot);
		}
		else if (middleMouseDown)
		{
			if ( event.offsetX )
			{
				// chrome case, should work
				screenMoveX = middleMouseClickX - event.offsetX + screenMoveXold;
				screenMoveY = middleMouseClickY - event.offsetY + screenMoveYold;
			}
			else
			{
				screenMoveX = middleMouseClickX - (e.x - vd.offsetLeft) + screenMoveXold;
				screenMoveY = middleMouseClickY - (e.y - vd.offsetTop ) + screenMoveYold;
			}
		}
		event.preventDefault();
		needsRedraw = true;
    }
    
	function handleMouseWheel(e)
	{
		e = e ? e : window.event;
		wheelData = e.detail ? e.detail * -1 : e.wheelDelta / 40;
		if ( middleMouseDown )
		{
			e.preventDefault();
			return;
		}
		if (wheelData < 0)
		{
			zoom -= 1;
		}
		else
		{
			zoom += 0.5;
		}
		if (zoom < 1)
		{
			zoom = 1;
		}
		e.preventDefault();
		needsRedraw = true;
	}
	
	/****************************************************************************************************
	*
	* public functions, getters and setters
	*
	/****************************************************************************************************/
	function toggleElement(id) 
	{
	    console.log('toggle ' + id ); 
        if (!(id in elements)) {
            console.warn('Element "' + id + '" is unknown.');
            return false;
        }
        if ( elements[id].type == "control" )
        {
        	if ( id == "control_tex" )
        	{
	        	colorTextures = !colorTextures;
        	}
        	if ( id == "control_fibreColor" )
        	{
	        	localFibreColor = !localFibreColor;
        	}
        }
        else
        {
			elements[id].display = !elements[id].display;
	        $(Viewer).trigger('elementDisplayChange', {'id': id, 'active': elements[id].display});
		}
        needsRedraw = true;
    }
    
	function showElement(id) 
	{
	    console.log('show ' + id ); 
        if (!(id in elements)) {
            console.warn('Element "' + id + '" is unknown.');
            return false;
        }
        elements[id].display = true;
        $(Viewer).trigger('elementDisplayChange', {'id': id, 'active': true});
		needsRedraw = true;
    }
	
	function hideElement(id) 
	{
        if (!(id in elements)) {
            console.warn('Element "' + id + '" is unknown.');
            return false;
        }
		elements[id].display = false;
        $(Viewer).trigger('elementDisplayChange', {'id': id, 'active': false});
		needsRedraw = true;
    }
    
    function toggleActivation(id) 
    {
        if (!(id in activations)) {
            console.warn('Activation "' + id + '" is unknown.');
            return false;
        }
        activations[id].display = !activations[id].display;
        $(Viewer).trigger('activationDisplayChange', {'id': id, 'active': activations[id].display});
		needsRedraw = true;
    }
    
    function showActivation(id) 
    {
        if (!(id in activations)) {
            console.warn('Activation "' + id + '" is unknown.');
            return false;
        }
        activations[id].display = true;
        $(Viewer).trigger('activationDisplayChange', {'id': id, 'active': true});
		needsRedraw = true;
    }
    
    function hideActivation(id) 
    {
        if (!(id in activations)) {
            console.warn('Activation "' + id + '" is unknown.');
            return false;
        }
        activations[id].display = false;
        $(Viewer).trigger('activationDisplayChange', {'id': id, 'active': false});
		needsRedraw = true;
    }
	
    function setBackgroundColor(color) 
	{
        // Nur beispielhaft implementiert …
        $container.css('background-color', color);
    }
	
	function highlight(id) 
	{
		$.each(elements, function() 
		{
			this.isHighlighted = false;
		});

		$.each(activations, function() 
		{
			this.isHighlighted = false;
		});
		if ( elements[id] )
			elements[id].isHighlighted = true;
		if ( activations[id] )
		{
			activations[id].isHighlighted = true;
		}
		somethingHighlighted = true;
		needsRedraw = true;
	}
	
	function unHighlight() 
	{
		$.each(elements, function() 
		{
			this.isHighlighted = false;
		});

		$.each(activations, function() 
		{
			this.isHighlighted = false;
		});
		somethingHighlighted = false;
		needsRedraw = true;
	}
		
    function setAxial(position)
	{
		if ( position < 0 )
			position = 0;
		if ( position > 159 )
			position = 159;
		axial = position;
		needsRedraw = true;
	}
	
	function setCoronal(position)
	{
		if ( position < 0 )
			position = 0;
		if ( position > 199 )
			position = 199;
		coronal = position;
		needsRedraw = true;
	}
	
	function setSagittal(position)
	{
		if ( position < 0 )
			position = 0;
		if ( position > 159 )
			position = 159;
		sagittal = position;
		needsRedraw = true;
	}
	
	function getAxial()
	{
		return axial;
	}
	
	function getCoronal()
	{
		return coronal;
	}
	
	function getSagittal()
	{
		return sagittal;
	}
	
	function setColorTextures(val)
	{
		colorTextures = val;
		needsRedraw = true;
	}
	
	function setSecondaryTexture(val)
	{
		secondaryTex = val;
	}

	function updateSize()
	{
		gl.viewportWidth = $canvas.width();
        gl.viewportHeight = $canvas.height();
		Arcball.set_win_size(gl.viewportWidth, gl.viewportHeight);
		needsRedraw = true;
	}
	
	function bind(event, callback) {
        $(Viewer).bind(event, callback);
    }

	// Im »Viewer«-Singleton werden nur die im folgenden aufgeführten Methoden/Eigenschaften nach
    // außen »sichtbar« gemacht.
    return {
        'init': init,
        'bind': bind,
        'toggleElement': toggleElement,
		'showElement': showElement,
		'hideElement': hideElement,
		'toggleActivation': toggleActivation,
		'activateScene': activateScene,
		'activateView': activateView,
		'setAxial': setAxial,
		'setCoronal': setCoronal,
		'setSagittal': setSagittal,
		'getAxial': getAxial,
		'getCoronal': getCoronal,
		'getSagittal': getSagittal,
		'highlight': highlight,
		'unHighlight' : unHighlight,
		'setColorTextures': setColorTextures,
		'setSecondaryTexture': setSecondaryTexture,
		'updateSize': updateSize
    };
})();
