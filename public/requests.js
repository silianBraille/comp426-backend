//Send an axios request to create a new user.
//url is path to backend server. port is corresponding port.
//name is username of new user.
//pass is password of new user.
//extra is an object containing extra data to use later on if need be.
const createAccount = async function(url, port, name, pass, extra) {
    const createdResult = await axios({
	method: "post",
	url: `http://${url}:${port}/account/create`,
	data: {
	    "name": name,
	    "pass": pass,
	    "data": extra
	},
    });

    return createdResult;
}

//Log in as a user using information created in the database
//with createAccount. Returns a response object consisting of
//a jwt, the "extra" data, and the username.
const loginAccount = async function(url, port, name, pass) {
    const loggedInResult = await axios({
	method: "post",
	url: `http://${url}:${port}/account/login`,
	data: {
	    "name": name,
	    "pass": pass
	},
    });

    /*Stores cookie in browser to keep login session alive
      Retrieve by settings some variable equal to document.cookie*/
    document.cookie = `jwt=${loggedInResult.data.jwt}`;
    return loggedInResult;
}

/* Acquire information about logged in user by having them
supply the jwt token returned upon login.*/
const statusAccount = async function(url, port, token) {
    const statusResult = await axios({
	url: `http://${url}:${port}/account/status`,
	method: 'get',
	headers: {"Authorization": `Bearer ${token}`}
    });

    return statusResult;
}

/*Sends a GET request to retrieve data from a data store.
The only new parameter is willGetChildren, which is a boolean
that specifies if you want to include the descendants of your
target loc in the result.*/
const getData = async function(url, port, loc, willGetChildren) {
    let boolStr = '/';
    if (willGetChildren) boolStr = '';
    const getDataResult = await axios({
	url: `http://${url}:${port}/${loc}${boolStr}`,
	method: 'GET',
    });

    return getDataResult;
}

const getPrivateData = async function(url, port, loc, willGetChildren, token) {
    let boolStr = '/';
    if (willGetChildren) boolStr = '';
    const getDataResult = await axios({
	url: `http://${url}:${port}/${loc}${boolStr}`,
	method: 'GET',
	headers: {"Authorization": `Bearer ${token}`},
    });

    return getDataResult;
}

//Use method if storing data behind private/user data store/a data store that requires
//a jwt.
const postPrivateData = async function(url, port, loc, dataToStore, token) {
	// use this to post favorited recipes.
	// loc is user/favorites key is favorites. Value is data to store.
	// data to store is user/favorites/keyOfObjectToEdit
	// How to get JWT: document.cookie/slice(4)
    const postedDataResult = await axios ({
	url: `http://${url}:${port}/${loc}`,
	method: 'POST',
	data: {"data": dataToStore},
	headers: {"Authorization": `Bearer ${token}`},
    });

    return postedDataResult;
}

export { createAccount, loginAccount, statusAccount, getData, getPrivateData, postPrivateData };
