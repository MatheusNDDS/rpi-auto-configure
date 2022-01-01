// GriffpatchBox2D.js
// Griffpatch, janeiro de 2016
// Extensão para habilitar a integração do Box2D no Scratch

(função (ext) {

	var box2dscript = box2dscript;
	if (! box2dscript) {
		box2dscript = document.createElement ("script");
		box2dscript.type = "text / javascript";
		box2dscript.src = "http://griffpatch.github.io/Box2D.js-Scratch2-Extension/Box2d.min.js";
		//box2dscript.src=document.extURLs.box2d;
		document.body.appendChild (box2dscript);
	}

	ext.available = function () {
		return !! Box2D;
	}
	
    ext._stop = função () {};
    ext._shutdown = function () {};

	var b2Vec2, b2AABB, b2BodyDef, b2Body, b2FixtureDef, b2Fixture, b2World, b2MassData, b2PolygonShape, b2CircleShape, b2DebugDraw, b2MouseJointDef;
	var mundo, fixDef, zoom;

	var fixDef;
	var bodyDef;

	var uid_seq = 0;
	var ujid_seq = 0;

	var corpos = {};
	var joints = {};

	var categoriaSeq = 1;
	var categorias = {'padrão': 1}
	
	var bodyCategoryBits = 1;
	var bodyMaskBits = 1;
	var noCollideSeq = 0;
	
	const toRad = Math.PI / 180;

    ext._getStatus = function () {
		if (Box2D) {
			retornar {status: 2, msg: 'Pronto'};
		} senão {
			return {status: 1, msg: 'Failed to load Box2D'};
		}
    };
	
	ext.init = função (escala, gravidade, cena) {
		b2Vec2 = Box2D.Common.Math.b2Vec2;
		b2AABB = Box2D.Collision.b2AABB;
		b2BodyDef = Box2D.Dynamics.b2BodyDef;
		b2Body = Box2D.Dynamics.b2Body;
		b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
		b2Fixture = Box2D.Dynamics.b2Fixture;
		b2World = Box2D.Dynamics.b2World;
		b2MassData = Box2D.Collision.Shapes.b2MassData;
		b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
		b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
		b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
		b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;

		world = new b2World (
			novo b2Vec2 (0, gravidade) // gravidade (10)
		 , verdadeiro // permite dormir
		);
	
		zoom = escala;
	
		fixDef = new b2FixtureDef;
		fixDef.density = 1.0; // 1.0
		fixDef.friction = 0,5; // 0,5
		fixDef.restitution = 0,2; // 0,2

		bodyDef = novo b2BodyDef;

		if (cena == 'palco') {

			// criar terreno
			bodyDef.type = b2Body.b2_staticBody;
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsBox (250 / zoom, 10 / zoom);
			bodyDef.position.Set (0, -190 / zoom);
			world.CreateBody (bodyDef) .CreateFixture (fixDef);
			bodyDef.position.Set (0,1000 / zoom);
			world.CreateBody (bodyDef) .CreateFixture (fixDef);
			fixDef.shape.SetAsBox (10 / zoom, 800 / zoom);
			bodyDef.position.Set (-250 / zoom, 540 / zoom);
			world.CreateBody (bodyDef) .CreateFixture (fixDef);
			bodyDef.position.Set (250 / zoom, 540 / zoom);
			world.CreateBody (bodyDef) .CreateFixture (fixDef);
		}
		
		corpos = {};
		juntas = {};
		uid_seq = 0;
		ujid_seq = 0;
		
		categoriaSeq = 1;
		categorias = {'padrão': 1}
		bodyCategoryBits = 1;
		noCollideSeq = 0;

		bodyDef.type = b2Body.b2_dynamicBody;
	};

	ext.setBodyAttrs = function (stat, dens, fric, rest) {
		bodyDef.type = stat === 'estático'? b2Body.b2_staticBody: b2Body.b2_dynamicBody;
		fixDef.density = dens; // 1.0
		fixDef.friction = fric; // 0,5
		fixDef.restitution = rest; // 0,2
	};
	
	ext.setBodyAttr = function (attr, bodyIDs, val) {
		var bds = bodyIDs.split ('');
		para (var i = 0; i <bds.length; i ++) {
			var id = bds [i];
			if (id.length> 0) {
				var body = corpos [id];
				if (body) {
					switch (attr) {
						case 'amortecimento': body.SetLinearDamping (val); pausa;
						case 'amortecimento rotacional': body.GetAngularDamping (val); pausa;
					}
				}
			}
		}
	};
	
	ext.defineCategory = function (categoryIDs) {
		var cids = categoryIDs.split ('');
		bodyCategoryBits = 0;
		para (var i = 0; i <cids.length; i ++) {
			var cid = cids [i];
			if (cid.length> 0) {
				var cat = categorias [cid];
				if (! cat) {
					cat = categorias [cid] = categoriaSeq = categoriaSeq * 2;
				}
				bodyCategoryBits | = gato;
			}
		}
	};
	
	ext.defineMask = function (categoryIDs) {
		var cids = categoryIDs.split ('');
		bodyMaskBits = 0;
		para (var i = 0; i <cids.length; i ++) {
			var cid = cids [i];
			if (cid.length> 0) {
				var cat = categorias [cid];
				if (! cat) {
					cat = categorias [cid] = categoriaSeq = categoriaSeq * 2;
				}
				bodyMaskBits | = gato;
			}
		}
	};
	
	ext.definePoly = função (pontos) {
		fixDef.shape = new b2PolygonShape;
		
		var pts = points.split ('');
		para (var i = 0; i <pts.length; i ++) {
			if (pts [i] .length == 0) {         
				pts.splice (i, 1);
				eu--;
			}
		}

		// console.log (pts);
		
		var vertices = [];
		
		para (var i = pts.length; i> 0; i- = 2) {
			vertices.push (novo b2Vec2 (parseFloat (pts [i-2]) / zoom, parseFloat (pts [i-1]) / zoom));
		}
		
		// console.log (vértices);
		
		fixDef.shape.SetAsArray (vértices);
	};

	ext.defineRect = function (w, h) {
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox (w / 2 / zoom, h / 2 / zoom);
	};

	ext.defineCircle = function (d) {
		fixDef.shape = new b2CircleShape;
		fixDef.shape.SetRadius (d / 2 / zoom);
	};

	ext.placeBody = function (id, x, y, dir) {
		if (corpos [id]) {
			world.DestroyBody (corpos [id]);
		}
		
		fixDef.filter.categoryBits = bodyCategoryBits;
		fixDef.filter.maskBits = bodyMaskBits;
		
		bodyDef.position.x = x / zoom;
		bodyDef.position.y = y / zoom;
		bodyDef.angle = (90-dir) * toRad;
		var body = world.CreateBody (bodyDef);
		body.uid = id;
		body.CreateFixture (fixDef);
		corpos [id] = corpo;
	};
	
	ext.destroyBody = function (id) {
		if (corpos [id]) {
			world.DestroyBody (corpos [id]);
			excluir corpos [id];
		}
	};

	ext.getBodyAttr = function (attr, id) {
		var body = corpos [id];
		if (! body) return '';
		switch (attr) {
			case 'x': return body.GetPosition (). x * zoom;
			case 'y': retorna body.GetPosition (). y * zoom;
			case 'direction': return 90- (body.GetAngle () / toRad);
			case 'awake': return body.IsAwake ()? 1: 0;
		}
		Retorna '';
	};

	var mousePVec, selectedBody;
	
	function getBodyCB (fixture) {
		if (fixture.GetBody (). GetType ()! = b2Body.b2_staticBody) {
			if (fixture.GetShape (). TestPoint (fixture.GetBody (). GetTransform (), mousePVec)) {
				selectedBody = fixture.GetBody ();
				retorna falso;
			}
		}
		return true;
	};

	ext.getBodyIDAt = function (x, y) {
		mousePVec = novo b2Vec2 (x / zoom, y / zoom);
		var aabb = novo b2AABB ();
		aabb.lowerBound.Set (mousePVec.x - 0,001, mousePVec.y - 0,001);
		aabb.upperBound.Set (mousePVec.x + 0,001, mousePVec.y + 0,001);

		// Consulta o mundo em busca de formas sobrepostas.
		selectedBody = null;
		world.QueryAABB (getBodyCB, aabb);
		
		retornar selectedBody? selectedBody.uid: '';
	};

/ * ext.createJointBetween = function (bodyID, x, y, bodyID2, x2, y2) {
		if (bodyID == '') {
			bodyID = nulo;
		}
		var body = bodyID? corpos [bodyID]: world.GetGroundBody ();
		var body2 = corpos [bodyID2];
		
		if (body) {
			var md = new Box2D.Dynamics.Joints.b2RevoluteJointDef ();
			md.bodyA = corpo;
			md.bodyB = body2;
			md.localAnchorA = {x: x / zoom, y: y / zoom};
			md.localAnchorB = {x: x2 / zoom, y: y2 / zoom};
			//md.collideConnected = true;
			//md.maxForce = 300.0 * body.GetMass ();
			var joint = world.CreateJoint (md);
			if (bodyID) {
				body.SetAwake (true);
			}
			body2.SetAwake (true);
			juntas [++ ujid_seq] = junta;
			return '' + ujid_seq;
		}
		Retorna '';
	}; * /
	
	// ['', 'Definir comprimento da mola:% n Amortecimento:% n Freq:% n', 'defineSpring', 100, 0,5, 8],
	var defSpring = {len: 100, úmido: 0,7, freq: 5};
	ext.defineSpring = function (len, damp, freq) {
		defSpring.len = len <0,1? 0,1: len / zoom;
		defSpring.damp = úmido <0? 0,7: úmido;
		defSpring.freq = freq> 0? freq: 5;
	}
	
	ext.createJointOfType = function (jName, typ, bodyID, x, y, bodyID2, x2, y2) {
		
		if (jNome.Comprimento> 0) ext.destroyJoint (jNome);

		if (bodyID == '') bodyID = null;
		if (bodyID2 == '') bodyID2 = null;
		if (! bodyID &&! bodyID2) return '';
			
		var body = bodyID? corpos [bodyID]: world.GetGroundBody ();
		var body2 = bodyID2? corpos [bodyID2]: world.GetGroundBody ();
		
		if (! body ||! body2) return '';
		
		var md;
		switch (typ) {
			case 'Spring':
				md = novo Box2D.Dynamics.Joints.b2DistanceJointDef ();
				md.length = defSpring.len;
				md.dampingRatio = defSpring.damp;
				md.frequencyHz = defSpring.freq;
				md.bodyA = corpo;
				md.bodyB = body2;
				md.localAnchorA = {x: x / zoom, y: y / zoom};
				md.localAnchorB = {x: x2 / zoom, y: y2 / zoom};
				pausa;
				
			caso 'Rotativo':
				md = novo Box2D.Dynamics.Joints.b2RevoluteJointDef ();
				md.bodyA = corpo;
				md.bodyB = body2;
				md.localAnchorA = {x: x / zoom, y: y / zoom};
				md.localAnchorB = {x: x2 / zoom, y: y2 / zoom};
				pausa;
				
			case 'Mouse':
				var md = new b2MouseJointDef ();
				if (bodyID == '') {
					md.bodyB = body2;
					md.target.Set (x2 / zoom, y2 / zoom);
				} senão {
					md.bodyB = corpo;
					md.target.Set (x / zoom, y / zoom);
				}
				md.bodyA = world.GetGroundBody ();
				md.collideConnected = true;
				md.maxForce = 300,0 * body.GetMass ();
				pausa;
		}
		
		//md.collideConnected = true;
		//md.maxForce = 300.0 * body.GetMass ();
		var joint = world.CreateJoint (md);
		if (bodyID.length> 0) {
			body.SetAwake (true);
		}
		if (bodyID2.length> 0) {
			body2.SetAwake (true);
		}
		
		if (jName.length == 0) jName = '_' + (++ ujid_seq);
		juntas [jNome] = junta;
	};
	
	/*ext.createJointAt = function (bodyID, x, y) {
		var body = corpos [bodyID];
		if (body) {
			var md = new b2MouseJointDef ();
			md.bodyA = world.GetGroundBody ();
			md.bodyB = corpo;
			md.target.Set (x / zoom, y / zoom);
			md.collideConnected = true;
			md.maxForce = 300,0 * body.GetMass ();
			var joint = world.CreateJoint (md);
			body.SetAwake (true);
			juntas [++ ujid_seq] = junta;
			return '' + ujid_seq;
		}
		Retorna '';
	}; * /
	
	ext.setJointTarget = function (jointID, x, y) {
		articulação var = articulações [ID da articulação];
		if (junta) {
			joint.SetTarget (novo b2Vec2 (x / zoom, y / zoom));
		}
	};
		
	ext.setJointAttr = function (attr, jointID, val) {
		// JointAttr: ['Motor On', 'Motor Speed', 'Max Torque', 'Limits On', 'Lower Limit', 'Upper Limit'],

		var jointids = jointID.split ('');
		para (var i = 0; i <jointids.length; i ++) {
			articulação var = articulações [articulações [i]];
			if (junta) {
				switch (attr) {
				caso 'Motor On': joint.EnableMotor (val> 0); pausa;
				case 'Motor Speed': joint.SetMotorSpeed ​​(val); pausa;
				case 'Max Torque': joint.SetMaxMotorTorque (val); pausa;
				
				case 'Limits On': joint.EnableLimit (val> 0); pausa;
				caso 'Limite inferior': joint.SetLimits (joint.GetJointAngle () + val * toRad, joint.GetUpperLimit ()); pausa;
				caso 'Limite superior': joint.SetLimits (joint.GetLowerLimit (), joint.GetJointAngle () + val * toRad); pausa;
			}
			}
		}
	};
		
	ext.getJointAttr = function (attr, jointID) {
		// JointAttrRead: ['Ângulo', 'Velocidade', 'Torque do motor', 'Torque de reação'],

		articulação var = articulações [ID da articulação];
		if (junta) {
			switch (attr) {
				case 'Angle': return joint.GetJointAngle () / toRad;
				case 'Speed': return joint.GetJointSpeed ​​();
				case 'Torque do Motor': junta de retorno.GetMotorTorque ();
				case 'Torque de reação': junta de retorno.GetReactionTorque ();
				
// case 'Limite inferior': return joint.GetLowerLimit () / toRad;
// case 'Limite superior': return joint.GetUpperLimit () / toRad;
			}
		}
	};
		
	ext.destroyJoint = function (jointID) {
		articulação var = articulações [ID da articulação];
		if (junta) {
			world.DestroyJoint (conjunta);
			excluir juntas [jointID];
		}
	};

	ext.applyForceToBody = function (ftype, bodyID, x, y, pow, dir) {
		var body = corpos [bodyID];
		if (! body)
			Retorna;

		dir = (90-dir) * toRad;
			
		if (ftype === 'Impulso') {
			body.ApplyImpulse ({x: pow * Math.cos (dir), y: pow * Math.sin (dir)}, body.GetWorldPoint ({x: x / zoom, y: y / zoom}));			
		} else if (ftype === 'Impulso Mundial') {
			body.ApplyForce ({x: pow * Math.cos (dir), y: pow * Math.sin (dir)}, {x: x / zoom, y: y / zoom});			
		}
	};
	
	ext.applyAngForceToBody = function (ftype, bodyID, pow) {
		var body = corpos [bodyID];
		if (! body)
			Retorna;

		if (ftype === 'Impulso') {
			//console.log(body);
			body.ApplyTorque (-pow);			
		}
	};
	
	ext.createNoCollideSet = function (set) {
		noCollideSeq--;
		var bid = set.split ('');
		para (var i = 0; i <bid.length; i ++) {
			var lance = lances [i];
			if (bid.length> 0) {
				var body = corpos [lance];
				if (body) {
					var fix = body.GetFixtureList ();
					while (fix) {
						var fdata = fix.GetFilterData ();
						fdata.groupIndex = noCollideSeq;
						fix.SetFilterData (fdata);
						fix = fix.GetNext ();
					}
				}
			}
		}
	};
	
	ext.stepSimulation = function () {
		world.Step (1/30, 10, 10);
		world.ClearForces ();
	};
	
    var descriptor = {
        blocos: [
            ['b', 'Box2D disponível', 'disponível'],
            ['', 'Init World; escala 1m =% n gravidade =% n cena =% m.sceneType ',' init ', 50, -10,' stage '],
			["-"],
			["-"],
			['', 'Definir tipo% m.BodyTypePK Densidade% n Fricção% n Salto% n', 'setBodyAttrs', 'dinâmico', 1,0, 0,5, 0,2],
			["-"],
/ * ['', 'Definir categoria% s', 'defineCategory', 'default'],
			['', 'Definir categoria de colisão% s', 'defineCollideCategory', 'padrão'],
			["-"], * /
			['', 'Definir Círculo, tamanho:% n', 'defineCircle', 100],
			['', 'Definir caixa, largura:% n altura:% n', 'definirRect', 100, 100],
			['', 'Definir polígono, pontos:% s', 'definePoly', '0 50 40 -50 -40 -50'],
			["-"],
			['', 'Criar corpo% s em x:% ny:% n dir:% n', 'placeBody', 'name', 0,0, 90],
			['', 'Criar conjunto sem conflito% s', 'createNoCollideSet', 'nome1 nome2 nome3'],
			['', 'Destroy Body% s', 'destroyBody', 'name'],
			["-"],
			["-"],
			["-"],
			['', 'Definir% m.bodyAttr do corpo% s para% n', 'setBodyAttr', 'amortecimento', 'nome', '0,1'],
			['r', 'Obter% m.bodyAttrRead do corpo% s', 'getBodyAttr', 'x', 'nome'],
			["-"],
			['r', 'Obter id do corpo em x:% ny:% n', 'getBodyIDAt', 0, 0],
			["-"],
			["-"],
			["-"],
			['', 'Aplicar% m.ForceType ao corpo% s em x:% ny:% n power:% n dir:% n', 'applyForceToBody', 'Impulse', 'name', 0, 0, 50, 90],
			['', 'Aplicar Angular% m.ForceType ao corpo% s power:% n', 'applyAngForceToBody', 'Impulse', 'name', 0],
			["-"],
			["-"],
			["-"],
			['', 'Definir comprimento da mola:% n Amortecimento:% n Freq:% n', 'defineSpring', 100, 0,7, 5],
			['', 'Criar junta% s do tipo% m.JointType entre% s em% n% n e% s em% n% n', 'createJointOfType', 'JointID', 'Rotativo', 'BodyID', 0 , 0, 'BodyID', 0,0],
			['', 'Destroy Joint ID% s', 'destroyJoint', 'Joint ID'],
			["-"],
			['', 'Definir a junta% m.JointAttr da junta% s para% n', 'setJointAttr', 'Motor On', 'Joint ID', 0, 0],
			['r', 'Get Joint% m.JointAttrRead of joint% s', 'getJointAttr', 'Angle', 'Joint ID'],
			['', 'Definir destino da junta do mouse% s para x:% ny:% n', 'setJointTarget', 'ID da junta', 0, 0],
			["-"],
			["-"],
			["-"],
			['', 'Step Simulation', 'stepSimulation'],
        ],
		menus: {
			sceneType: ['stage', 'nothing'],
			BodyTypePK: ['dinâmico', 'estático'],
			bodyAttr: ['amortecimento', 'amortecimento rotacional'],
			bodyAttrRead: ['x', 'y', 'direção', 'acordado'],
			ForceType: ['Impulse', 'World Impulse'],
			AngForceType: ['Impulse'],
			JointType: ['Rotativo', 'Mola', 'Mouse'],
			JointAttr: ['Motor On', 'Motor Speed', 'Max Torque', 'Limits On', 'Lower Limit', 'Upper Limit'],
			JointAttrRead: ['Ângulo', 'Velocidade', 'Torque do motor', 'Torque de reação'],
		},
/ * url: 'www.griffpatch.co.uk' * /
    };
	
    if (ScratchExtensions) {
// ScratchExtensions.unregister ('Griffpatch Box2D');
        ScratchExtensions.register ('Griffpatch Box2D', descritor, ext);
    }
}) ({});
