const setAccessToken = (token) =>{
    localStorage.setItem('skimpy', token)
}

const getAccessToken = ()=>{
    return localStorage.getItem('skimpy')
}

const removeAccessToken = ()=>{
    localStorage.removeItem('skimpy')
}


export {setAccessToken,getAccessToken,removeAccessToken}