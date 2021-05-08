/* io.use(function(socket, next) {

    try{
        var data = socket.handshake || socket.request;
        console.log('P1');
        if (! data.headers.cookie) {
            return next(new Error('Missing cookie headers'));
        }
        console.log('P2');
        console.log('cookie header ( %s )', JSON.stringify(data.headers.cookie));
        var cookies = cookie.parse(data.headers.cookie);
        console.log('cookies parsed ( %s )', JSON.stringify(cookies));

        if (! cookies[COOKIE_ID_NAME]) {
            return next(new Error('Missing cookie ' + COOKIE_ID_NAME));
        }
        var sid = cookieParser.signedCookie(cookies[COOKIE_ID_NAME], COOKIE_SECRET);
        if (! sid) {
            return next(new Error('Cookie signature is not valid'));
        }
        console.log('session ID ( %s )', sid);
        data.sid = sid;
        sessionStore.get(sid, function(err, session) {
        if (err) return next(err);
        if (! session) return next(new Error('session not found'));
        data.session = session;
        
        next();
}
);

    } catch (err) {
        console.error(err.stack);
        next(new Error('Internal server error'));
    }
}); */