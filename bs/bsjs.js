/*
 * bsJS - OpenSource JavaScript library
 * version 0.2.0 / 2013.12.25 by projectBS committee
 * 
 * Copyright 2013.10 projectBS committee.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * GitHub: https://github.com/projectBS/bsJS
 * Facebook group: https://www.facebook.com/groups/bs5js/
 */
( function( W, N ){
'use strict';
var VERSION, PLUGIN_REPO, bs, node, im = [], que, doc, id,
	slice = Array.prototype.slice, none = function(){}, trim = /^\s*|\s*$/g, re = {}, timeout = 5000, depend = {};
	
if( doc = W['document'] ) PLUGIN_REPO='../bs/plugin/',que=[],W[N=N||'bs']=bs=function(f){que?(que[que.length]=f):f();};
else if( __dirname ) PLUGIN_REPO='http://projectbs.github.io/bsJS/bs/plugin/', node=require('./node'), module.exports = bs = function(f){bs.__root = f;},bs.__root = __dirname;
else throw new Error( 0, 'not supported platform' );
bs.VERSION = VERSION = 0.2;
function error( $num, $msg ){if( doc ) throw new Error( $num, $msg ); else console.log( $num, $msg );}
function dependency( $arg ){
	var t0, i, j, k, v;
	if( $arg.length < 4 ) return;
	$arg = slice.call( $arg, 3 ), i = 0, j = $arg.length;
	while( i < j ){
		k = $arg[i++], t0 = depend[k];
		if( !t0 || t0 < ( v = $arg[i++] ) ){
			error( 0, 'dependency:'+k+'('+v+'), '+ t0 );
			break;
		}
	}
	return $arg;
}
function method( $name, $func, $version/*, $dependency*/ ){
	$name = $name.toLowerCase().replace( trim, '' );
	if( $name.charAt(0) == '@' ) $name = '$' + $name.substr(1); else if( bs[$name = '$' + $name] ) error( 2, 'method exist:' + $name );
	$func.DEPENDENCY = dependency( arguments ) || {length:0}, depend[$name.substr(1)] = $func.VERSION = $version || VERSION, bs[$name] = $func;
}
method( 'timeout', function( $time ){timeout = parseInt( $time * 1000 );} ),
method( 'method', method ),
method( 'class', (function(){
	function factory( $name, $func ){
		var cls, fn, t0, k;
		$func( t0 = {}, bs ), cls = function( $sel ){this.__new( this.__k = $sel );}, fn = cls.prototype, fn.__new = none, fn.destroyer = function(){delete cls[this.__k];};
		if( typeof $func == 'function' ){for( k in t0 ) if( t0.hasOwnProperty( k ) ) k == 'constructor' ? ( fn.__new = t0.constructor ) : ( fn[k] = t0[k] );}
		return fn.instanceOf = bs[$name] = function( $sel ){
			var t0;
			if( typeof $sel == 'string' ){
				if( ( t0 = $sel.charAt(0) ) == '@' ) $sel = $sel.substr(1); else if( t0 != '<' ) return cls[$sel] || ( cls[$sel] = new cls( $sel ) );
			}
			return new cls( $sel );
		};
	}
	return function( $name, $func, $version/*, $dependency*/ ){
		var t0, t1;
		$name = $name.toLowerCase().replace( trim, '' );
		if( $name.charAt(0) == '@' ) $name = $name.substr(1); else if( bs[$name] ) error( 2, 'class exist:' + $name );
		t0 = dependency( arguments ), t1 = factory( $name, $func ), depend[$name] = t1.VERSION = $version || VERSION, t1.DEPENDENCY = t0 || {length:0};
	};
})() ),
method( 'static', function( $name, $obj, $version/*, $dependency*/ ){
	$name = $name.toUpperCase().replace( trim, '' );
	if( $name.charAt(0) == '@' ) $name = $name.substr(1); else if( bs[$name] ) error( 3, 'static exist:' + $name );
	$obj.DEPENDENCY = dependency( arguments ) || {length:0}, depend[$name] = $obj.VERSION = $version || VERSION, bs[$name] = $obj;
} ),
method( 'importPath', function( $path ){bs.$import.path = $path;} ),
method( 'register', function( $type, $name, $obj, $version/*, $dependency*/ ){
	if( !re[$name] ) error( 5, 'register undefined :' + $name );
	else re[$name].apply( null, arguments ), delete re[$name];
} ),
method( 'import', function(){for( var i = 0, j = arguments.length ; i < j ; i++ ) im[im.length] = arguments[i];} ),
method( 'importer', function( $end ){
	var id, isLoaded, list, path, loader, i, j, k, v;
	path = bs.$import.path || PLUGIN_REPO, list = arguments, i = 1, j = list.length,
	( loader = function(){
		if( i == j ) return $end();
		k = list[i++].toLowerCase(), v = list[i++], v = v == 'last' || !v ? '' : v;
		if( depend[k] && depend[k] >= v ) return loader();
		re[k] = function( $type, $name, $obj, $version/*, $dependency*/ ){
			var register, t0, t1, i, j, k, v;
			isLoaded = 1, clearTimeout( id );
			if( $version === undefined ) error( 4, 'import undefined version' );
			register = function(){
				switch( $type ){
				case'class':case'method':case'static':bs['$'+$type]( '@' + $name, $obj, $version ); break;
				default:throw new Error( 4, 'import type:' + $type );
				}
				loader();
			}
			if( arguments.length > 4 ){
				t1 = [register], i = 4, j = arg.length;
				while( i < j ){
					k = arguments[i++], v = arguments[i++], t0 = depend[k];
					if( !t0 || t0 < v ) t1[t1.length] = k, t1[t1.length] = v;
				}
				if( t1.length > 1 ) return bs.$importer.apply( null, t1 );
			}
			register();
		}, id = setTimeout( function(){if( !isLoaded ) error( 4, 'import timeout' );}, timeout ),
		isLoaded = 0, bs.$js( none, path + k + v + '.js' );
	} )();
} ),
method( 'tmpl', (function(){
	var arg, reg;
	reg = /@[^@]+@/g;
	function r( $0 ){
		var t0, t1, t2, i, j, k, l, cnt;
		$0 = $0.substring( 1, $0.length - 1 ), t0 = $0.split('.'), i = 1, j = arg.length, l = t0.length, cnt = 0;
		while( i < j ){
			t1 = arg[i++], k = 0;
			while( k < l && t1 !== undefined ) t1 = t1[t0[k++]];
			if( t1 !== undefined ) cnt++, t2 = t1;
		}
		if( cnt == 0 ) return $0;
		if( cnt > 1 ) return '@ERROR matchs '+cnt+'times@'
		if( ( i = typeof t2 ) == 'object' ){
			if( t2.TMPL ) return t2.TMPL( $0 );
			else if( t2.splice ) return t2.join('');
		}else if( i == 'function' ) return t2( $0 );
		return t2;
	}
	return function( $str ){
		if( $str.substr(0,2) == '#T' ) $str = bs.dom( $str ).$('@text');
		else if( $str.substr($str.length-5) == '.html' ) $str = bs.$get( null, $str );
		return arg = arguments, bs.$trim( $str.replace( reg, r ) );
	};
})() );
function regfactory( r, v ){	
	function f( $v ){
		var t0, i;
		if( typeof $v == 'string' ) return $v.replace( r, v ); else if( !$v ) return $v;
		if( typeof $v == 'object' ){
			if( $v.splice ){t0 = [], i = $v.length; while( i-- ) t0[i] = f( $v[i] );}
			else{t0 = {}; for( i in $v ) t0[i] = f( $v[i] );}
			return t0;
		}
		return $v;
	};
	return f;
}
method( 'stripTag', regfactory( /[<][^>]+[>]/g, '' ) ),
method( 'trim', regfactory( /^\s*|\s*$/g, '' ) ),
method( 'ex', (function(){
	var rc = 0, random = function(){return rc = ( rc + 1 ) % 1000, random[rc] || ( random[rc] = Math.random() );};
	return function(){
		var t0, i, j;
		t0 = arguments[0], i = 1, j = arguments.length;
		while( i < j ){
			switch( arguments[i++] ){
			case'~': return parseInt( random() * ( arguments[i++] - t0 + 1 ) ) + t0;
			case'~f': return random() * ( arguments[i++] - t0 ) + t0;
			}
		}
		return t0;
	};
})() ),		
method( 'reverse', function( $obj ){
	var t0, i;
	i = $obj.length;
	if( $obj.splice ){t0 = []; while( i-- ) t0[t0.length] = $obj[i];}else{t0 = {length:0};while( i-- ) t0[t0.length++] = $obj[i];}
	return t0;
} ),
method( 'deco', (function(){
	function deco( $v, $t, $f, $r, $isEnd ){
		var t0 = $v;
		switch( $t ){
		case's':case'n': return t0 = $isEnd ? t0 + $f : $f + t0, t0;
		case'f': return t0 = $f( t0, i );
		case'r': if( typeof t0 == 'string' ) t0 = t0.replace( $f, $r ); return t0;
		}
	}
	return function( $obj, $start, $end ){
		var type0, reg0, type1, reg1, t0, i;
		type0 = ( typeof $start ).charAt(0), i = 3;
		if( $start instanceof RegExp ) type0 = 'r', reg0 = $end, $end = arguments[3], i = 4;
		if( !$end ) type1 = '-'; else{type1 = ( typeof $end ).charAt(0); if( $end instanceof RegExp ) type1 = 'reg', reg1 = arguments[i];}
		if( $obj.splice ){t0 = [], i = $obj.length; while( i-- ) t0[i] = deco( deco( $obj[i], type0, $start, reg0 ), type1, $end, reg1 );}
		else{t0 = {}; for( i in $obj ) t0[i] = deco( deco( $obj[i], type0, $start, reg0 ), type1, $end, reg1, 1 );}
		return t0;
	};
})() ),
method( 'cgi', function( $arg ){
	var h, t0, i, j;
	if( !$arg || ( j = $arg.length ) < 4 ) return '';
	h = bs.$cgi.header, t0 = bs.$cgi.temp;
	h.length = t0.length = 0, i = 2;
	while( i < j )
		if ( $arg[i].charAt(0) == '@' ) h[h.length] = $arg[i++].substr(1), h[h.length] = $arg[i++];
		else t0[t0.length] = encodeURIComponent( $arg[i++] ) + '=' + encodeURIComponent( $arg[i++] );
	return t0.join('&');
} ),
bs.$cgi.header = [], bs.$cgi.temp = [],
method( 'url', function( $url, $arg ){
	return $url=$url.split( '#' ),$url[0]+($url[0].indexOf('?')>-1?'&':'?')+'bsNC='+bs.$ex(1000,'~',9999)+'&'+bs.$cgi($arg)+($url[1]?'#'+$url[1]:'');
} );
if( !doc ) return node( bs );
(function( doc, bs ){
//0. es5 adapter
if( !Date.now ) Date.now = function(){return +new Date;};
if( !Array.prototype.indexOf ) Array.prototype.indexOf = function( $v, $i ){
	var i, j, k, l;
	if( j = this.length ) for( $i = $i || 0, i = $i, k = parseInt( ( j - i ) * .5 ) + i + 1, j-- ; i < k ; i++ )
		if( this[l = i] === $v || this[l = j - i + $i] === $v ) return l; 
	return -1;
};
if( !W['JSON'] ) W['JSON'] = {
	parse:function( $str ){return (0,eval)( '(' + $str + ')' );},
	stringify:(function(){
		var r = /["]/g;
		function stringify( $obj ){
			var t0, i, j;
			switch( t0 = typeof $obj ){
			case'string': return '"' + $obj.replace( r, '\\"' ) + '"';
			case'number':case'boolean': return $obj.toString();
			case'undefined': return t0;
			case'object':
				if( !$obj ) return 'null';
				t0 = '';
				if( $obj.splice ){
					for( i = 0, j = $obj.length ; i < j ; i++ ) t0 += ',' + stringify( $obj[i] );
					return '[' + t0.substr(1) + ']';
				}else{
					for( i in $obj ) if( $obj.hasOwnProperty( i ) && $obj[i] !== undefined && typeof $obj[i] != 'function' )
						t0 += ',"'+i+'":' + stringify( $obj[i] );
					return '{' + t0.substr(1) + '}';
				}
			}
		}
		return stringify;
	})()
};
if( !W['console'] ) (function(){
	var log = [], t0;
	W['console'] = {
		log:function(){log.push( Array.prototype.join( arguments, ', ' ) );},
		flush:function(){return t0 = log.slice(0), log.length = 0, t0;}
	};
})();
//3. define JSloader, ajax
var head, e, rq, js, jid, jc;
function xhrSend( $type, $xhr, $data ){
	var h, i, j;
	$xhr.setRequestHeader( 'Content-Type', $type == 'GET' ? 'text/plain; charset=UTF-8' : 'application/x-www-form-urlencoded; charset=UTF-8' ),
	$xhr.setRequestHeader( 'Cache-Control', 'no-cache' ),
	h = bs.$cgi.header, i = 0, j = h.length;
	while(i < j) $xhr.setRequestHeader( h[i++], h[i++] );
	$xhr.send( $data );
}
function xhr( $end ){
	var t0, t1;
	return t0 = rq(), t0.onreadystatechange = function(){
		if( t0.readyState != 4 || t1 < 0 ) return;
		t0.onreadystatechange = null, clearTimeout( t1 ), t1 = -1, $end( t0.status == 200 || t0.status == 0 ? t0.responseText : '@'+t0.status );
	}, t1 = setTimeout( function(){if( t1 > -1 ) t1 = -1, t0.onreadystatechange = null, $end( '@timeout' );}, timeout ), t0;
}
function http( $type, $end, $url, $arg ){
	var t0;
	return t0 = $end ? xhr( $end ) : rq(), t0.open( $type, $url, $end ? true : false ), xhrSend( $type, t0, bs.$cgi( $arg ) || '' ), $end ? '' : t0.responseText;
}
head = doc.getElementsByTagName( 'head' )[0], e = W['addEventListener'],
rq = W['XMLHttpRequest'] ? function(){return new XMLHttpRequest;} : (function(){
	var t0, i, j;
	t0 = 'MSXML2.XMLHTTP', t0 = ['Microsoft.XMLHTTP',t0,t0+'.3.0',t0+'.4.0',t0+'.5.0'], i = t0.length;
	while( i-- ){try{new ActiveXObject( j = t0[i] );}catch( $e ){continue;}break;}
	return function(){return new ActiveXObject( j );};
})(),
jid = 0, bs.__callback = jc = {},
js = function( $data, $load, $end ){
	var t0, i;
	t0 = doc.createElement( 'script' ), t0.type = 'text/javascript', t0.charset = 'utf-8', head.appendChild( t0 );
	if( $load ){
		if( e ) t0.onload = function(){t0.onload = null, $load();};
		else t0.onreadystatechange = function(){(t0.readyState=='loaded'||t0.readyState=='complete')&&(t0.onreadystatechange=null,$load());};
		if( $data.charAt($data.length-1)=='=' ) $data += 'bs.__callback.'+(i='c'+(id++)), jc[i] = function(){delete jc[i],$end.apply(null,arguments);};
		t0.src = $data;
	}else t0.text = $data;
},
method( 'get', function( $end, $url ){return http( 'GET', $end, bs.$url( $url, arguments ) );} ),
method( 'post', function( $end, $url ){return http( 'POST', $end, bs.$url($url), arguments );} ),
method( 'put', function( $end, $url ){return http( 'PUT', $end, bs.$url($url), arguments );} ),
method( 'delete', function( $end, $url ){return http( 'DELETE', $end, bs.$url($url), arguments );} ),
method( 'js', function( $end ){
	var i, j, arg, load;
	arg = arguments, i = 1, j = arg.length;
	if( $end ) ( load = function(){i < j ? js( arg[i++], load, $end ) : $end();} )();
	else while( i < j ) js( bs.$get( null, arg[i++] ) );
} ),
method( 'img', (function(){
	function _load( $src, $data ){
		var t0, t1;
		t0 = new Image;
		if( window['HTMLCanvasElement'] ) t0.onload = $data.loaded;
		else ( t1 = function(){t0.complete ? $data.loaded() : setTimeout( t1, 10 );} )();
		return t0.src = $src, t0;
	}
	return function load( $end ){
		var t0, path, i, j;
		arguments.length == 2 && arguments[1][0] ? ( path = arguments[1], i = 0 ) : ( path = arguments, i = 1 ), j = path.length,
		t0 = {count:0, length:0, loaded:function loaded(){
				var t1, w, h, i, j;
				if( ++t0.count == ( j = t0.length ) ){
					i = 0;
					while( i < j ) t1 = t0[i++], t1.bsImg = {w:w = t1.width, h:h = t1.height};
					$end( t0 );
				}
			}
		};
		while( i < j ) t0[t0.length++] = _load( path[i++], t0 );
	};
})() ),
method( 'go', function( $url ){location.href = $url;} ),
method( 'open', function( $url ){W.open( $url );} ),
method( 'back', function(){history.back();} ),
method( 'reload', function(){location.reload();} ),
method( 'ck', function ck( $key/*, $val, $expire, $path*/ ){
	var t0, t1, t2, i, v;
	t0 = document.cookie.split(';'), i = t0.length;
	if( arguments.length == 1 ){
		while( i-- ) if( ( t1 = bs.$trim(t0[i].split('=')), t1[0] ) == $key ) return decodeURIComponent( t1[1] );
		return null;
	}else{
		v = arguments[1], t1 = $key + '=' + ( v ? encodeURIComponent( v ) : '' ) + ';domain='+document.domain+';path='+ (arguments[3] || '/');
		if( v === null ) t0 = new Date, t0.setTime( t0.getTime() - 86400000 ), t1 += ';expires=' + t0.toUTCString();
		else if( arguments[2] ) t0 = new Date, t0.setTime( t0.getTime() + arguments[2] * 86400000 ), t1 += ';expires=' + t0.toUTCString();
		return document.cookie = t1, v;
	}
} );
function DETECT(){
	var platform, app, agent, device,
		flash, browser, bVersion, os, osVersion, cssPrefix, stylePrefix, transform3D,
		b, bStyle, div, keyframe,
		v, a, c;
	agent = navigator.userAgent.toLowerCase(),
	platform = navigator.platform.toLowerCase(),
	app = navigator.appVersion.toLowerCase(),
	flash = 0, device = 'pc',
	(function(){
		var i;
		function ie(){
			if( agent.indexOf( 'msie' ) < 0 && agent.indexOf( 'trident' ) < 0 ) return;
			if( agent.indexOf( 'iemobile' ) > -1 ) os = 'winMobile';
			return browser = 'ie', bVersion = agent.indexOf( 'msie' ) < 0 ? 11 : parseFloat( /msie ([\d]+)/.exec( agent )[1] );
		}
		function chrome( i ){
			if( agent.indexOf( i = 'chrome' ) < 0 && agent.indexOf( i = 'crios' ) < 0 ) return;
			return browser = 'chrome', bVersion = parseFloat( ( i == 'chrome' ? /chrome\/([\d]+)/ : /crios\/([\d]+)/ ).exec( agent )[1] );
		}
		function firefox(){
			if( agent.indexOf( 'firefox' ) < 0 ) return;
			return browser = 'firefox', bVersion = parseFloat( /firefox\/([\d]+)/.exec( agent )[1] );
		}
		function safari(){
			if( agent.indexOf( 'safari' ) < 0 ) return;
			return browser = 'safari', bVersion = parseFloat( /safari\/([\d]+)/.exec( agent )[1] );
		}
		function opera(){
			if( agent.indexOf( 'opera' ) < 0 ) return;
			return browser = 'opera', bVersion = parseFloat( /version\/([\d]+)/.exec( agent )[1] );
		}
		function naver(){if( agent.indexOf( 'naver' ) > -1 ) return browser = 'naver';}
		if( agent.indexOf( 'android' ) > -1 ){
			browser = os = 'android';
			if( agent.indexOf( 'mobile' ) == -1 ) browser += 'Tablet', device = 'tablet';
			else device = 'mobile';
			i = /android ([\d.]+)/.exec( agent );
			if( i ) i = i[1].split('.'), osVersion = parseFloat( i[0] + '.' + i[1] );
			else osVersion = 0;
			i = /safari\/([\d.]+)/.exec( agent );
			if( i ) bVersion = parseFloat( i[1] );
			naver() || chrome() || firefox() || opera();
		}else if( agent.indexOf( i = 'ipad' ) > -1 || agent.indexOf( i = 'iphone' ) > -1 ){
			device = i == 'ipad' ? 'tablet' : 'mobile', browser = os = i;
			if( i = /os ([\d_]+)/.exec( agent ) ) i = i[1].split('_'), osVersion = parseFloat( i[0] + '.' + i[1] );
			else osVersion = 0;
			if( i = /mobile\/10a([\d]+)/.exec( agent ) ) bVersion = parseFloat( i[1] );
			naver() || chrome() || firefox() || opera();
		}else{
			(function(){
				var plug, t0, e;
				plug = navigator.plugins;
				if( browser == 'ie' ) try{t0 = new ActiveXObject( 'ShockwaveFlash.ShockwaveFlash' ).GetVariable( '$version' ).substr( 4 ).split( ',' ), flash = parseFloat( t0[0] + '.' + t0[1] );}catch( e ){}
				else if( ( t0 = plug['Shockwave Flash 2.0'] ) || ( t0 = plug['Shockwave Flash'] ) ) t0 = t0.description.split( ' ' )[2].split( '.' ), flash = parseFloat( t0[0] + '.' + t0[1] );
				else if( agent.indexOf( 'webtv' ) > -1 ) flash = agent.indexOf( 'webtv/2.6' ) > -1 ? 4 : agent.indexOf("webtv/2.5") > -1 ? 3 : 2;
			})();
			if( platform.indexOf( 'win' ) > -1 ){
				os = 'win', i = 'windows nt ';
				if( agent.indexOf( i + '5.1' ) > -1 ) osVersion = 'xp';
				else if( agent.indexOf( i + '6.0' ) > -1 ) osVersion = 'vista';
				else if( agent.indexOf( i + '6.1' ) > -1 ) osVersion = '7';
				else if( agent.indexOf( i + '6.2' ) > -1 ) osVersion = '8';
				else if( agent.indexOf( i + '6.3' ) > -1 ) osVersion = '8.1';
				ie() || chrome() || firefox() || safari() || opera();
			}else if( platform.indexOf( 'mac' ) > -1 ){      
				os = 'mac';
				i = /os x ([\d._]+)/.exec(agent)[1].replace( '_', '.' ).split('.');
				osVersion = parseFloat( i[0] + '.' + i[1] );
				chrome() || firefox() || safari() || opera();
			}else{
				os = app.indexOf( 'x11' ) > -1 ? 'unix' : app.indexOf( 'linux' ) > -1 ? 'linux' : 0;
				chrome() || firefox();
			}
		}
	})(),
	b = doc.body, bStyle = b.style, div = doc.createElement( 'div' ),
	div.innerHTML = '<div style="opacity:.55;position:fixed;top:100px;visibility:hidden;-webkit-overflow-scrolling:touch">a</div>',
	div = div.getElementsByTagName( 'div' )[0],
	c = doc.createElement( 'canvas' ), c = 'getContext' in c ? c : null,
	a = doc.createElement( 'audio' ), a = 'canPlayType' in a ? a : null,
	v = doc.createElement( 'video' ), v = 'canPlayType' in v ? v : null;
	switch( browser ){
	case'ie': cssPrefix = '-ms-', stylePrefix = 'ms'; transform3D = bVersion > 9 ? 1 : 0;
		if( bVersion == 6 ) doc.execCommand( 'BackgroundImageCache', false, true ), b.style.position = 'relative';
		break;
	case'firefox': cssPrefix = '-moz-', stylePrefix = 'Moz'; transform3D = 1; break;
	case'opera': cssPrefix = '-o-', stylePrefix = 'O'; transform3D = 0; break;
	default: cssPrefix = '-webkit-', stylePrefix = 'webkit'; transform3D = os == 'android' ? ( osVersion < 4 ? 0 : 1 ) : 0;
	}
	if( keyframe = W['CSSRule'] ){
		if( keyframe.WEBKIT_KEYFRAME_RULE ) keyframe = '-webkit-keyframes';
		else if( keyframe.MOZ_KEYFRAME_RULE ) keyframe = '-moz-keyframes';
		else if( keyframe.KEYFRAME_RULE ) keyframe = 'keyframes';
		else keyframe = null;
	}
	bs.$static( 'DETECT', {
		'device':device, 'browser':browser, 'browserVer':bVersion, 'os':os, 'osVer':osVersion, 'flash':flash, 'sony':agent.indexOf( 'sony' ) > -1,
		//dom
		root:b.scrollHeight ? b : doc.documentElement,
		scroll:doc.documentElement && typeof doc.documentElement.scrollLeft == 'number' ? 'scroll' : 'page',
		insertBefore:div.insertBefore, png:browser == 'ie' && bVersion > 7, 
		opacity:div.style.opacity == '0.55' ? 1 : 0, text:div.textContent ? 'textContent' : div.innerText ? 'innerText' : 'innerHTML',
		cstyle:doc.defaultView && doc.defaultView.getComputedStyle,
		//css3
		cssPrefix:cssPrefix, stylePrefix:stylePrefix, filterFix:browser == 'ie' && bVersion == 8 ? ';-ms-' : ';',
		transition:stylePrefix + 'Transition' in bStyle || 'transition' in bStyle, transform3D:transform3D, keyframe:keyframe,
		//html5
		canvas:c, canvasText:c && c.getContext('2d').fillText,
		audio:a,
		audioMp3:a && a.canPlayType( 'audio/mpeg;' ).indexOf( 'no' ) < 0 ? 1 : 0,
		audioOgg:a && a.canPlayType( 'audio/ogg;' ).indexOf( 'no' ) < 0 ? 1 : 0,
		audioWav:a && a.canPlayType( 'audio/wav;' ).indexOf( 'no' ) < 0 ? 1 : 0,
		audioMp4:a && a.canPlayType( 'audio/mp4;' ).indexOf( 'no' ) < 0 ? 1 : 0,
		video:v,
		videoCaption:'track' in doc.createElement('track') ? 1 : 0,
		videoPoster:v && 'poster' in v ? 1 : 0,
		videoWebm:v && v.canPlayType( 'video/webm; codecs="vp8,mp4a.40.2"' ).indexOf( 'no' ) == -1 ? 1 : 0,
		videH264:v && v.canPlayType( 'video/mp4; codecs="avc1.42E01E,m4a.40.2"' ).indexOf( 'no' ) == -1 ? 1 : 0,
		videoTeora:v && v.canPlayType( 'video/ogg; codecs="theora,vorbis"' ).indexOf( 'no' ) == -1 ? 1 : 0,
		local:W.localStorage && 'setItem' in localStorage,
		geo:navigator.geolocation, worker:W.Worker, file:W.FileReader, message:W.postMessage,
		history:'pushState' in history, offline:W.applicationCache,
		db:W.openDatabase, socket:W.WebSocket
	} );
}
function DOM(){
	var style;
	method( 'domquery', (function(doc){
		var c;
		if( doc.querySelectorAll ) return function( $sel ){return doc.querySelectorAll( $sel );};
		else return c = {}, function( $sel ){
			var t0, i;
			if( ( t0 = $sel.charAt(0) ) == '#' ){
				if( c[0] = doc.getElementById($sel.substr(1)) ) return c.length = 1, c;
				return null;
			}
			if( t0 == '.' ){
				$sel = $sel.substr(1), t0 = doc.getElementsByTagName('*'), c.length = 0, i = t0.length;
				while( i-- ) if( t0[i].className.indexOf( $sel ) > -1 ) c[c.length++] = t0[i];
				return c;
			}
			return doc.getElementsByTagName($sel);
		};
	})(doc) );
	method( 'domfromhtml', (function(doc){
		var div;
		div = doc.createElement( 'div' );
		return function( $sel ){
			return div.innerHTML = $sel, bs.$reverse( div.childNodes );
		};
	})(doc) ),
	method( 'dom', (function( sel, html ){
		var nodes = {};
		function dom( $sel, $node ){
			var r, t0, i, j, k;
			t0 = typeof $sel;
			if( t0 == 'function' ) return $sel();
			if( t0 == 'string' ) return $sel.charAt(0) == '<' ? html( $sel ) : sel( $sel );
			if( $sel.instanceOf == bs.dom ) return $sel;
			r = $node ? {} : nodes;
			if( $sel.nodeType == 1 ) return r[0] = $sel, r.length = 1, r;
			if( j = $sel.length ){
				for( r.length = i = 0 ; i < j ; i++ ){
					t0 = dom( $sel[i], 1 ), r.length = k = t0.length;
					while( k-- ) r[k] = t0[k];
				}
				return r;
			}
		}
		return dom;
	})( bs.$domquery, bs.$domfromhtml ) );
	style = (function(){
		var style, nopx, b, pf, reg, regf;
		b = doc.body.style,
		reg = /-[a-z]/g, regf = function($0){return $0.charAt(1).toUpperCase();},
		pf = bs.DETECT.stylePrefix, nopx = {'opacity':1,'zIndex':1},
		style = function(){this.s = arguments[0], this.u = {};},
		style.prototype.init = function(){this.s.cssText = '';},
		style.prototype.$ = function( $arg, i ){
			var t0, j, k, v, v0, u, s;
			u = this.u, s = this.s, i = i || 0, j = $arg.length;
			while( i < j ){
				t0 = $arg[i++], v = $arg[i++];
				if( !( k = style[t0] ) ){
					k = t0.replace( reg, regf );
					if( k in b ) style[t0] = k;
					else{
						k = pf+k.charAt(0).toUpperCase()+k.substr(1);
						if( k in b ) style[t0] = k;
						else continue;
					}
				}else if( typeof k == 'function' ){
					v = k( this, v );
					continue;
				}
				if( v || v === 0 ){ 
					if( this[k] === undefined ){ //add
						if( ( t0 = typeof v ) == 'number' ) this[k] = v, u[k] = nopx[k] ? '' : 'px';
						else if( t0 == 'string' ){
							if( v0 = style[v.substr(0,4)] ) this[k] = v = v0(v), u[k]='';
							else if( ( v0 = v.indexOf( ':' ) ) == -1 ) this[k] = v, u[k] = '';
							else this[k] = parseFloat( v.substr( 0, v0 ) ), u[k] = v.substr( v0 + 1 ), v = this[k];
						}
					}else this[k] = (typeof v == 'string' && (v0 = style[v.substr(0,4)])) ? v0(v) : v; //set
					s[k] = v + u[k];
				}else if( v === null ) delete this[k], delete u[k], s[k] = '';//del
				else return this[k]; //get
			}
			return v;
		},
		style.prototype.$g = function( t0 ){
			var k = style[t0];
			if( !k ){
				k = t0.replace( reg, regf );
				if( k in b ) style[t0] = k;
				else{
					k = pf+k.charAt(0).toUpperCase()+k.substr(1);
					if( k in b ) style[t0] = k;
					else return 0;
				}
			}else if( typeof k == 'function' ) return k( this );
			return this[k];
		},
		style.prototype.$s = function( t0, v ){
			var k = style[t0];
			if( !k ){
				k = t0.replace( reg, regf );
				if( k in b ) style[t0] = k;
				else{
					k = pf+k.charAt(0).toUpperCase()+k.substr(1);
					if( k in b ) style[t0] = k;
					else return 0;
				}
			}else if( typeof k == 'function' ) return k( this, v );
			return this[k] = v;
		},
		style.key = function( t0 ){
			var k = style[t0];
			if( !k ){
				k = t0.replace( reg, regf );
				if( k in b ) style[t0] = k;
				else{
					k = pf+k.charAt(0).toUpperCase()+k.substr(1);
					if( k in b ) style[t0] = k;
					else return 0;
				}
			}
			return k;
		},
		style.float = 'styleFloat' in b ? 'styleFloat' : 'cssFloat' in b ? 'cssFloat' : 'float', style['url('] = function($v){return $v;};
		if( !( 'opacity' in b ) ){
			style.opacity = function(s){
				var v = arguments[1];
				if( v === undefined ) return s.opacity;
				else if( v === null ) return delete s.opacity, s.s.filter = '', v;
				else return s.opacity = v, s.s.filter = 'alpha(opacity=' + parseInt( v * 100 ) + ')', v;
			};
			style['rgba'] = function($v){
				var t0 = $v.substring( 5, $v.length - 1 ).split(',');
				t0[3] = parseFloat(t0[3]);
				return 'rgb('+parseInt((255+t0[0]*t0[3])*.5)+','+parseInt((255+t0[1]*t0[3])*.5)+','+parseInt((255+t0[2]*t0[3])*.5)+')';
			};
		}
		return bs.style = style;
	})();
	bs.$class( 'css', function( $fn, bs ){
		var sheet, rule, ruleSet, idx, add, del, ruleKey, keyframe,
			r, parser;
		doc.getElementsByTagName( 'head' )[0].appendChild( sheet = doc.createElement( 'style' ) ),
		sheet = sheet.styleSheet || sheet.sheet, ruleSet = sheet.cssRules || sheet.rules,
		ruleKey = {'keyframes':bs.DETECT.keyframe}, keyframe = bs.DETECT.keyframe,
		idx = function( $rule ){
			var i, j, k, l;
			for( i = 0, j = ruleSet.length, k = parseInt( j * .5 ) + 1, j-- ; i < k ; i++ )
				if( ruleSet[l = i] === $rule || ruleSet[l = j - i] === $rule ) return l;
		};
		if( sheet.insertRule ) add = function( $k, $v ){sheet.insertRule( $k + ($v?'{'+$v+'}':'{}'), ruleSet.length ); return ruleSet[ruleSet.length - 1];},
			del = function( $v ){sheet.deleteRule( idx( $v ) );};
		else add = function( $k, $v ){sheet.addRule( $k, $v||' ' );return ruleSet[ruleSet.length - 1];},
			del = function( $v ){sheet.removeRule( idx( $v ) );};
		rule = function( $rule ){this.r = $rule, this.s = new style( $rule );},
		$fn.constructor = function( $key ){
			var t0, v;
			if( $key.indexOf('@') > -1 ){
				$key = $key.split('@');
				if( $key[0] == 'font-face' ){
					$key = $key[1].split(' '), v = 'font-family:'+$key[0]+";src:url('"+$key[1]+".eot');src:"+
						"url('"+$key[1]+".eot?#iefix') format('embedded-opentype'),url('"+$key[1]+".woff') format('woff'),"+
						"url('"+$key[1]+".ttf') format('truetype'),url('"+$key[1]+".svg') format('svg');",
					$key = '@font-face', this.type = 5;
					try{this.r = add( $key, v ); 
					}catch($e){
						doc.getElementsByTagName( 'head' )[0].appendChild( t0 = doc.createElement( 'style' ) ),
						(t0.styleSheet||t0.sheet).cssText = $key + '{' +v+'}';
					}
					return;
				}else if( $key[0] == 'keyframes' ){
					if( !keyframe )return this.type = -1;
					else $key = '@' + ( ruleKey[$key[0]] || $key[0] )+ ' ' + $key[1], this.type = 7;
				}
			}else this.type = 1;
			this.r = add( $key, v );
			if( this.type == 1 ) this.s = new style( this.r.style );
		},
		$fn.$ = function(){
			var type, t0, r;
			t0 = arguments[0], type = this.type;
			if( t0 === null ) return del( type < 0 ? 0 : this.destroyer(), this.r );
			else if( type == 1 ) return this.s.$( arguments );
			else if( type == 7 ){
				if( !this[t0] ){
					if( this.r.appendRule ) this.r.appendRule( t0+'{}' );
					else this.r.insertRule( t0+'{}' );
					r = this.r.cssRules[this.r.cssRules.length - 1], this[t0] = {r:r, s:new style( r.style )};
				}
				arguments[1] == null ? this[t0].s.init() : this[t0].s.$( arguments, 1 );
			}
			return this;
		}, r = /^[0-9.-]+$/,
		parser = function( $data ){
			var t0, t1, t2, c, i, j, k, v;
			t2 = [], t0 = $data.split('}');
			for( i = 0, j = t0.length ; i < j ; i++ ){
				if( t0[i] ){
					t0[i] = bs.$trim( t0[i].split('{') );
					if( t0[i][0].charAt(0) != '@' ){
						c = bs.css( t0[i][0] ), t1 = bs.$trim( t0[i][1].split(';') ), k = t1.length, t2.length = 0;
						while( k-- ) v = bs.$trim( t1[k].split(':') ), t2[t2.length] = v[0], t2[t2.length] = r.test(v[1]) ? parseFloat(v[1]) : v[1];
						c.$.apply( c, t2 );
					}
				}
			}
		}, bs.$method( 'css', function( $v ){$v.substr( $v.length - 4 ) == '.css' ? bs.$get( parser, $v ) : parser( $v );} );
	} );
	bs.$class( 'dom', function( $fn, bs ){
		var dom, ds, ds0, ev, t, x, y, nodes, drill, childNodes,
			win, wine, hash, sizer;
		t = /^\s*|\s*$/g, dom = bs.$dom,
		$fn.constructor = function( $key ){
			var t0, i;
			t0 = dom( $key ), this.length = i = t0.length;
			while( i-- ) this[i] = t0[i];
		},
		$fn._ = function(){
			var dom, i, j, k;
			i = this.length;
			while( i-- ){
				dom = this[i];
				if( dom.nodeType == 3 ) continue;
				if( dom.bsE ) dom.bsE = dom.bsE._();
				if( dom.bsS ) dom.bsS = null;
				dom.parentNode.removeChild( dom ),
				j = dom.attributes.length;
				while( j-- )
					switch( typeof dom.getAttribute( k = dom.attributes[j].nodeName ) ){
					case'object':case'function': dom.removeAttribute( k );
					}
				this[i] = null;
			}
			if( this.destroyer ) this.destroyer();
		},
		$fn.$ = function d$(){
			var dom, target, t0, l, s, i, j, k, v;
			j = arguments.length, typeof arguments[0] == 'number' ? ( s = l = 1, target = this[arguments[0]] ) : ( l = this.length, s = 0 );
			while( l-- ){
				dom = target || this[l], i = s, ds.length = 0;
				while( i < j ){
					k = arguments[i++];
					if( k === null ) this._();
					else if( ( v = arguments[i++] ) === undefined ){ //get
						return ev[k] ? ev( dom, k ) :
							( t0 = ds[k.charAt(0)] ) ? t0( dom, k.substr(1) ) :
							k == 'this' ? ( ds.length ? ( dom.bsS || ( dom.bsS = new style( dom.style ) ) ).$( ds ) : undefined, this ) :
							$fn[k] ? $fn[k]( dom ) :
							dom.bsS ? ( ds.length = 1, ds[0] = k, ds[1] = undefined, dom.bsS.$( ds ) ) : undefined;
					}else{
						v = ev[k] ? ev( dom, k, v ) :
							( t0 = ds[k.charAt(0)] ) ? ( v = t0( dom, k.substr(1), v, arguments, i ), i = t0.i || i, v ) :
							$fn[k] ? $fn[k]( dom, v ) : ( ds[ds.length++] = k, ds[ds.length++] = v );
					}
				}
				if( ds.length ) ( dom.bsS || ( dom.bsS = new style( dom.style ) ) ).$( ds );
				if( target ) break;
			}
			return v;
		},
		$fn.style = function( $dom ){return $dom.bsS;},
		$fn.x = x = function( $dom ){var i = 0; do i += $dom.offsetLeft; while( $dom = $dom.offsetParent ) return i;},
		$fn.y = y = function( $dom ){var i = 0; do i += $dom.offsetTop; while( $dom = $dom.offsetParent ) return i;},
		$fn.lx = function( $dom ){return x( $dom ) - x( $dom.parentNode );},
		$fn.ly = function( $dom ){return y( $dom ) - y( $dom.parentNode );},
		$fn.w = function( $dom ){return $dom.offsetWidth;},
		$fn.h = function( $dom ){return $dom.offsetHeight;},
		$fn.s = function( $dom ){$dom.submit();},
		$fn.f = function( $dom ){$dom.focus();},
		$fn.b = function( $dom ){$dom.blur();},
		$fn['<'] =function( $dom, $v ){
			var t0;
			if( $v ){
				if( $dom.parentNode ) $dom.parentNode.removeChild( $dom );
				return t0 = dom( $v ), t0[0].appendChild( $dom ), t0;
			}else return $dom.parentNode;
		},		
		$fn.html = function( $dom, $v ){return $v === undefined ? $dom.innerHTML : ( $dom.innerHTML = $v );},
		$fn['html+'] = function( $dom, $v ){return $dom.innerHTML += $v;},
		$fn['+html'] = function( $dom, $v ){return $dom.innerHTML = $v + $dom.innerHTML;},
		(function(){
			var t = bs.DETECT.text;
			$fn.text = function( $dom, $v ){return $v === undefined ? $dom[t] : ($dom[t]=$v);},
			$fn['text+'] = function( $dom, $v ){return $dom[t] += $v;},
			$fn['+text'] = function( $dom, $v ){return $dom[t] = $v + $dom[t];};
		})(),			
		$fn['class'] = function( $dom, $v ){return $v === undefined ? $dom.className : ($dom.className = $v);},
		$fn['class+'] = function( $dom, $v ){
			var t0;
			return !( t0 = $dom.className.replace(t,'') ) ? ( $dom.className = $v ) :
				t0.split( ' ' ).indexOf( $v ) == -1 ? ($dom.className = $v+' '+t0 ) : t0;
		},
		$fn['class-'] = function( $dom, $v ){
			var t0, i;
			if( !( t0 = bs.$trim( $dom.className ) ) ) return t0;
			t0 = t0.split( ' ' ); 
			if( ( i = t0.indexOf( $v ) ) > -1 ) t0.splice( i, 1 );
			return $dom.className = t0.join(' ');
		},
		childNodes = function( $nodes ){
			var i, j;
			for( nodes.length = i = 0, j = $nodes.length ; i < j ; i++ )
				if( $nodes[i].nodeType == 1 ) nodes[nodes.length++] = $nodes[i];
			return nodes;
		},
		drill = function( $dom, $k ){
			var i, j;
			if( $k.indexOf( '>' ) > -1 ){
				$k = $k.split('>');
				i = 0, j = $k.length;
				do $dom = childNodes( $dom.childNodes )[$k[i++]]; while( i < j )
			}else $dom = childNodes( $dom.childNodes )[$k];
			return $dom;
		},
		nodes = {length:0}, ds0 = {}, ds = {
			'@':function( $dom, $k, $v ){
				if( $v === undefined ) return $dom[$k] || $dom.getAttribute($k);
				else if( $v === null ){
					$dom.removeAttribute($k);
					try{delete $dom[$k];}catch(e){};
				}else $dom[$k] = $v, $dom.setAttribute($k, $v);
				return $v;
			},
			'_':( function( view, style ){
				return bs.DETECT.cstyle ? function( $dom, $k ){
					var t0 = view.getComputedStyle($dom,'').getPropertyValue($k);
					return t0.substr( t0.length - 2 ) == 'px' ? parseFloat( t0.substring( 0, t0.length - 2 ) ) : t0;
				} : function( $dom, $k ){
					var t0 = $dom.currentStyle[style.key($k)];
					return t0.substr( t0.length - 2 ) == 'px' ? parseFloat( t0.substring( 0, t0.length - 2 ) ) : t0;
				};
			} )( doc.defaultView, style ),
			'>':function( $dom, $k, $v, $arg, $i ){
				var t0, i, j, k, l, v;
				ds['>'].i = 0;
				if( $v ){
					if( $k ){
						if( typeof $v == 'string' ){
							if( style[$v] ) return $dom = drill( $dom, $k ), $dom.bsS ? ( ds.length=1,ds[0]=$v,ds[1]=undefined, $dom.bsS.$( ds ) ) : $dom.style[style[$v]];
							else if( ev[$v] ) return $dom = drill( $dom, $k ), ev( $dom, $v );
							else if( t0 = ds[$v.charAt(0)] ) return $dom = drill( $dom, $k ), t0( $dom, $v.substr(1), $arg[$i], $arg, $i+1 );
							else if( t0 = $fn[$v] ) return $dom = drill( $dom, $k ), t0( $dom, v );
						}
						$v = dom( $v );
						t0 = $dom.childNodes, ds0.length = i = t0.length;
						while( i-- ) ds0[i] = t0[i];
						if( j = ds0.length ){
							if( j - 1 < $k ) for( k = 0, l = $v.length ; k < l ; k++ ) $dom.appendChild( $v[k] );
							else for( i = 0, j = ds0.length ; i < j ; i++ ){
								if( i < $k ) $dom.appendChild( ds0[i] );
								else if( i == $k ) for( k = 0, l = $v.length ; k < l ; k++ ) $dom.appendChild( $v[k] );
								else $dom.appendChild( ds0[i+1] );
							}
						}else for( i = 0, j = $v.length ; i < j ; i++ ) $dom.appendChild( $v[i] );
					}else for( $v = dom( $v ), i = 0, j = $v.length ; i < j ; i++ ) $dom.appendChild( $v[i] );
				}else if( $v === null ){
					if( $k ) $fn._.call( childNodes( $dom.childNodes ), nodes[0] = nodes[$k], nodes.length = 1, nodes );
					else if( $dom.childNodes && childNodes( $dom.childNodes ).length ) $fn._.call( nodes );
				}else return childNodes( $dom.childNodes ), $k ? nodes[$k] : nodes;
			}
		},
		//12. define event
		ev = (function(){
			var k, ev, i, isChild;
			function ev$( $dom, $k, $v ){
				var t0;
				if( $v ) return ( $dom.bsE || ( $dom.bsE = new ev( $dom ) ) ).$( $k, $v );
				if( $v === undefined ) return ( t0 = $dom.bsE ) ? t0[$k] : $dom[$k];
				if( $v === null ) return ( t0 = $dom.bsE ) ? t0.$( $k, null ) : ( $dom[$k] = null );
			}
			for( k in doc ) k.substr(0,2) == 'on' ? ( i = 1,ev$[k.substr(2).toLowerCase()] = 1 ) : 0;
			for( k in doc.createElement('input') ) k.substr(0,2) == 'on' ? ( i = 1,ev$[k.substr(2).toLowerCase()] = 1 ) : 0;
			if( !i ){
				k = Object.getOwnPropertyNames(doc)
					.concat(Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(doc))))
					.concat(Object.getOwnPropertyNames(Object.getPrototypeOf(W))), i = k.length;
				while( i-- ) k[i].substr(0,2) == 'on' ? ( ev$[k[i].substr(2).toLowerCase()] = 1 ) : 0;
			}
			if( bs.DETECT.device =='tablet' || bs.DETECT.device=='mobile' ) ev$.down = 'touchstart', ev$.up = 'touchend', ev$.move = 'touchmove';
			else{
				isChild = function( $p, $c ){
					if( $c ) do if( $c == $p ) return 1; while( $c = $c.parentNode )
					return 0;
				}
				ev$.down = 'mousedown', ev$.up = 'mouseup', ev$.move = 'mousemove',
				ev$.rollover = function( $e ){if( !isChild( this, $e.event.fromElement || $e.event.relatedTarget ) ) $e.type = 'rollover', $e.RV.call( this, $e );},
				ev$.rollout = function( $e ){if( !isChild( this, $e.event.toElement || $e.event.explicitOriginalTarget ) ) $e.type = 'rollout', $e.RU.call( this, $e );};
				if( W['TransitionEvent'] && !ev$.transitionend ) ev$.transitionend = 1;
			}
			ev = ( function( ev$, x, y ){
				var ev, pageX, pageY, evType, prevent, keycode, add, del, eventName, isChild, keyName;
				if( bs.DETECT.browser == 'ie' && bs.DETECT.browserVer < 9 ) pageX = 'x', pageY = 'y';
				else pageX = 'pageX', pageY = 'pageY';
				if( W['addEventListener'] ) add = function($ev,$k){$ev.target.addEventListener( $k, $ev.listener, false );},
					del = function($ev,$k){$ev.target.removeEventListener( $k, $ev.listener, false );};
				else if( W['attachEvent'] ) add = function($ev,$k){$ev.target.attachEvent( 'on'+$k, $ev.listener );},
					del = function($ev,$k){$ev.target.detachEvent( 'on'+$k, $ev.listener );};
				else add = function($ev,$k){$ev.target['on'+$k] = $ev.listener;},
					del = function($ev,$k){$ev.target['on'+$k] = null;};
				evType = {'touchstart':2,'touchend':1,'touchmove':1,'mousedown':4,'mouseup':3,'mousemove':3,'click':3,'mouseover':3,'mouseout':3},
				bs.$static( 'KEYCODE', keycode = (function(){
					var t0, t1, i, j, k, v;
					t0 = 'a,65,b,66,c,67,d,68,e,69,f,70,g,71,h,72,i,73,j,74,k,75,l,76,m,77,n,78,o,79,p,80,q,81,r,82,s,83,t,84,u,85,v,86,w,87,x,88,y,88,z,90,back,8,tab,9,enter,13,shift,16,control,17,alt,18,pause,19,caps,20,esc,27,space,32,pageup,33,pagedown,34,end,35,home,36,left,37,up,38,right,39,down,40,insert,45,delete,46,numlock,144,scrolllock,145,0,48,1,49,2,50,3,51,4,52,5,53,6,54,7,55,8,56,9,57'.split(','),
					t1 = {}, keyName = {},
					i = 0, j = t0.length;
					while( i < j ) k = t0[i++], v = parseInt(t0[i++]), t1[k] = v, t1[v] = k, keyName[v] = k;
					return t1;
				})() ),
				(function(){
					eventName = {webkitTransitionEnd:'transitionend'};
				})(),
				ev = function( $dom ){
					var self;
					self = this,
					self.target = $dom,
					self.listener = function( $e ){
						var type, start, dx, dy, t0, t1, t2, id, i, j, X, Y;
						self.event = $e || ( $e = event ), self.type = eventName[$e.type] || $e.type, self.keyName = keyName[self.keyCode = $e.keyCode], self.value = $dom.value && bs.$trim( $dom.value );
						if( type = evType[self.type] ){
							dx = x( $dom ), dy = y( $dom );
							if( type < 3 ){
								t0 = $e.changedTouches, self.length = i = t0.length;
								while( i-- ) self[i] = t1 = t0[i], id = t1.identifier,
									self['lx'+id] = ( self['x'+id] = X = t1[pageX] ) - dx,
									self['ly'+id] = ( self['y'+id] = Y = t1[pageY] ) - dy,
									self['cx'+id] = t1.clientX, self['cy'+id] = t1.clientY,
									type == 2 ?
										( self['_x'+id] = X, self['_y'+id] = Y ) :
										( self['dx'+id] = X - self['_x'+id], self['dy'+id] = Y - self['_y'+id] );
								self.x = self.x0, self.y = self.y0, self.lx = self.lx0, self.ly = self.ly0, self.dx = self.dx0, self.dy = self.dy0, self.cx = self.cx0, self.cy = self.cy0;
							}else{
								self.length = 0,
								self.lx = ( self.x = $e[pageX] ) - dx, self.ly = ( self.y = $e[pageY] ) - dy,
								self.cx = $e.clientX, self.cy = $e.clientY,
								type == 4 ?
									( self._x = self.x, self._y = self.y ) :
									( self.dx = self.x - self._x, self.dy = self.y - self._y );
							}
						}
						t0 = self[self.type], t0.f.apply( t0.c, t0.a );
					};
				},
				ev.prototype.prevent = bs.DETECT.event ? function(){this.event.preventDefault(), this.event.stopPropagation();} :
					function( $e ){this.event.returnValue = false, this.event.cancelBubble = true;},
				ev.prototype.key = function( $key ){return this.keyCode == keycode[$key];},
				ev.prototype._ = function(){
					for( var k in this ) if( this.hasOwnProperty[k] && typeof this[k] == 'function' ) dom['on'+k] = null;
					return null;
				},
				ev.prototype.$ = function( $k, $v ){
					var t0, t1;
					t0 = $k;
					if( typeof ev$[$k] == 'string' ) $k = ev$[$k];
					if( $v === null ) del( this, $k ), delete this[$k], delete this.RV, delete this.RU;
					else if( $k == 'rollover' ) this.RV = $v, this.$( 'mouseover', ev$.rollover );
						else if( $k == 'rollout' ) this.RU = $v, this.$( 'mouseout', ev$.rollout );
					else if( !$k ) return;
					else{
						this['@'+$k] = t0, add( this, $k );
						if( typeof $v == 'function' ) this[$k] = {f:$v, c:this.target,a:[this]};
						else if( $v.splice ) this[$k] = {f:$v[1], c:$v[0], a:($v = $v.slice(1), $v[0] = this, $v)};
						else if( $v[t0] ) this[$k] = {f:$v[t0], c:$v, a:[this]};
					}
				};
				return ev;
			} )( ev$, x, y, isChild );
			return ev$;
		})(),
		//13. define WIN
		wine = (function( doc, ev ){
			var d, w, make;
			d = {}, w = {};
			make = function( $target, $data ){
				if( !$data.v ) $data.v = function( $e ){
					var t0, i, j;
					for( i = 0, j = $data.length ; i < j ; i++ ) t0 = $data[i], t0.f.apply( t0.c, t0.a );
				};
				return $data.v;
			};
			return function( e, k, v, t ){
				var t0, t1, i, j, target;
				if( t ) t0 = d, target = t;
				else t0 = w, target = W;
				if( v ){
					t0 = t0[e] || ( t0[e] = [] );
					ev( target, e, make( target, t0 ) );
					if( typeof v == 'function' ) t1 = {f:v, c:target, a:[target.bsE]};
					else if( v.splice ) t1 = {f:v[1], c:v[0], a:(v = v.slice(1), v[0] = target, v)};
					else if( v[e] ) t1 = {f:v[e], c:v, a:[target.bsE]};
					t0[t0.length] = t0[k] = t1;
				}else if( ( t0 = t0[e] ) && t0[k] ){
					t0.splice( t0.indexOf( t0[k] ), 1 );
					if( !t0.length ) ev( target, e, null );
				}
			};
		})( doc, ev ),
		hash = function( e, k, v ){
			var t0, old, w, h;
			t0 = hash.listener;
			if( v ){
				t0[t0.length] = t0[k] = v;
				if( !hash.id ){
					old = location.hash;
					hash.id = setInterval( function(){
						var t0, i, j;
						if( old != location.hash ){
							ev.type = 'hashchange'; ev.event = event, old = location.hash, t0 = hash.listener, i = t0.length;
							while( i-- ) t0[i]( ev );
						}
					}, 1 );
				}
			}else if( t0[k] ){
				t0.splice( t0.indexOf( t0[k] ), 1 );
				if( !t0.length ) clearInterval( hash.id ), hash.id = null;
			}
		}, hash.listener = [],
		sizer = function( $wh ){
			win.on( 'resize', 'wh', $wh );
			if( bs.DETECT.eventRotate ) win.on( 'orientationchange', 'wh', $wh );
			$wh();
		},
		bs.$static( 'WIN', win = {
			on:function( e, k, v ){
				if( e == 'hashchange' && !'onhashchange' in W ) return hash( e, k, v );
				if( e == 'orientationchange' && !'onorientationchange' in W ) return 0;
				if( e.substr(0,3) == 'key' ) return wine( e, k, v, doc );
				wine( e, k, v );
			},
			is:function( $sel ){
				var t0 = bs.$domquery( $sel );
				return t0 && t0.length;
			},
			scroll:(function( W, doc, root ){
				return function scroll(){
					switch( arguments[0].charAt(0) ){
					case'w': return root.scrollWidth;
					case'h': return root.scrollHeight;
					case'l': return doc.documentElement.scrollLeft || W.pageXOffset || 0;
					case't': return doc.documentElement.scrollTop || W.pageYOffset || 0;
					}
					W.scrollTo( arguments[0], arguments[1] );
				};
			})( W, doc, bs.DETECT.root ),
			w:0, h:0,
			sizer:(function( W, doc ){
				return function( $end ){
					var wh, r, s;
					if( !win.is( '#bsSizer' ) ) bs.dom( '<div></div>' ).$( '@id', 'bsSizer', 'display','none','width','100%','height','100%','position','absolute','<','body' );
					s = bs.dom('#bsSizer');
					switch( bs.DETECT.os ){
					case'iphone':
						s.$( 'display', 'block', 'height', '120%' ),
						W.onscroll = function( $e ){
							W.onscroll = null, W.scrollTo( 0, 0 ),
							s.$( 'display', 'none', 'height', W.innerHeight+1 ),
							sizer( function wh( $e ){$end( win.w = innerWidth, win.h = innerHeight );} );
						},
						W.scrollTo( 0, 1000 );
						break;
					case'android':case'androidTablet':
						if( bs.DETECT.sony && bs.DETECT.browser != 'chrome' ) sizer( function(){$end( win.w = s.$('w'), win.h = s.$('h') );} );
						else sizer( function wh(){$end( win.w = outerWidth, win.h = outerHeight + 1 );} );
						break;
					default:
						sizer( W.innerHeight === undefined ? function(){
								$end( win.w = doc.documentElement.clientWidth || doc.body.clientWidth,
									win.h = doc.documentElement.clientHeight || doc.body.clientHeight );
							} : function(){$end( win.w = W.innerWidth, win.h = W.innerHeight );}
						);
					}
				}
			})( W, doc )
		} );
	} ),
	bs.$static( 'KEY', (function(){
		var buffer, keycode;
		return keycode = bs.KEYCODE,
			bs.WIN.on( 'keydown', '@bsKD', function($e){buffer[keycode[$e.keyCode]] = 1;}),
			bs.WIN.on( 'keyup', '@bsKU', function($e){buffer[keycode[$e.keyCode]] = 0;}),
			buffer = {};
	})() );
}
function ANI(){
	bs.$static( 'ANI', ( function(){
		var style, timer, start, end, loop, ease, ANI, ani, len, time, isLive, isPause, tween, tweenPool;
		style = bs.style, bs.style = null, ani = [], time = len = 0,
		timer = W['requestAnimationFrame'] || W['webkitRequestAnimationFrame'] || W['msRequestAnimationFrame'] || W['mozRequestAnimationFrame'] || W['oRequestAnimationFrame'];
		if( timer ){
			start = function(){if( !isLive ) isPause = 0, isLive = 1, loop();},
			end = function(){len = ani.length = isLive = 0;},
			timer( function( $time ){time = Date.now() - $time;} ),
			loop = function( $time ){
				var t, i, j;
				if( isPause || !isLive ) return;
				t = $time + time, i = len;
				while( i-- ) if( ani[i].ANI(t) ) len--, ani.splice( i, 1 );
				ani.length ? timer( loop ) : end();
			};
		}else{
			start = function start(){if( !isLive ) isLive = setInterval( loop, 17 );},
			end = function end(){if( isLive ) clearInterval( isLive ), ani.length = isLive = 0;},
			loop = function loop(){
				var t, i;
				if( !isPause && isLive ){
					t = +new Date, i = len;
					while( i-- ) if( ani[i].ANI(t) ) len--, ani.splice( i, 1 );
					ani.length ? 0 : end();
				}
			};
		}
		ease = (function(){
			var PI, HPI;
			PI = Math.PI, HPI = PI * .5;
			return {//rate,start,term
				linear:function(a,c,b){return b*a+c},
				backIn:function(a,c,b){return b*a*a*(2.70158*a-1.70158)+c},
				backOut:function(a,c,b){a-=1;return b*(a*a*(2.70158*a+1.70158)+1)+c},
				backInOut:function(a,c,b){a*=2;if(1>a)return 0.5*b*a*a*(3.5949095*a-2.5949095)+c;a-=2;return 0.5*b*(a*a*(3.70158*a+2.70158)+2)+c},
				bounceIn:function(a,c,b,d,e){return b-ease[3]((e-d)/e,0,b)+c},
				bounceOut:function(a,c,b){if(0.363636>a)return 7.5625*b*a*a+c;if(0.727272>a)return a-=0.545454,b*(7.5625*a*a+0.75)+c;if(0.90909>a)return a-=0.818181,b*(7.5625*a*a+0.9375)+c;a-=0.95454;return b*(7.5625*a*a+0.984375)+c},
				bounceInOut:function(a,c,b,d,e){if(d<0.5*e)return d*=2,0.5*ease[13](d/e,0,b,d,e)+c;d=2*d-e;return 0.5*ease[14](d/e,0,b,d,e)+0.5*b+c},
				sineIn:function(a,c,b){return -b*Math.cos(a*HPI)+b+c},
				sineOut:function(a,c,b){return b*Math.sin(a*HPI)+c},
				sineInOut:function(a,c,b){return 0.5*-b*(Math.cos(PI*a)-1)+c},
				circleIn:function(a,c,b){return -b*(Math.sqrt(1-a*a)-1)+c},
				circleOut:function(a,c,b){a-=1;return b*Math.sqrt(1-a*a)+c},
				circleInOut:function(a,c,b){a*=2;if(1>a)return 0.5*-b*(Math.sqrt(1-a*a)-1)+c;a-=2;return 0.5*b*(Math.sqrt(1-a*a)+1)+c},
				quadraticIn:function(a,c,b){return b*a*a+c},
				quadraticOut:function(a,c,b){return -b*a*(a-2)+c}
			};
		})();
		tweenPool = {length:0}, tween = function(){},
		(function(){
			var t0, i;
			t0 = 'id,time,ease,delay,loop,end,update,native'.split(','), i = t0.length;
			while( i-- ) tween[t0[i]] = 1;
		})(),
		tween.prototype.init = function( $arg ){
			var t0, l, i, j, k, v, isDom, v0;
			this.t = t0 = $arg[0].nodeType == 1 ? bs.dom( $arg[0] ) : $arg[0], this.isDom = isDom = ( t0.instanceOf == bs.dom ),
			this.delay = this.stop = this.pause = 0, this.id = this.end = this.update = null, this.ease = ease.linear,
			this.time = 1000, this.timeR = .001, this.loop = this.loopC = 1, this.length = l = t0.length || 1;
			while(l--) ( this[l] ? (this[l].length=0) : (this[l]=[]) ), ( this[l][0] = isDom ? t0[l].bsS : (t0[l] || t0) );
			i = 1, j = $arg.length;
			while( i < j ){
				k = $arg[i++], v = $arg[i++];
				if( tween[k] ){
					if( k == 'time' ) this.time = parseInt(v*1000), this.timeR = 1/this.time;
					else if( k == 'ease' ) this.ease = ease[v];
					else if( k == 'delay' ) this.delay = parseInt(v*1000);
					else if( k == 'loop' ) this.loop = this.loopC = v;
					else if( k == 'end' || k == 'update' ) this[k] = v;
					else if( k == 'id' ) this.id = v;
				}else{
					l = this.length;
					while( l-- ) this[l].push( isDom ? style[k] : k, v0 = isDom ? this[l][0].$g( k ) : this[l][0][k], v - v0 );
				}
			}
			this.stime = Date.now() + this.delay, this.etime = this.stime + this.time,
			this.ANI = isDom ? ANIstyle : ANIobj, ani[ani.length] = this, start();
		};
		function ANIstyle( $time, $pause ){
			var t0, t1, term, time, rate, i, j, l, k, v, e, s, u;
			if( this.stop ) return 1;
			if( $pause )
				if( $pause == 1 && this.pause == 0 ) return this.pause = $time, 0;
				else if( $pause == 2 && this.pause ) t0 = $time - this.pause, this.stime += t0, this.etime += t0, this.pause = 0;
			if( this.pause || ( term = $time - this.stime ) < 0 ) return;
			e = this.ease, time = this.time, rate = term * this.timeR, l = this.length, j = this[0].length;
			if( term > this.time )
				if( --this.loopC ) return this.stime=$time+this.delay,this.etime=this.stime+this.time,0;
				else{
					while( l-- ){
						t0 = this[l], t1 = this[l][0], s = t1.s, u = t1.u, i = 1;
						while( i < j ) k = t0[i++], v = t0[i++] + t0[i++],
							typeof k == 'function' ? k( t1, v ) : s[k] = v + u[k], t1[k] = v;
					}
					if( this.end ) this.end( this.t );
					tweenPool[tweenPool.length++] = this;
					return 1;
				}
			while( l-- ){
				t0 = this[l], t1 = this[l][0], s = t1.s, u = t1.u, i = 1;
				while( i < j ) k = t0[i++], v = e( rate, t0[i++], t0[i++], term, time ),
					typeof k == 'function' ? k( t1, v ) : s[k] = v + u[k], t1[k] = v;
			}
			if( this.update ) this.update( rate, $time, this );
		}
		function ANIobj( $time, $pause ){
			var t0, t1, term, time, rate, i, j, l, k, v, e;
			if( this.stop ) return 1;
			if( $pause )
				if( $pause == 1 && this.pause == 0 ) return this.pause = $time, 0;
				else if( $pause == 2 && this.pause ) t0 = $time - this.pause, this.stime += t0, this.etime += t0, this.pause = 0;
			if( this.pause ) return;
			if( ( term = $time - this.stime ) < 0 ) return;
			e = this.ease, time = this.time, rate = term * this.timeR, l = this.length, j = this[0].length;
			if( term > this.time )
				if( --this.loopC ) return this.stime=$time+this.delay,this.etime=this.stime+this.time,0;
				else{
					while( l-- ){
						t0 = this[l], t1 = this[l][0], i = 1;
						while( i < j ) t1[t0[i++]] = t0[i++] + t0[i++];
					}
					tweenPool[tweenPool.length++] = this;
					if( this.end ) this.end( this.t );
					return 1;
				}
			while( l-- ){
				t0 = this[l], t1 = this[l][0], i = 1;
				while( i < j ) t1[t0[i++]] = e(rate,t0[i++],t0[i++],term,time);
			}
			if( this.update ) this.update( rate, $time, this );
		}
		return ANI = {
			ani:function( $ani ){if( $ani.ANI ) ani[ani.length] = $ani,start(), len++;},
			tween:function(){
				var t0 = tweenPool.length ? tweenPool[--tweenPool.length] : new tween;
				return t0.init( arguments ), len++, t0;
			},
			tweenStop:function(){
				var t0, i, j, k;
				i = len, j = arguments.length;
				while( i-- ){
					t0 = ani[i], k = j;
					while( k-- ) if( t0.id == arguments[k] || t0.isDom && t0.t[0] == arguments[k] ) tweenPool[tweenPool.length++] = t0, t0.stop = 1, len--, ani.splice( i, 1 );
				}
			},
			tweenPause:function(){
				var t0, t, i, j, k;
				t = Date.now(), i = len, j = arguments.length;
				while( i-- ){
					t0 = ani[i], k = j;
					while( k-- ) if( t0.id == arguments[k] || t0.isDom && t0.t[0] == arguments[k] ) t0.ANI( t, 1 );
				}
			},
			tweenResume:function(){
				var t0, t, i, j, k;
				t = Date.now(), i = len, j = arguments.length;
				while( i-- ){
					t0 = ani[i], k = j;
					while( k-- ) if( t0.id == arguments[k] || t0.isDom && t0.t[0] == arguments[k] ) ani[i].ANI( t, 2 );
				}
			},
			tweenToggle:function(){
				var t0, t, i, j, k;
				t = Date.now(), i = len, j = arguments.length;
				while( i-- ){
					t0 = ani[i], k = j;
					while( k-- ) if( t0.id == arguments[k] || t0.isDom && t0.t[0] == arguments[k] ) ani[i].ANI( t, ani[i].pause ? 2 : 1 );
				}
			},
			pause:function(){
				var i, t;
				isPause = 1, t = Date.now(), i = len;
				while( i-- ) ani[i].ANI( t, 1 );
			},
			resume:function(){
				var i, t;
				isPause = 0, t = Date.now(), i = len;
				while( i-- ) ani[i].ANI( t, 2 );
				loop();
			},
			toggle:function(){return isPause ? ANI.resume() : ANI.pause(), isPause;},
			stop:function(){end();},
			delay:(function(){
				var delay = [];
				return function( $f ){
					var i;
					if( (i = delay.indexOf( $f ) ) == -1 ) delay[delay.length] = $f, $f.bsDelay = setTimeout( $f, ( arguments[1] || 1 ) * 1000 );
					else delay.splice( i, 1 ), clearTimeout( $f.bsDelay ), delete $f.bsDelay;
				};
			})()
		};
	})() );
}
id = setInterval( function(){
	var start, i;
	switch( i = document.readyState ){
	case'complete':case'loaded':break;
	case'interactive':if( document.documentElement.doScroll ) try{document.documentElement.doScroll('left');}catch(e){return;}
	default:return;}
	clearInterval( id ), start = function(){for( var i = 0, j = que.length ; i < j ; i++ ) que[i](); que = null;},
	DETECT(), DOM(), ANI(), im.length ? ( im.unshift( start ), bs.$importer.apply( null, im ), im.length = 0 ) : start();
}, 1 );
})( doc, bs );

} )( this );