import { getAccessToken } from "./tokenService.js";


const API = axios.create({
    baseURL: `http://localhost:3002`,
})
API.interceptors.request.use((config)=>{
    const token = getAccessToken();

    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }

    return config;
})
const Post = async (url,body)=>{
   try{
      let req =  await API.post(url,body);

        let res = await  req.data
        
        return res;
   }catch(error){
    console.log(error.response.data)
    return {success : false, message : error.response.data.message}
   }
    
}

const Get = async (url)=>{
    let res
   try{
      let req =  await API.get(url)

        res = req.data;
        return res;
   }catch(error){
    console.log(error)
   }
   finally{
    console.log(res)
   }
    
}

export {Get, Post}



