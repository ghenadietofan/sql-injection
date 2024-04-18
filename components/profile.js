import {session} from 'app'

window.onload(()=>{
    console.log('ready');
    document.getElementById('profile-header').innerText += session.username;

})
function logout(){
    console.log('logout')
    console.log(session);
}