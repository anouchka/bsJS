/*
 * bsNode - OpenSource Node.js web framework
 * version 0.1.0 / 2013.12.4 by projectBS committee
 * 
 * Copyright 2013.10 projectBS committee.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * GitHub: https://github.com/projectBS/bsJS
 * Facebook group: https://www.facebook.com/groups/bs5js/
 */
exports.core = function( bs ){
	var http = require('http');
	bs.$class( 'sql', function( $fn, bs ){
		$fn.$ = function(){
			var i, j, k, v, t0;
			i = 0, j = arguments.length;
			while( i < j ){
				k = arguments[i++], v = arguments[i++];
				if( v === undefined ) return this[k];
				if( k == 'run' ){
					t0 = v ? bs.$tmpl( this.query, v ) : this.query;
					if( this.type == 'record' ) return bs.db( this.db ).$( 'record', t0, arguments[i++] );
					return bs.db( this.db ).$( 'rs', t0, arguments[i++] );
				}else this[k] = v;
			}
		};
	} ),
	bs.$class( 'db', (function(){
		var db = {
			mysql:(function(){
				var d, mysql;
				return d = function(){},
				d.prototype.open = function(){
					var t0;
					t0 = this;
					if( !this.__conn ) this.__conn = ( mysql || ( mysql = require( 'mysql' ) ) ).createConnection( this ),
						this.__conn.on( 'error', function( $e ){if( $e.code === 'PROTOCOL_CONNECTION_LOST') t0._conn = null;} );
					return this.__conn;
				},
				d.prototype.close = function(){this.__conn.destroy();},
				d.prototype.$ = function( $arg ){
					var t0, t1, i, j, k, v;
					i = 0, j = $arg.length;
					while( i < j ){
						k = $arg[i++], v = $arg[i++];
						if( k == null ){
							if( this.__conn ) this.close();
							return delete db[this.sel];
						}
						if( v === undefined ) return k == 'url' ? this.host + ':' + this.port :
							k == 'id' ? this.user :
							k == 'pw' ? this.password :
							k == 'db' ? this.database :
							k == 'open' ? this.open() :
							k == 'close' ? this.close() :
							k == 'rollback' ? this.__conn && this.__conn.rollback() :
							k == 'commit' ? this.__conn && this.__conn.commit() : 0;
						else switch( k ){
							case'url':v = v.split(':'), this.host = v[0], this.port = v[1]; break;
							case'id':this.user = v; break;
							case'pw':this.password = v; break;
							case'db':this.database = v; break;
							default:
								t0 = this.open();
								switch( k ){
								case'ex':return t0.query( v );
								case'rs':return t1 = arguments[i++], t0.query( v, function( e, r ){e ? t1( null, e ) : t1( r );} );
								case'record':return t1 = arguments[i++], t0.query( v ).on('result', function( r ){t1( r );} );
								}
								throw 1;
						}
					}
				}, d;
			})()
		};
		return function( $fn, bs ){
			$fn.constructor = function( $sel ){
				var i, type;
				if( i = $sel.indexOf( '@' ) ) $sel = $sel.substring( 0, i ), type = $sel.substr( i );
				this.__db = new db[$type||'mysql'];
			},
			$fn.$ = function(){return this.__db.$( arguments );},
			$fn.open = function(){return this.__db.open();},
			$fn.close = function(){return this.__db.close();};
		};
	})() );
	bs.$method( 'os', (function(){
		var os = require('os');
		return function( $k ){return os[$k]();};
	})() ),
	bs.$method( 'url', (function(){
		var url = require('url');
		return function( $url ){return url.parse( $url );};
	})() ),
	(function(){
		var query = require('querystring');
		bs.$method( 'escape', function( $val ){return query.escape( $val );} ),
		bs.$method( 'unescape', function( $val ){return query.unescape( $val );} ),
		bs.$method( 'cgiParse', function( $val ){return query.parse( $val );} ),
		bs.$method( 'cgiStringify', function( $val ){return query.stringify( $val );} );
	})();
	bs.$method( 'crypt', (function(){
		var crypto = require('crypto');
		return function( $type, $v ){
			var t0;
			switch( $type ){
			case'sha256': return t0 = crypto.createHash('sha256'), t0.update( $v ), t0.digest('hex');
			}
		};
	})() ),
	(function( http ){
		var fs, p, response;
		fs = require('fs'), p = require( 'path' ), response = function( rs ){
			var t0 = '';
			rs.on( 'data', function( $data ){t0 += $data;} ),
			rs.on( 'end', function(){$end(t0);} );
		},
		
		function path(){
		}
		_getPath = (function(){
                var t0;
                if( isLocal ) return t0 = , function(opts, fname){return t0.join( opts.settings.views, fname );};
                else return function(opts, fname){return fname;};
        })();
		function _renderFile(path, opts){
                return _render( opts.cache ? cache[path] || ( cache[path] = _reader( path ) ) : _reader( path ), opts, null, path );
        }
                if( isLocal ) return rq = require( 'fs' ), function(path){return rq.readFileSync( path, 'utf8' );};

        })();
		
		bs.$method( 'stream', function( $path ){
		} ),
		bs.$method( 'get', function( $end, $path ){
			var t0;
			if( t0.substr( 0, 5 ) == 'http:' ){
				if( !$end ) return console.log( '$get need callback!' ), null;
				http.request( ( t0=bs.$url( $path ), t0.method='GET', t0 ), response ).on('error', function($e){$end( null, $e );});
			}else{
				t0 = t0.path.replace( freg, '$1' );
				if( !$end ) return fs.existsSync( t0 ) ? fs.readFileSync( t0 ) : null;
				fs.exists( t0, function( $ex ){
					if( !$ex ) return $end( null );
					fs.readFile( t0, function( $e, $d ){
						if( $e ) return $end( $e );
						return $end( $d );
					});
				});
			}
		} ),
		bs.$method( 'post', function( $end, $path ){
			http.request( ( t0=bs.$url( $path ), t0.method='POST', t0 ), response ).on('error', function($e){$end( null, $e );});
		} ),
		bs.$method( 'put', function( $end, $path ){
			http.request( ( t0=bs.$url( $path ), t0.method='PUT', t0 ), response ).on('error', function($e){$end( null, $e );});
		} ),
		bs.$method( 'delete', function( $end, $path ){
			http.request( ( t0=bs.$url( $path ), t0.method='DELETE', t0 ), response ).on('error', function($e){$end( null, $e );});
		} );
	})( http ),
	(function(){
		var http, form, sort, next, flush,
			application,
			session, sessionName, id,
			cookie, clientCookie, ckParser,
			head, response, rq, rp, getData, postData, postFile,
			data, 
			staticRoute, mimeTypes,
			err;
		form = require( 'formidable' ),
		//base
		sort = function( a, b ){return a = a.length, b = b.length, a > b ? 1 : a == b ? 0 : -1;},
		bs.$next = function(){next();},
		bs.$flush = flush = function(){
			var t0, k;
			for(k in cookie) head[head.length] = ['Set-Cookie', cookie[k]];
			head.push( flush[0], flush[1], ( t0 = response.join(''), flush[2][1] = Buffer.byteLength( t0, 'utf8' ), flush[2] ) ),
			rp.writeHead( 200, head ), rp.end( t0 );
		},
		flush[0] = ['Server', 'projectBS on node.js'],
		flush[1] = ['Content-Type', 'text/html; charset=utf-8'],
		flush[2] = ['Content-Length', 0],
		//application
		bs.$application = bs.$app = application = function( $k, $v ){return $v === undefined ? application[$k] : application[$k] = $v;},
		//session
		sessionName = '__bsNode', id = 0,
		bs.$session = bs.$se = session = function( $k, $v ){
			var t0;
			t0 = bs.$ck( sessionName );
			if( $v === undefined ){
				if( t0 && ( t0 = session[t0] ) ) return t0[$k];
			}else{
				if( !t0 ) bs.$ck( '@'+sessionName, t0 = bs.$crypt( 'sha256', ''+bs.$ex( 1000,'~',9999 ) + (id++) + bs.$ex( 1000,'~',9999 ) ) );
				if( !session[t0] ) session[t0] = {};
				return session[t0][$k] = $v;
			}
		},
		//cookie
		clientCookie = null,
		ckParser = function(){
			var t0, t1, i;
			clientCookie = {};
			if( t0 = rq.headers.cookie ){
				t0 = t0.split(';'), i = t0.length;
				while( i-- ) t0[i] = bs.$trim( t0[i].split('=') ), clientCookie[t0[i][0]] = t0[i][1];
			}
		},
		bs.$cookie = bs.$ck = function( $k, $v, $path, $expire, $domain ){
			var t0, t1;
			if( $v === undefined ) return clientCookie[$k];
			if( $k.charAt(0) == '@' ) t0 = 1, $k = $k.substr(1);
			t0 = $k + '=' + ( bs.$escape($v) || '' ) + 
				';Path=' + ( $path || '/' ) + 
				( t0 ? ';HttpOnly' : '' ) + 
				( $domain ? ';Domain=' + $domain : '' );
			if( $v === null ) (t1 = new Date).setTime( t1.getTime() - 86400000 ),
				t0 += ';expires=' + t0.toUTCString() + ';Max-Age=0';
			else if( $expire ) (t1 = new Date).setTime( t1.getTime() + $expire * 86400000 ),
				t0 += ';expires=' + t1.toUTCString() + ';Max-Age=' + ( $expire * 86400 );
			cookie[$k] = t0;
		},
		//head, request, response
		head = [], response = [],
		bs.$head = function( $k, $v ){head[head.length] = [$k, $v];},
		bs.$method = function(){return rq.method.toLowerCase();},
		bs.$request = bs.$rq = function( $k ){return $k ? rq[$k] : rq;},
		bs.$requestGet = bs.$rqG = function( $k ){return getData[$k];},
		bs.$requestPost = bs.$rqP = function( $k ){return postData[$k];},
		bs.$requestFile = bs.$rqF = function( $k ){return postFile[$k];},
		bs.$response = bs.$rp = function(){
			var i, j;
			for( i = 0, j = arguments.length ; i < j ; i++ ) response[response.length] = arguments[i];
		},
		//data
		bs.$data = function( $k, $v ){return $v === undefined ? data[$k] : data[$k] = $v;},
		//error
		err = function( $code, $v ){rp.writeHead( $code, (staticRoute['Content-Type'] = 'text/html', staticRoute) ), rp.end( $v || '' );},
		//route
		staticRoute = {'Content-Type':0}, mimeTypes = require('./bsnode.mime.types'),
		bs.$route = function( $data ){
			var port, root, index, config, table, rules, rule, currRule, postForm, 
				router, nextstep, fullPath, path, file, ext, log, idx, onData, k;
			postForm = new form.IncomingForm,
			postForm.encoding = 'utf-8',
			postForm.keepExtensions = true;
			if( $data.upload ) postForm.uploadDir = $data.upload;
			if( $data.maxsize ) postForm.maxFieldsSize = parseInt( $data.maxsize * 1024 * 1024 );		
			root = $data.root, index = $data.index || 'index.bs', config = $data.config ? root+'/'+$data.config : 0,
			table = $data.table, rules = [], rule = $data.rules;
			for( k in table ) table[k] = root+'/'+table[k];
			for( k in rule ) rules[rules.length] = k;
			rules.sort( sort ),
			nextstep = function(){
				var t0, i;
				if( idx < currRule.length ){
					i = currRule[idx++];
					if( !require( 
						log = i == 'absolute' ? root + '/' + currRule[idx++] :
						i == 'relative' ? root + path + currRule[idx++] :
						i == 'head' ? ( t0 = file.split('.'), root + path + currRule[idx++] + t0[0] + '.' + t0[1] ) :
						i == 'tail' ? ( t0 = file.split('.'), root + path + t0[0] + currRule[idx++] + '.' + t0[1] ) :
						i == 'url' ? root + path + file : 0
					).bs( bs ) ) nextstep();
				}else flush();
			},
			router = function(){
				var t0, i;
				try{
					if( config ) require( log = config ).bs( bs );
					if( t0 = table[fullPath] ) require( log = t0 ).bs( bs ), flush();
					else{
						i = rules.length;
						while( i-- ) if( path.indexOf( rules[i] ) > -1 ) return currRule = rule[rules[i]], idx = 0, ( next = nextstep )();
						throw 1;
					}
				}catch( $e ){
					err( 500, '<h1>server error</h1><div>Error: '+$e+'</div><div>fullpath: '+fullPath+'<br>path: '+path+'<br>file: '+file+'<br>log: '+log +'</div>' );
				}
			},
			onData = function( $e, $data, $file ){
				if( $e ) err( 500, 'post Error' + $e );
				else postData = $data, postFile = $file, router();
			},
			port = http.createServer( function( $rq, $rp ){
				var t0, i, j;
				rq = $rq, rp = $rp, t0 = bs.$url( $rq.url ),
				getData = bs.$cgiParse( t0.query ), postData = postFile = null, 
				fullPath = path = t0.pathname,
				i = path.lastIndexOf( '/' ) + 1, ext = 'bs';
				if( path.substr( path.length - 1 ) == '/' ) path = path.substring( 0,  i ), file = index;
				else{
					t0 = path.substring( i );
					if( ( j = t0.indexOf( '.' ) ) > -1 ){
						file = t0, path = path.substring( 0, i );
						if( ( ext = t0.substr( j + 1 ) ) != 'bs' ){
							if( t0 = bs.$get( null, 'file://'+__dirname+'/'+root+fullPath ) ) rp.writeHead( 200, ( staticRoute['Content-Type'] = mimeTypes[ext] || 'Unknown type', staticRoute ) ), $rp.end( t0 );
							else err( 404, 'no file<br>file://'+ root+fullPath);
							return;
						}
					}else path += '/', file = index;
				}
				ckParser(), head.length = response.length = 0, data = {}, cookie = {};
				if( bs.$method() == 'get' ) router();
				else postForm.parse( $rq, onData );
			}).listen( $data.port || 80 );
			console.log('server started with port ' + ($data.port || 80)); 
		};
	})();

};