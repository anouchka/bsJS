if( bs.site ){
	bs.$register( 'class', 'fb', function( $fn, bs ){
		var key, i;
		key = 'login,logout,appid,secret,redirect'.split(',');
		i = key.length;
		while( i-- ) key[key[i]] = 1;
		$fn.constructor = function( $sel ){this.ck = 'fbatk_' + $sel;},
		$fn.$ = function(){
			var i, j, k, v;
			i = 0, j = arguments.length;
			while( i < j ){
				if( key[k = arguments[i++]] ){
					v = arguments[i++];
					if( v === null ) delete this[k];
					else if( v === undefined ) return this[k];
					else this[k] = v;
				}else return console.log( 'fb undefined key:' + k );
			}
		},
		$fn.start = function( $code ){
			console.log('f1',bs.WEB.get('code'),'::::');
			if( this.token || bs.$ck( this.ck ) || ( $token = bs.WEB.request('access_token') ) ) this.profile( $token ), console.log('f2');
			else if( $code = bs.WEB.get('code') ) bs.WEB.redirect( 'https://graph.facebook.com/oauth/access_token?client_id='+this.appid+
				'&redirect_uri='+bs.$escape( this.redirect )+'&client_secret='+this.secret+'&code='+$code, 1 ), console.log('f3');
			else this.logout( 'http://www.facebook.com/dialog/oauth/?client_id=' + this.appid + '&redirect_uri=' + bs.$escape( this.redirect ) ), console.log('f4');
		},
		$fn.profile = function( $token ){
			var t0, self;
			self = this;
			bs.$get( function( $data ){
				if( !$data ) $disconn( 'http://www.facebook.com/dialog/oauth/?client_id=' + self.appid + '&redirect_uri=' + bs.$escape( this.redirect ) );
				t0 = JSON.parse( $data ),
				bs.$get( function( $data ){
					bs.$ck( self.ck, self.token = $token ), t0.url = JSON.parse( $data ).data.url, self.login( t0 );
				}, 'https://graph.facebook.com/'+t0.id+'/picture?access_token='+$token );
			}, 'https://graph.facebook.com/me?access_token='+$token );	
		};
	}, 1.0 );
}else{
	bs.$register( 'static', 'fb', (function(){
		var fb, toStr;
		toStr = function(){return Array.prototype.join.call( this, ',' );};
		fb = {};
		fb.$ = function(){
			var i, j, k, v;
			i = 0, j = arguments.length;
			while( i < j ){
				k = arguments[i++], v = arguments[i++];
				switch( k ){
				case'appid':case'secret':case'rediect':fb[k]=v;break;
				}
			}
		};
		fb.start = function( $appid, $conn, $disconn, $clear ){
			var res, logined;
			res = function( $res ){
				if( $res.status == 'connected' ){
					if( !logined ) logined = 1, FB.api( '/me', function( $res0 ){
						FB.api( $res0.id + '/picture', function( $res1 ){
							$res0.url = $res1.data.url, fb.res = $res0
							if( typeof $clear == 'function' ) $clear( $res.status, $conn, $disconn );
							$conn( $res0, $conn, $disconn );
						} );
					} );
				}else if( logined || logined === undefined ){
					if( typeof $clear == 'function' ) $clear( $res.status, $conn, $disconn );
					logined = 0, $disconn( $res.status, $conn, $disconn );
				}
			};
			if( !window.fbAsyncInit ) window.fbAsyncInit = function(){
				FB.init({appId:$appid,status:true,cookie:true,xfbml:true }),
				FB.Event.subscribe('auth.authResponseChange', res ),
				FB.getLoginStatus( res );
			};
			if( !bs.WIN.is( '#facebook-jssdk' )	) bs.$js( function(){}, '//connect.facebook.net/en_US/all.js' );
		},
		fb.login = function(){FB.login();}, fb.logout = function(){FB.logout();};
		return fb;
	})(), 1.0 );
}