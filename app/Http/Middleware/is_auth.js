module.exports = (req,res,next) => {
    if(req.session.isLoggedIn)
        next();
    else
        res.send('Not Authorized');
}