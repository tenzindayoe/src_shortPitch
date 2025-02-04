
import React from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
const GoogleAuth = () => {
 const clientId = "578080255416-c7npnfjatggji7irvicl84dhifugss87.apps.googleusercontent.com";
  return (
   <GoogleOAuthProvider clientId={clientId}>
     <GoogleLogin
       onSuccess={credentialResponse => {
         console.log(credentialResponse);
       }}
       onError={() => {
         console.log('Login Failed');
       }}
     />
   </GoogleOAuthProvider>
   );
 };
export default GoogleAuth;